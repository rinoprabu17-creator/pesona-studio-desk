import { existsSync, readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const requiredPaths = [
  "docker-compose.dev.yml",
  ".env.example",
  ".env.local.example",
  "README.local.md",
  "docs/PHASE_2A_PLAN.md",
  "package.json",
  "package-lock.json",
  "apps/web/Dockerfile",
  "apps/web/src/server.ts",
  "apps/web/src/db.ts",
  "apps/web/src/library-service.ts",
  "apps/web/src/campaign-service.ts",
  "apps/web/src/campaign-errors.ts",
  "apps/web/src/campaign-plan-run-service.ts",
  "apps/web/src/campaign-plan-run-errors.ts",
  "apps/web/src/campaign-plan-review-service.ts",
  "apps/web/src/campaign-plan-review-errors.ts",
  "apps/web/src/campaign-plan-import-service.ts",
  "apps/web/src/campaign-plan-import-errors.ts",
  "apps/web/src/content-item-service.ts",
  "apps/web/src/content-item-errors.ts",
  "apps/web/src/content-publication-service.ts",
  "apps/web/src/content-publication-errors.ts",
  "apps/web/src/content-calendar-service.ts",
  "apps/web/src/content-calendar-errors.ts",
  "apps/web/src/http/request.ts",
  "apps/web/src/http/response.ts",
  "apps/web/src/routes/content-calendar-api-routes.ts",
  "apps/web/src/routes/content-calendar-page-routes.ts",
  "apps/web/src/routes/campaign-api-routes.ts",
  "apps/web/src/routes/campaign-page-routes.ts",
  "apps/web/src/routes/campaign-plan-run-api-routes.ts",
  "apps/web/src/routes/campaign-plan-run-page-routes.ts",
  "apps/web/src/routes/campaign-plan-review-api-routes.ts",
  "apps/web/src/routes/campaign-plan-review-page-routes.ts",
  "apps/web/src/routes/campaign-plan-import-api-routes.ts",
  "apps/web/src/routes/campaign-plan-import-page-routes.ts",
  "apps/web/src/routes/content-item-api-routes.ts",
  "apps/web/src/routes/content-item-page-routes.ts",
  "apps/web/src/routes/content-publication-api-routes.ts",
  "apps/web/src/routes/content-publication-page-routes.ts",
  "apps/web/src/routes/library-api-routes.ts",
  "apps/web/src/routes/library-page-routes.ts",
  "apps/web/src/views/campaign-pages.ts",
  "apps/web/src/views/campaign-plan-run-pages.ts",
  "apps/web/src/views/campaign-plan-review-pages.ts",
  "apps/web/src/views/campaign-plan-import-pages.ts",
  "apps/web/src/views/content-calendar-page.ts",
  "apps/web/src/views/content-item-pages.ts",
  "apps/web/src/views/content-publication-pages.ts",
  "apps/web/src/views/layout.ts",
  "apps/web/src/views/library-pages.ts",
  "apps/web/src/validation/campaign-validation.ts",
  "apps/web/src/validation/campaign-plan-run-validation.ts",
  "apps/web/src/validation/campaign-plan-review-validation.ts",
  "apps/web/src/validation/content-item-validation.ts",
  "apps/web/src/validation/content-publication-validation.ts",
  "apps/web/src/validation/content-calendar-validation.ts",
  "apps/web/src/validation/library-validation.ts",
  "packages/campaign-planner/src/constants.ts",
  "packages/campaign-planner/src/types.ts",
  "packages/campaign-planner/src/schema.ts",
  "packages/campaign-planner/src/strategy.ts",
  "packages/campaign-planner/src/provider.ts",
  "packages/campaign-planner/src/fake-provider.ts",
  "packages/campaign-planner/src/consolidate.ts",
  "packages/campaign-planner/src/validation.ts",
  "packages/campaign-planner/src/claim-rules.ts",
  "packages/campaign-planner/src/index.ts",
  "tests/campaign-planner/strategy.test.ts",
  "tests/campaign-planner/schema.test.ts",
  "tests/campaign-planner/fake-provider.test.ts",
  "tests/campaign-planner/validation.test.ts",
  "tests/campaign-planner/claim-rules.test.ts",
  "tests/campaign-planner/consolidation.test.ts",
  "tests/campaign-plan-runs/generation-runs.test.ts",
  "tests/campaign-plan-review/draft-review.test.ts",
  "tests/campaign-plan-import/approved-import.test.ts",
  "tests/bootstrap-env.mjs",
  "tests/fixtures/campaign-planner/input.ts",
  "migrations/001_phase1a_libraries.sql",
  "migrations/002_phase1b_campaigns.sql",
  "migrations/003_phase1b_content_items.sql",
  "migrations/004_phase1b_content_publications.sql",
  "migrations/005_phase2a_campaign_plan_staging.sql",
  "scripts/migrate.mjs",
  "scripts/seed.mjs",
  "workers/video/Dockerfile",
  "workers/video/src/index.ts",
  "workers/mockup/Dockerfile",
  "workers/mockup/src/index.ts",
  "workers/campaign-planner/Dockerfile",
  "workers/campaign-planner/src/index.ts",
  "workers/campaign-planner/src/worker.ts",
  "workers/campaign-planner/src/run-processor.ts",
  "workers/campaign-planner/src/lease.ts",
  "storage/footage/.gitkeep",
  "storage/draft-videos/.gitkeep",
  "storage/approved-videos/.gitkeep",
  "storage/mockups/.gitkeep",
  "storage/brand-assets/.gitkeep"
];

const requiredServices = [
  "postgres:",
  "redis:",
  "n8n:",
  "web-app:",
  "campaign-planner-worker:",
  "video-worker:",
  "mockup-worker:"
];

const requiredRoutes = [
  "/products",
  "/colors",
  "/offers",
  "/pain-points",
  "/school-level-color-defaults",
  "/api/products",
  "/api/colors",
  "/api/offers",
  "/api/pain-points",
  "/api/school-level-color-defaults",
  "/campaigns",
  "/campaigns/new",
  "/api/campaigns",
  "/campaigns/",
  "/plan-runs/new",
  "/content-calendar",
  "/api/content-calendar",
  "/content-items",
  "/content-items/new",
  "/api/content-items",
  "/publications/new",
  "/content-publications",
  "/publications$"
];

const forbiddenPhase1BTables = [
  "CREATE TABLE campaigns",
  "CREATE TABLE content_items",
  "CREATE TABLE content_publications"
];

let failed = false;

const lockedMigrationHashes = {
  "migrations/001_phase1a_libraries.sql": "dc77e3d5bfd4b2208112282e50c5d084f298a83e6ab94d8cf252636c76e1cfef",
  "migrations/002_phase1b_campaigns.sql": "5beb7f1dd1cf0d5e9f283dd4ad6ac337bbb2af190e519c15832e2cabef4a3525",
  "migrations/003_phase1b_content_items.sql": "fbbada0084e595ccc1631d8c86293805475145b30790bed928ec942e33429526",
  "migrations/004_phase1b_content_publications.sql": "37d0f0a47826a3bdf9012ca6f9956f40998c1ac0ba43410ebe4b945afecd485b"
};

function fail(message) {
  failed = true;
  console.error(`[check] FAIL ${message}`);
}

function pass(message) {
  console.log(`[check] OK ${message}`);
}

function readSources(dir) {
  if (!existsSync(dir)) {
    return "";
  }

  return readdirSync(dir, { withFileTypes: true })
    .map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        return readSources(path);
      }
      return entry.name.endsWith(".ts") ? readFileSync(path, "utf8") : "";
    })
    .join("\n");
}

function sha256(source) {
  return createHash("sha256").update(source).digest("hex");
}

const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor < 24) {
  fail(`Node >=24 dibutuhkan untuk menjalankan TypeScript skeleton tanpa dependency. Versi saat ini: ${process.version}`);
} else {
  pass(`Node runtime ${process.version}`);
}

for (const path of requiredPaths) {
  if (existsSync(path)) {
    pass(`File/folder tersedia: ${path}`);
  } else {
    fail(`File/folder wajib belum ada: ${path}`);
  }
}

for (const [path, expectedHash] of Object.entries(lockedMigrationHashes)) {
  if (!existsSync(path)) {
    continue;
  }

  const actualHash = sha256(readFileSync(path, "utf8"));
  if (actualHash === expectedHash) {
    pass(`Migration stabil tidak berubah: ${path}`);
  } else {
    fail(`Migration stabil berubah: ${path}`);
  }
}

const compose = existsSync("docker-compose.dev.yml") ? readFileSync("docker-compose.dev.yml", "utf8") : "";
for (const service of requiredServices) {
  if (compose.includes(service)) {
    pass(`Service Compose tersedia: ${service.replace(":", "")}`);
  } else {
    fail(`Service Compose belum ada: ${service.replace(":", "")}`);
  }
}

const webSource = readSources("apps/web/src");
const packageSource = readSources("packages/campaign-planner/src");
const testsSource = readSources("tests/campaign-planner");
const planRunTestsSource = readSources("tests/campaign-plan-runs");
const campaignPlannerWorkerSource = readSources("workers/campaign-planner/src");
const planRunWebSource = [
  "apps/web/src/campaign-plan-run-service.ts",
  "apps/web/src/campaign-plan-run-errors.ts",
  "apps/web/src/routes/campaign-plan-run-api-routes.ts",
  "apps/web/src/routes/campaign-plan-run-page-routes.ts",
  "apps/web/src/views/campaign-plan-run-pages.ts",
  "apps/web/src/validation/campaign-plan-run-validation.ts"
].filter(existsSync).map((path) => readFileSync(path, "utf8")).join("\n");
const reviewWebSource = [
  "apps/web/src/campaign-plan-review-service.ts",
  "apps/web/src/campaign-plan-review-errors.ts",
  "apps/web/src/routes/campaign-plan-review-api-routes.ts",
  "apps/web/src/routes/campaign-plan-review-page-routes.ts",
  "apps/web/src/views/campaign-plan-review-pages.ts",
  "apps/web/src/validation/campaign-plan-review-validation.ts"
].filter(existsSync).map((path) => readFileSync(path, "utf8")).join("\n");
const reviewTestsSource = readSources("tests/campaign-plan-review");
const importWebSource = [
  "apps/web/src/campaign-plan-import-service.ts",
  "apps/web/src/campaign-plan-import-errors.ts",
  "apps/web/src/routes/campaign-plan-import-api-routes.ts",
  "apps/web/src/routes/campaign-plan-import-page-routes.ts",
  "apps/web/src/views/campaign-plan-import-pages.ts"
].filter(existsSync).map((path) => readFileSync(path, "utf8")).join("\n");
const importTestsSource = readSources("tests/campaign-plan-import");
for (const route of requiredRoutes) {
  if (webSource.includes(route)) {
    pass(`Route Phase 1A tersedia: ${route}`);
  } else {
    fail(`Route Phase 1A belum ada: ${route}`);
  }
}

const migrationSource = existsSync("migrations/001_phase1a_libraries.sql")
  ? readFileSync("migrations/001_phase1a_libraries.sql", "utf8")
  : "";
for (const table of forbiddenPhase1BTables) {
  if (migrationSource.includes(table)) {
    fail(`Migration Phase 1A tidak boleh membuat tabel Phase 1B: ${table}`);
  } else {
    pass(`Migration Phase 1A tidak membuat ${table.replace("CREATE TABLE ", "")}`);
  }
}

const campaignMigrationSource = existsSync("migrations/002_phase1b_campaigns.sql")
  ? readFileSync("migrations/002_phase1b_campaigns.sql", "utf8")
  : "";
if (campaignMigrationSource.includes("CREATE TABLE campaigns")) {
  pass("Migration Phase 1B.1 membuat campaigns");
} else {
  fail("Migration Phase 1B.1 belum membuat campaigns");
}

for (const table of ["CREATE TABLE content_items", "CREATE TABLE content_publications"]) {
  if (campaignMigrationSource.includes(table)) {
    fail(`Migration Phase 1B.1 tidak boleh membuat tabel: ${table}`);
  } else {
    pass(`Migration Phase 1B.1 tidak membuat ${table.replace("CREATE TABLE ", "")}`);
  }
}

const contentItemMigrationSource = existsSync("migrations/003_phase1b_content_items.sql")
  ? readFileSync("migrations/003_phase1b_content_items.sql", "utf8")
  : "";
if (contentItemMigrationSource.includes("CREATE TABLE content_items")) {
  pass("Migration Phase 1B.2 membuat content_items");
} else {
  fail("Migration Phase 1B.2 belum membuat content_items");
}

if (contentItemMigrationSource.includes("CREATE TABLE content_publications")) {
  fail("Migration Phase 1B.2 tidak boleh membuat content_publications");
} else {
  pass("Migration Phase 1B.2 tidak membuat content_publications");
}

for (const forbiddenField of ["channel", "publication_format", "planned_publish_at"]) {
  if (contentItemMigrationSource.includes(forbiddenField)) {
    fail(`content_items tidak boleh memiliki field publikasi: ${forbiddenField}`);
  } else {
    pass(`content_items tidak memiliki field publikasi: ${forbiddenField}`);
  }
}

const publicationMigrationSource = existsSync("migrations/004_phase1b_content_publications.sql")
  ? readFileSync("migrations/004_phase1b_content_publications.sql", "utf8")
  : "";
if (publicationMigrationSource.includes("CREATE TABLE content_publications")) {
  pass("Migration Phase 1B.3 membuat content_publications");
} else {
  fail("Migration Phase 1B.3 belum membuat content_publications");
}

for (const requiredText of [
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
  "whatsapp_status",
  "standard_video",
  "publication_status",
  "content_publications_item_channel_format_key UNIQUE (content_item_id, channel, publication_format)"
]) {
  if (publicationMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 1B.3 memuat aturan: ${requiredText}`);
  } else {
    fail(`Migration Phase 1B.3 belum memuat aturan: ${requiredText}`);
  }
}

for (const calendarTableText of ["CREATE TABLE content_calendar", "CREATE TABLE manual_content_calendar", "CREATE TABLE calendar_events"]) {
  if (publicationMigrationSource.includes(calendarTableText) || contentItemMigrationSource.includes(calendarTableText) || campaignMigrationSource.includes(calendarTableText) || migrationSource.includes(calendarTableText)) {
    fail(`Calendar tidak boleh membuat tabel baru: ${calendarTableText}`);
  } else {
    pass(`Calendar tidak membuat tabel baru: ${calendarTableText}`);
  }
}

if (existsSync("migrations/005_phase1b_content_calendar.sql")) {
  fail("Tidak boleh ada migration 005 untuk Manual Content Calendar");
} else {
  pass("Tidak ada migration 005 untuk Manual Content Calendar");
}

const migrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("005_"));
if (migrationFiles.length === 1 && migrationFiles[0] === "005_phase2a_campaign_plan_staging.sql") {
  pass("Migration 005 Phase 2A staging tersedia");
} else {
  fail(`Migration 005 Phase 2A harus tepat satu file: ${migrationFiles.join(", ") || "tidak ada"}`);
}

if (webSource.includes("/content-calendar")) {
  pass("Route page Manual Content Calendar tersedia: /content-calendar");
} else {
  fail("Route page Manual Content Calendar belum tersedia");
}

if (webSource.includes("/api/content-calendar")) {
  pass("Route API Manual Content Calendar tersedia: /api/content-calendar");
} else {
  fail("Route API Manual Content Calendar belum tersedia");
}

for (const forbiddenAutomation of ["auto posting", "scheduler worker", "cron", "Campaign Planner Agent"]) {
  if (webSource.toLowerCase().includes(forbiddenAutomation.toLowerCase())) {
    fail(`Calendar tidak boleh menambah automation: ${forbiddenAutomation}`);
  } else {
    pass(`Calendar tidak menambah automation: ${forbiddenAutomation}`);
  }
}

const packageJson = existsSync("package.json") ? JSON.parse(readFileSync("package.json", "utf8")) : { dependencies: {} };
const dependencies = packageJson.dependencies || {};
if (dependencies.zod) {
  pass("Dependency zod tersedia");
} else {
  fail("Dependency zod wajib tersedia untuk Campaign Planner schema");
}

if (dependencies.openai || dependencies["@openai/agents"]) {
  fail("Phase 2A.2 tidak boleh menambah dependency OpenAI atau Agents SDK");
} else {
  pass("Tidak ada dependency OpenAI atau Agents SDK");
}

if (dependencies.bullmq || dependencies.ioredis || dependencies.redis) {
  fail("Phase 2A.2 tidak boleh menambah BullMQ atau Redis client baru untuk Campaign Planner");
} else {
  pass("Tidak ada BullMQ atau Redis client baru");
}

const allMigrations = readdirSync("migrations")
  .filter((fileName) => fileName.endsWith(".sql"))
  .map((fileName) => readFileSync(join("migrations", fileName), "utf8"))
  .join("\n");
const phase2aMigrationSource = existsSync("migrations/005_phase2a_campaign_plan_staging.sql")
  ? readFileSync("migrations/005_phase2a_campaign_plan_staging.sql", "utf8")
  : "";
for (const requiredTable of [
  "CREATE TABLE campaign_plan_runs",
  "CREATE TABLE campaign_plan_generation_batches",
  "CREATE TABLE campaign_plan_draft_items",
  "CREATE TABLE campaign_plan_draft_publications"
]) {
  if (phase2aMigrationSource.includes(requiredTable)) {
    pass(`Phase 2A.2 staging table tersedia: ${requiredTable.replace("CREATE TABLE ", "")}`);
  } else {
    fail(`Phase 2A.2 staging table belum ada: ${requiredTable}`);
  }
}

for (const requiredText of [
  "review_status text NOT NULL DEFAULT 'pending_review'",
  "imported_content_item_id uuid",
  "imported_publication_id uuid",
  "campaign_plan_batches_run_batch_key UNIQUE (run_id, batch_number)",
  "campaign_plan_runs_one_unresolved_per_campaign_idx",
  "FOR UPDATE SKIP LOCKED",
  "FakeCampaignPlannerProvider"
]) {
  const combined = `${phase2aMigrationSource}\n${campaignPlannerWorkerSource}`;
  if (combined.includes(requiredText)) {
    pass(`Phase 2A.2 memuat: ${requiredText}`);
  } else {
    fail(`Phase 2A.2 belum memuat: ${requiredText}`);
  }
}

if (phase2aMigrationSource.includes("'edited'")) {
  fail("Review status Phase 2A.2 tidak boleh memakai edited");
} else {
  pass("Review status tidak memakai edited");
}

for (const requiredRoute of [
  "/campaigns/",
  "/plan-runs/new",
  "/campaign-plan-runs",
  "api\\/campaigns\\/",
  "api\\/campaign-plan-runs"
]) {
  if (webSource.includes(requiredRoute)) {
    pass(`Campaign Plan Run route tersedia: ${requiredRoute}`);
  } else {
    fail(`Campaign Plan Run route belum ada: ${requiredRoute}`);
  }
}

if (existsSync("workers/campaign-planner")) {
  pass("Campaign Planner worker tersedia");
} else {
  fail("Campaign Planner worker wajib tersedia pada Phase 2A.2");
}

if (existsSync("migrations/006_phase2a_campaign_plan_review.sql")) {
  fail("Phase 2A.3 tidak boleh membuat migration 006");
} else {
  pass("Tidak ada migration 006 untuk Phase 2A.3");
}

for (const requiredReviewText of [
  "campaign-plan-runs",
  "/review",
  "campaign-plan-draft-items",
  "/approve-all",
  "/approve",
  "/reject",
  "expected_revision_number",
  "revision_number",
  "immutable_campaign_plan_strategy",
  "stale_draft_revision",
  "ready_for_review",
  "CampaignPlanReviewError"
]) {
  if (reviewWebSource.includes(requiredReviewText) || reviewTestsSource.includes(requiredReviewText)) {
    pass(`Phase 2A.3 review memuat: ${requiredReviewText}`);
  } else {
    fail(`Phase 2A.3 review belum memuat: ${requiredReviewText}`);
  }
}

for (const reviewStatus of ["pending_review", "approved", "rejected"]) {
  if (phase2aMigrationSource.includes(reviewStatus) && reviewWebSource.includes(reviewStatus)) {
    pass(`Review status valid digunakan: ${reviewStatus}`);
  } else {
    fail(`Review status wajib belum lengkap: ${reviewStatus}`);
  }
}

if (phase2aMigrationSource.includes("'edited'") || reviewWebSource.includes("review_status = 'edited'") || reviewWebSource.includes('"edited"')) {
  fail("Phase 2A.3 tidak boleh memakai edited sebagai review status");
} else {
  pass("Tidak ada edited review status pada Phase 2A.3");
}

if (reviewWebSource.includes("FOR UPDATE") && reviewWebSource.includes("validateCampaignPlanDraft")) {
  pass("Review service memakai database locking dan Campaign Planner validation");
} else {
  fail("Review service wajib memakai locking dan revalidation Campaign Planner");
}

for (const requiredRoute of [
  "api\\/campaign-plan-runs\\/",
  "/review",
  "api\\/campaign-plan-draft-items\\/",
  "/approve-all",
  "/campaign-plan-draft-items/",
  "/edit"
]) {
  if (webSource.includes(requiredRoute) || reviewWebSource.includes(requiredRoute)) {
    pass(`Review route tersedia: ${requiredRoute}`);
  } else {
    fail(`Review route belum tersedia: ${requiredRoute}`);
  }
}

for (const forbiddenReviewText of [
  "approveAndImport",
  "createContentItem",
  "createContentPublication",
  "OPENAI_API_KEY",
  "from \"openai\"",
  "@openai/agents"
]) {
  if (reviewWebSource.includes(forbiddenReviewText) || reviewTestsSource.includes(forbiddenReviewText)) {
    fail(`Phase 2A.3 tidak boleh memuat import/OpenAI: ${forbiddenReviewText}`);
  } else {
    pass(`Tidak ada import/OpenAI pada review: ${forbiddenReviewText}`);
  }
}

for (const forbiddenOperationalInsert of [
  "INSERT INTO content_items",
  "INSERT INTO content_publications",
  "content_items (",
  "content_publications ("
]) {
  if (reviewWebSource.includes(forbiddenOperationalInsert) || campaignPlannerWorkerSource.includes(forbiddenOperationalInsert) || packageSource.includes(forbiddenOperationalInsert)) {
    fail(`Phase 2A.3 tidak boleh write operational table: ${forbiddenOperationalInsert}`);
  } else {
    pass(`Tidak ada operational insert: ${forbiddenOperationalInsert}`);
  }
}

for (const requiredImportText of [
  "CampaignPlanImportError",
  "importApprovedCampaignPlanRun",
  "getCampaignPlanImportPreview",
  "api\\/campaign-plan-runs",
  "/import",
  "approved",
  "importing",
  "imported",
  "imported_content_item_id",
  "imported_publication_id",
  "imported_at",
  "withTransaction",
  "FOR UPDATE",
  "createContentItemWithClient",
  "createContentPublicationWithClient",
  "campaign_plan_reference_unavailable",
  "campaign_plan_campaign_changed",
  "campaign_plan_date_outside_campaign",
  "campaign_plan_import_state_inconsistent",
  "campaign_plan_import_conflict",
  "already_imported"
]) {
  if (importWebSource.includes(requiredImportText) || importTestsSource.includes(requiredImportText)) {
    pass(`Phase 2A.4 import memuat: ${requiredImportText}`);
  } else {
    fail(`Phase 2A.4 import belum memuat: ${requiredImportText}`);
  }
}

for (const requiredImportTestText of [
  "after_content_items",
  "after_publications",
  "before_mapping",
  "before_finalize",
  "campaign_plan_reference_unavailable",
  "campaign_plan_campaign_changed",
  "campaign_plan_date_outside_campaign",
  "campaign_plan_run_not_importable",
  "campaign_plan_import_state_inconsistent",
  "already_imported",
  "getContentCalendar",
  "renderCampaignPlanImportPage"
]) {
  if (importTestsSource.includes(requiredImportTestText)) {
    pass(`Phase 2A.4 test memuat: ${requiredImportTestText}`);
  } else {
    fail(`Phase 2A.4 test belum memuat: ${requiredImportTestText}`);
  }
}

const migration006Files = readdirSync("migrations").filter((fileName) => fileName.startsWith("006_"));
if (migration006Files.length) {
  fail(`Phase 2A.4 tidak boleh membuat migration 006: ${migration006Files.join(", ")}`);
} else {
  pass("Tidak ada migration 006 untuk Phase 2A.4");
}

if (importWebSource.includes("contentCode") || importWebSource.includes("padStart(2")) {
  fail("Import service tidak boleh membuat content code generator kedua");
} else {
  pass("Import service tidak membuat content code generator kedua");
}

if (campaignPlannerWorkerSource.includes("importApprovedCampaignPlanRun") || campaignPlannerWorkerSource.includes("campaign-plan-import")) {
  fail("Campaign Planner worker tidak boleh menjalankan import operational");
} else {
  pass("Tidak ada import worker Campaign Planner");
}

if (webSource.includes("OPENAI_API_KEY") || webSource.includes("from \"openai\"") || importWebSource.includes("@openai/agents")) {
  fail("Phase 2A.4 tidak boleh menambahkan OpenAI provider/key/call");
} else {
  pass("Tidak ada OpenAI pada Phase 2A.4");
}

const trackedLikeSources = [
  readFileSync("README.local.md", "utf8"),
  readFileSync("docs/PHASE_2A_PLAN.md", "utf8"),
  readFileSync("package.json", "utf8"),
  packageSource,
  testsSource,
  planRunTestsSource,
  reviewTestsSource,
  importTestsSource,
  webSource,
  campaignPlannerWorkerSource
].join("\n");

if (trackedLikeSources.toLowerCase().includes("n8n import workflow")) {
  fail("Phase 2A.4 tidak boleh membuat n8n import workflow");
} else {
  pass("Tidak ada n8n import workflow");
}
if (trackedLikeSources.includes("OPENAI_API_KEY")) {
  fail("Phase 2A.2 tidak boleh menambahkan OpenAI API key handling pada tracked source");
} else {
  pass("Tidak ada OPENAI_API_KEY pada source Phase 2A.2");
}

const executablePlannerSources = [packageSource, planRunWebSource, campaignPlannerWorkerSource].join("\n");
if (executablePlannerSources.includes("from \"openai\"") || executablePlannerSources.includes("from '@openai/agents'") || executablePlannerSources.includes("@openai/agents")) {
  fail("Campaign Planner tidak boleh import OpenAI pada Phase 2A.2");
} else {
  pass("Campaign Planner tidak import OpenAI");
}

if (packageSource.includes("content_items") || packageSource.includes("content_publications")) {
  fail("Campaign Planner package tidak boleh menyentuh operational table Phase 1");
} else {
  pass("Campaign Planner package tidak menyentuh operational table Phase 1");
}

for (const forbiddenText of [
  "approve all",
  "Approve All",
  "/approve",
  "importContent",
  "content_items (",
  "content_publications ("
]) {
  if (planRunWebSource.includes(forbiddenText) || campaignPlannerWorkerSource.includes(forbiddenText)) {
    fail(`Phase 2A.2 tidak boleh membuat approval/import flow: ${forbiddenText}`);
  } else {
    pass(`Tidak ada approval/import flow: ${forbiddenText}`);
  }
}

if (executablePlannerSources.toLowerCase().includes("bullmq")) {
  fail("Phase 2A.2 tidak boleh memakai BullMQ");
} else {
  pass("Tidak ada BullMQ");
}

if (trackedLikeSources.toLowerCase().includes("n8n campaign planner")) {
  fail("Phase 2A.2 tidak boleh membuat n8n Campaign Planner workflow");
} else {
  pass("Tidak ada n8n Campaign Planner workflow");
}

if (failed) {
  process.exit(1);
}

console.log("[check] Struktur Phase 1A local development siap.");
