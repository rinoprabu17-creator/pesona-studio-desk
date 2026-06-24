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
  "apps/web/src/content-item-footage-service.ts",
  "apps/web/src/content-item-footage-errors.ts",
  "apps/web/src/content-item-script-plan-service.ts",
  "apps/web/src/content-item-script-plan-errors.ts",
  "apps/web/src/video-draft-job-service.ts",
  "apps/web/src/video-draft-job-errors.ts",
  "apps/web/src/render-manifest-service.ts",
  "apps/web/src/render-manifest-errors.ts",
  "apps/web/src/render-preflight-service.ts",
  "apps/web/src/render-preflight-errors.ts",
  "apps/web/src/render-attempt-service.ts",
  "apps/web/src/render-attempt-errors.ts",
  "apps/web/src/render-attempt-review-service.ts",
  "apps/web/src/render-attempt-review-errors.ts",
  "apps/web/src/render-approved-promotion-service.ts",
  "apps/web/src/render-approved-promotion-errors.ts",
  "apps/web/src/approved-video-handoff-service.ts",
  "apps/web/src/approved-video-handoff-errors.ts",
  "apps/web/src/manual-publication-package-service.ts",
  "apps/web/src/manual-publication-package-errors.ts",
  "apps/web/src/manual-publish-checklist-service.ts",
  "apps/web/src/manual-publish-checklist-errors.ts",
  "apps/web/src/manual-publish-closeout-service.ts",
  "apps/web/src/manual-publish-closeout-errors.ts",
  "apps/web/src/manual-publish-report-service.ts",
  "apps/web/src/manual-publish-report-errors.ts",
  "apps/web/src/content-publication-service.ts",
  "apps/web/src/content-publication-errors.ts",
  "apps/web/src/footage-asset-service.ts",
  "apps/web/src/footage-asset-errors.ts",
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
  "apps/web/src/routes/approved-video-api-routes.ts",
  "apps/web/src/routes/approved-video-page-routes.ts",
  "apps/web/src/routes/manual-publication-package-api-routes.ts",
  "apps/web/src/routes/manual-publication-package-page-routes.ts",
  "apps/web/src/routes/manual-publish-checklist-api-routes.ts",
  "apps/web/src/routes/manual-publish-checklist-page-routes.ts",
  "apps/web/src/routes/manual-publish-closeout-api-routes.ts",
  "apps/web/src/routes/manual-publish-closeout-page-routes.ts",
  "apps/web/src/routes/manual-publish-report-api-routes.ts",
  "apps/web/src/routes/manual-publish-report-page-routes.ts",
  "apps/web/src/routes/content-item-api-routes.ts",
  "apps/web/src/routes/content-item-page-routes.ts",
  "apps/web/src/routes/content-publication-api-routes.ts",
  "apps/web/src/routes/content-publication-page-routes.ts",
  "apps/web/src/routes/footage-asset-api-routes.ts",
  "apps/web/src/routes/footage-asset-page-routes.ts",
  "apps/web/src/routes/library-api-routes.ts",
  "apps/web/src/routes/library-page-routes.ts",
  "apps/web/src/views/campaign-pages.ts",
  "apps/web/src/views/campaign-plan-run-pages.ts",
  "apps/web/src/views/campaign-plan-review-pages.ts",
  "apps/web/src/views/campaign-plan-import-pages.ts",
  "apps/web/src/views/approved-video-pages.ts",
  "apps/web/src/views/manual-publication-package-pages.ts",
  "apps/web/src/views/manual-publish-checklist-pages.ts",
  "apps/web/src/views/manual-publish-closeout-pages.ts",
  "apps/web/src/views/manual-publish-report-pages.ts",
  "apps/web/src/views/content-calendar-page.ts",
  "apps/web/src/views/content-item-pages.ts",
  "apps/web/src/views/content-publication-pages.ts",
  "apps/web/src/views/footage-asset-pages.ts",
  "apps/web/src/views/layout.ts",
  "apps/web/src/views/library-pages.ts",
  "apps/web/src/validation/campaign-validation.ts",
  "apps/web/src/validation/campaign-plan-run-validation.ts",
  "apps/web/src/validation/campaign-plan-review-validation.ts",
  "apps/web/src/validation/content-item-validation.ts",
  "apps/web/src/validation/content-item-footage-validation.ts",
  "apps/web/src/validation/content-item-script-plan-validation.ts",
  "apps/web/src/validation/video-draft-job-validation.ts",
  "apps/web/src/validation/render-manifest-validation.ts",
  "apps/web/src/validation/render-preflight-validation.ts",
  "apps/web/src/validation/render-attempt-validation.ts",
  "apps/web/src/validation/render-attempt-review-validation.ts",
  "apps/web/src/validation/render-approved-promotion-validation.ts",
  "apps/web/src/validation/approved-video-handoff-validation.ts",
  "apps/web/src/validation/manual-publication-package-validation.ts",
  "apps/web/src/validation/manual-publish-checklist-validation.ts",
  "apps/web/src/validation/manual-publish-closeout-validation.ts",
  "apps/web/src/validation/manual-publish-report-validation.ts",
  "apps/web/src/validation/content-publication-validation.ts",
  "apps/web/src/validation/footage-asset-validation.ts",
  "apps/web/src/validation/content-calendar-validation.ts",
  "apps/web/src/validation/library-validation.ts",
  "packages/campaign-planner/src/constants.ts",
  "packages/campaign-planner/src/types.ts",
  "packages/campaign-planner/src/schema.ts",
  "packages/campaign-planner/src/strategy.ts",
  "packages/campaign-planner/src/provider.ts",
  "packages/campaign-planner/src/fake-provider.ts",
  "packages/campaign-planner/src/openai-config.ts",
  "packages/campaign-planner/src/openai-prompt.ts",
  "packages/campaign-planner/src/openai-provider.ts",
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
  "tests/campaign-planner-openai/openai-provider.test.ts",
  "tests/campaign-plan-runs/generation-runs.test.ts",
  "tests/campaign-plan-review/draft-review.test.ts",
  "tests/campaign-plan-import/approved-import.test.ts",
  "tests/footage-catalog/footage-catalog.test.ts",
  "tests/bootstrap-env.mjs",
  "tests/fixtures/campaign-planner/input.ts",
  "migrations/001_phase1a_libraries.sql",
  "migrations/002_phase1b_campaigns.sql",
  "migrations/003_phase1b_content_items.sql",
  "migrations/004_phase1b_content_publications.sql",
  "migrations/005_phase2a_campaign_plan_staging.sql",
  "migrations/006_phase2b_footage_assets.sql",
  "migrations/007_phase2c_content_item_footage.sql",
  "migrations/008_phase2c_script_shot_plans.sql",
  "migrations/009_phase2d_video_draft_jobs.sql",
  "migrations/010_phase2d_render_manifests.sql",
  "migrations/011_phase2d_render_preflight_runs.sql",
  "migrations/012_phase2e_controlled_render_attempts.sql",
  "migrations/013_phase2e_render_review_gate.sql",
  "migrations/014_phase2e_approved_render_promotions.sql",
  "migrations/015_phase2e_approved_video_handoff_board.sql",
  "migrations/016_phase2f_manual_publication_packages.sql",
  "migrations/017_phase2f_manual_publish_checklist_evidence.sql",
  "migrations/018_phase2f_manual_publish_closeouts.sql",
  "scripts/migrate.mjs",
  "scripts/seed.mjs",
  "scripts/prepare-test-db.mjs",
  "scripts/smoke-openai-campaign-planner.mjs",
  "docker-compose.openai.yml",
  "secrets/README.md",
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
  "/footage-assets",
  "/footage-assets/new",
  "/api/footage-assets",
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

const footageMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("006_"));
if (footageMigrationFiles.length === 1 && footageMigrationFiles[0] === "006_phase2b_footage_assets.sql") {
  pass("Migration 006 Phase 2B footage assets tersedia");
} else {
  fail(`Migration 006 Phase 2B harus tepat satu file: ${footageMigrationFiles.join(", ") || "tidak ada"}`);
}

const footageMigrationSource = existsSync("migrations/006_phase2b_footage_assets.sql")
  ? readFileSync("migrations/006_phase2b_footage_assets.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE footage_assets",
  "relative_path text NOT NULL UNIQUE",
  "product_id uuid REFERENCES products(id)",
  "status = ANY (ARRAY['new', 'reviewed', 'approved', 'rejected', 'archived'])",
  "position(chr(92) in relative_path) = 0"
]) {
  if (footageMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2B.1 footage memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2B.1 footage belum memuat: ${requiredText}`);
  }
}

const contentFootageMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("007_"));
if (contentFootageMigrationFiles.length === 1 && contentFootageMigrationFiles[0] === "007_phase2c_content_item_footage.sql") {
  pass("Migration 007 Phase 2C content item footage tersedia");
} else {
  fail(`Migration 007 Phase 2C harus tepat satu file: ${contentFootageMigrationFiles.join(", ") || "tidak ada"}`);
}

const contentFootageMigrationSource = existsSync("migrations/007_phase2c_content_item_footage.sql")
  ? readFileSync("migrations/007_phase2c_content_item_footage.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE content_item_footage_selections",
  "content_item_id uuid NOT NULL REFERENCES content_items(id)",
  "footage_asset_id uuid NOT NULL REFERENCES footage_assets(id)",
  "content_item_footage_item_sequence_key UNIQUE (content_item_id, sequence_number)",
  "content_item_footage_item_asset_key UNIQUE (content_item_id, footage_asset_id)"
]) {
  if (contentFootageMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2C.1 content footage memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2C.1 content footage belum memuat: ${requiredText}`);
  }
}

for (const forbiddenText of ["DROP ", "TRUNCATE", "DELETE ", "ALTER TABLE"]) {
  if (contentFootageMigrationSource.includes(forbiddenText)) {
    fail(`Migration Phase 2C.1 harus additive-only, tidak boleh memuat: ${forbiddenText}`);
  } else {
    pass(`Migration Phase 2C.1 tidak memuat destructive SQL: ${forbiddenText}`);
  }
}

const scriptPlanMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("008_"));
if (scriptPlanMigrationFiles.length === 1 && scriptPlanMigrationFiles[0] === "008_phase2c_script_shot_plans.sql") {
  pass("Migration 008 Phase 2C script shot plans tersedia");
} else {
  fail(`Migration 008 Phase 2C harus tepat satu file: ${scriptPlanMigrationFiles.join(", ") || "tidak ada"}`);
}

const scriptPlanMigrationSource = existsSync("migrations/008_phase2c_script_shot_plans.sql")
  ? readFileSync("migrations/008_phase2c_script_shot_plans.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE content_item_script_plans",
  "CREATE TABLE content_item_shot_plan_steps",
  "content_item_id uuid NOT NULL REFERENCES content_items(id)",
  "script_plan_id uuid NOT NULL REFERENCES content_item_script_plans(id)",
  "content_item_footage_selection_id uuid REFERENCES content_item_footage_selections(id)",
  "content_item_script_plans_content_item_key UNIQUE (content_item_id)",
  "content_item_shot_plan_steps_plan_sequence_key UNIQUE (script_plan_id, sequence_number)"
]) {
  if (scriptPlanMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2C.3 script plan memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2C.3 script plan belum memuat: ${requiredText}`);
  }
}

for (const forbiddenText of ["DROP ", "TRUNCATE", "DELETE ", "ALTER TABLE"]) {
  if (scriptPlanMigrationSource.includes(forbiddenText)) {
    fail(`Migration Phase 2C.3 harus additive-only, tidak boleh memuat: ${forbiddenText}`);
  } else {
    pass(`Migration Phase 2C.3 tidak memuat destructive SQL: ${forbiddenText}`);
  }
}

const videoDraftMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("009_"));
if (videoDraftMigrationFiles.length === 1 && videoDraftMigrationFiles[0] === "009_phase2d_video_draft_jobs.sql") {
  pass("Migration 009 Phase 2D video draft jobs tersedia");
} else {
  fail(`Migration 009 Phase 2D harus tepat satu file: ${videoDraftMigrationFiles.join(", ") || "tidak ada"}`);
}

const videoDraftMigrationSource = existsSync("migrations/009_phase2d_video_draft_jobs.sql")
  ? readFileSync("migrations/009_phase2d_video_draft_jobs.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE video_draft_jobs",
  "content_item_id uuid NOT NULL REFERENCES content_items(id)",
  "script_plan_id uuid NOT NULL REFERENCES content_item_script_plans(id)",
  "render_mode text NOT NULL DEFAULT 'disabled_metadata_only'",
  "video_draft_jobs_script_plan_key UNIQUE (script_plan_id)",
  "CREATE INDEX video_draft_jobs_content_item_id_idx",
  "CREATE INDEX video_draft_jobs_script_plan_id_idx"
]) {
  if (videoDraftMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2D.1 video draft job memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2D.1 video draft job belum memuat: ${requiredText}`);
  }
}

for (const forbiddenText of ["DROP ", "TRUNCATE", "DELETE ", "ALTER TABLE"]) {
  if (videoDraftMigrationSource.includes(forbiddenText)) {
    fail(`Migration Phase 2D.1 harus additive-only, tidak boleh memuat: ${forbiddenText}`);
  } else {
    pass(`Migration Phase 2D.1 tidak memuat destructive SQL: ${forbiddenText}`);
  }
}

const renderManifestMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("010_"));
if (renderManifestMigrationFiles.length === 1 && renderManifestMigrationFiles[0] === "010_phase2d_render_manifests.sql") {
  pass("Migration 010 Phase 2D render manifests tersedia");
} else {
  fail(`Migration 010 Phase 2D harus tepat satu file: ${renderManifestMigrationFiles.join(", ") || "tidak ada"}`);
}

const renderManifestMigrationSource = existsSync("migrations/010_phase2d_render_manifests.sql")
  ? readFileSync("migrations/010_phase2d_render_manifests.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE video_render_manifests",
  "CREATE TABLE video_render_manifest_items",
  "video_draft_job_id uuid NOT NULL REFERENCES video_draft_jobs(id)",
  "manifest_mode text NOT NULL DEFAULT 'metadata_only'",
  "video_render_manifests_job_key UNIQUE (video_draft_job_id)",
  "source_relative_path_snapshot text",
  "CREATE INDEX video_render_manifest_items_manifest_id_idx"
]) {
  if (renderManifestMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2D.2 render manifest memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2D.2 render manifest belum memuat: ${requiredText}`);
  }
}

for (const forbiddenText of ["DROP ", "TRUNCATE", "DELETE ", "ALTER TABLE"]) {
  if (renderManifestMigrationSource.includes(forbiddenText)) {
    fail(`Migration Phase 2D.2 harus additive-only, tidak boleh memuat: ${forbiddenText}`);
  } else {
    pass(`Migration Phase 2D.2 tidak memuat destructive SQL: ${forbiddenText}`);
  }
}

const renderPreflightMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("011_"));
if (renderPreflightMigrationFiles.length === 1 && renderPreflightMigrationFiles[0] === "011_phase2d_render_preflight_runs.sql") {
  pass("Migration 011 Phase 2D render preflight runs tersedia");
} else {
  fail(`Migration 011 Phase 2D harus tepat satu file: ${renderPreflightMigrationFiles.join(", ") || "tidak ada"}`);
}

const renderPreflightMigrationSource = existsSync("migrations/011_phase2d_render_preflight_runs.sql")
  ? readFileSync("migrations/011_phase2d_render_preflight_runs.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE video_render_preflight_runs",
  "CREATE TABLE video_render_preflight_checks",
  "render_manifest_id uuid NOT NULL REFERENCES video_render_manifests(id)",
  "preflight_result text NOT NULL DEFAULT 'blocked'",
  "check_level = ANY (ARRAY['info', 'warning', 'blocking'])",
  "CREATE INDEX video_render_preflight_runs_render_manifest_id_idx",
  "CREATE INDEX video_render_preflight_checks_run_id_idx"
]) {
  if (renderPreflightMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2D.3 render preflight memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2D.3 render preflight belum memuat: ${requiredText}`);
  }
}

for (const forbiddenText of ["DROP ", "TRUNCATE", "DELETE ", "ALTER TABLE"]) {
  if (renderPreflightMigrationSource.includes(forbiddenText)) {
    fail(`Migration Phase 2D.3 harus additive-only, tidak boleh memuat: ${forbiddenText}`);
  } else {
    pass(`Migration Phase 2D.3 tidak memuat destructive SQL: ${forbiddenText}`);
  }
}

const renderAttemptMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("012_"));
if (renderAttemptMigrationFiles.length === 1 && renderAttemptMigrationFiles[0] === "012_phase2e_controlled_render_attempts.sql") {
  pass("Migration 012 Phase 2E controlled render attempts tersedia");
} else {
  fail(`Migration 012 Phase 2E harus tepat satu file: ${renderAttemptMigrationFiles.join(", ") || "tidak ada"}`);
}

const renderAttemptMigrationSource = existsSync("migrations/012_phase2e_controlled_render_attempts.sql")
  ? readFileSync("migrations/012_phase2e_controlled_render_attempts.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE video_render_attempts",
  "render_manifest_id uuid NOT NULL REFERENCES video_render_manifests(id)",
  "preflight_run_id uuid NOT NULL REFERENCES video_render_preflight_runs(id)",
  "attempt_mode text NOT NULL DEFAULT 'manual_smoke'",
  "output_relative_path ~ '^smoke/'",
  "CREATE INDEX video_render_attempts_render_manifest_id_idx"
]) {
  if (renderAttemptMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2E.1 render attempt memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2E.1 render attempt belum memuat: ${requiredText}`);
  }
}

for (const forbiddenText of ["DROP ", "TRUNCATE", "DELETE ", "ALTER TABLE"]) {
  if (renderAttemptMigrationSource.includes(forbiddenText)) {
    fail(`Migration Phase 2E.1 harus additive-only, tidak boleh memuat: ${forbiddenText}`);
  } else {
    pass(`Migration Phase 2E.1 tidak memuat destructive SQL: ${forbiddenText}`);
  }
}

const renderReviewMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("013_"));
if (renderReviewMigrationFiles.length === 1 && renderReviewMigrationFiles[0] === "013_phase2e_render_review_gate.sql") {
  pass("Migration 013 Phase 2E render review gate tersedia");
} else {
  fail(`Migration 013 Phase 2E harus tepat satu file: ${renderReviewMigrationFiles.join(", ") || "tidak ada"}`);
}

const renderReviewMigrationSource = existsSync("migrations/013_phase2e_render_review_gate.sql")
  ? readFileSync("migrations/013_phase2e_render_review_gate.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE video_render_attempt_reviews",
  "render_attempt_id uuid NOT NULL REFERENCES video_render_attempts(id)",
  "review_status text NOT NULL DEFAULT 'pending_review'",
  "video_render_attempt_reviews_attempt_key UNIQUE (render_attempt_id)",
  "CREATE INDEX video_render_attempt_reviews_attempt_id_idx"
]) {
  if (renderReviewMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2E.4 render review memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2E.4 render review belum memuat: ${requiredText}`);
  }
}

for (const forbiddenText of ["DROP ", "TRUNCATE", "DELETE ", "ALTER TABLE"]) {
  if (renderReviewMigrationSource.includes(forbiddenText)) {
    fail(`Migration Phase 2E.4 harus additive-only, tidak boleh memuat: ${forbiddenText}`);
  } else {
    pass(`Migration Phase 2E.4 tidak memuat destructive SQL: ${forbiddenText}`);
  }
}

const renderPromotionMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("014_"));
if (renderPromotionMigrationFiles.length === 1 && renderPromotionMigrationFiles[0] === "014_phase2e_approved_render_promotions.sql") {
  pass("Migration 014 Phase 2E approved render promotions tersedia");
} else {
  fail(`Migration 014 Phase 2E harus tepat satu file: ${renderPromotionMigrationFiles.join(", ") || "tidak ada"}`);
}

const renderPromotionMigrationSource = existsSync("migrations/014_phase2e_approved_render_promotions.sql")
  ? readFileSync("migrations/014_phase2e_approved_render_promotions.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE video_render_approved_promotions",
  "render_attempt_review_id uuid NOT NULL REFERENCES video_render_attempt_reviews(id)",
  "promotion_mode text NOT NULL DEFAULT 'manual_copy'",
  "video_render_approved_promotions_review_key UNIQUE (render_attempt_review_id)",
  "video_render_approved_promotions_attempt_key UNIQUE (render_attempt_id)",
  "source_output_relative_path ~ '^smoke/'",
  "CREATE INDEX video_render_approved_promotions_attempt_id_idx"
]) {
  if (renderPromotionMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2E.5 approved promotion memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2E.5 approved promotion belum memuat: ${requiredText}`);
  }
}

for (const forbiddenText of ["DROP ", "TRUNCATE", "DELETE ", "ALTER TABLE"]) {
  if (renderPromotionMigrationSource.includes(forbiddenText)) {
    fail(`Migration Phase 2E.5 harus additive-only, tidak boleh memuat: ${forbiddenText}`);
  } else {
    pass(`Migration Phase 2E.5 tidak memuat destructive SQL: ${forbiddenText}`);
  }
}

const approvedVideoHandoffMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("015_"));
if (approvedVideoHandoffMigrationFiles.length === 1 && approvedVideoHandoffMigrationFiles[0] === "015_phase2e_approved_video_handoff_board.sql") {
  pass("Migration 015 Phase 2E approved video handoff board tersedia");
} else {
  fail(`Migration 015 Phase 2E harus tepat satu file: ${approvedVideoHandoffMigrationFiles.join(", ") || "tidak ada"}`);
}

const approvedVideoHandoffMigrationSource = existsSync("migrations/015_phase2e_approved_video_handoff_board.sql")
  ? readFileSync("migrations/015_phase2e_approved_video_handoff_board.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE video_approved_handoff_records",
  "promotion_id uuid NOT NULL REFERENCES video_render_approved_promotions(id)",
  "handoff_status text NOT NULL DEFAULT 'pending_handoff'",
  "video_approved_handoff_records_promotion_key UNIQUE (promotion_id)",
  "approved_output_relative_path_snapshot ~ '^smoke/'",
  "CREATE INDEX video_approved_handoff_records_promotion_id_idx"
]) {
  if (approvedVideoHandoffMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2E.6 handoff board memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2E.6 handoff board belum memuat: ${requiredText}`);
  }
}

for (const forbiddenText of ["DROP ", "TRUNCATE", "DELETE ", "ALTER TABLE"]) {
  if (approvedVideoHandoffMigrationSource.includes(forbiddenText)) {
    fail(`Migration Phase 2E.6 harus additive-only, tidak boleh memuat: ${forbiddenText}`);
  } else {
    pass(`Migration Phase 2E.6 tidak memuat destructive SQL: ${forbiddenText}`);
  }
}

const manualPublicationPackageMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("016_"));
if (manualPublicationPackageMigrationFiles.length === 1 && manualPublicationPackageMigrationFiles[0] === "016_phase2f_manual_publication_packages.sql") {
  pass("Migration 016 Phase 2F manual publication packages tersedia");
} else {
  fail(`Migration 016 Phase 2F harus tepat satu file: ${manualPublicationPackageMigrationFiles.join(", ") || "tidak ada"}`);
}

const manualPublicationPackageMigrationSource = existsSync("migrations/016_phase2f_manual_publication_packages.sql")
  ? readFileSync("migrations/016_phase2f_manual_publication_packages.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE manual_publication_packages",
  "CREATE TABLE manual_publication_package_channels",
  "handoff_id uuid NOT NULL REFERENCES video_approved_handoff_records(id)",
  "manual_publication_packages_handoff_key UNIQUE (handoff_id)",
  "manual_publication_package_channels_package_channel_key UNIQUE (package_id, channel)",
  "approved_output_relative_path_snapshot ~ '^smoke/'",
  "CREATE INDEX manual_publication_packages_handoff_id_idx",
  "CREATE INDEX manual_publication_package_channels_package_id_idx"
]) {
  if (manualPublicationPackageMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2F.1 package memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2F.1 package belum memuat: ${requiredText}`);
  }
}

for (const forbiddenText of ["DROP ", "TRUNCATE", "DELETE ", "ALTER TABLE"]) {
  if (manualPublicationPackageMigrationSource.includes(forbiddenText)) {
    fail(`Migration Phase 2F.1 harus additive-only, tidak boleh memuat: ${forbiddenText}`);
  } else {
    pass(`Migration Phase 2F.1 tidak memuat destructive SQL: ${forbiddenText}`);
  }
}

const manualPublishChecklistMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("017_"));
if (manualPublishChecklistMigrationFiles.length === 1 && manualPublishChecklistMigrationFiles[0] === "017_phase2f_manual_publish_checklist_evidence.sql") {
  pass("Migration 017 Phase 2F manual publish checklist/evidence tersedia");
} else {
  fail(`Migration 017 Phase 2F harus tepat satu file: ${manualPublishChecklistMigrationFiles.join(", ") || "tidak ada"}`);
}

const manualPublishChecklistMigrationSource = existsSync("migrations/017_phase2f_manual_publish_checklist_evidence.sql")
  ? readFileSync("migrations/017_phase2f_manual_publish_checklist_evidence.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE manual_publish_checklist_items",
  "CREATE TABLE manual_publish_evidence_logs",
  "package_id uuid NOT NULL REFERENCES manual_publication_packages(id)",
  "manual_publish_checklist_items_channel_key UNIQUE (package_channel_id, checklist_key)",
  "evidence_type = ANY",
  "manual_publish_checklist_items_package_id_idx",
  "manual_publish_evidence_logs_package_id_idx"
]) {
  if (manualPublishChecklistMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2F.2 checklist/evidence memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2F.2 checklist/evidence belum memuat: ${requiredText}`);
  }
}

for (const forbiddenText of ["DROP ", "TRUNCATE", "DELETE ", "ALTER TABLE"]) {
  if (manualPublishChecklistMigrationSource.includes(forbiddenText)) {
    fail(`Migration Phase 2F.2 harus additive-only, tidak boleh memuat: ${forbiddenText}`);
  } else {
    pass(`Migration Phase 2F.2 tidak memuat destructive SQL: ${forbiddenText}`);
  }
}

const manualPublishCloseoutMigrationFiles = readdirSync("migrations").filter((fileName) => fileName.startsWith("018_"));
if (manualPublishCloseoutMigrationFiles.length === 1 && manualPublishCloseoutMigrationFiles[0] === "018_phase2f_manual_publish_closeouts.sql") {
  pass("Migration 018 Phase 2F manual publish closeouts tersedia");
} else {
  fail(`Migration 018 Phase 2F harus tepat satu file: ${manualPublishCloseoutMigrationFiles.join(", ") || "tidak ada"}`);
}

const manualPublishCloseoutMigrationSource = existsSync("migrations/018_phase2f_manual_publish_closeouts.sql")
  ? readFileSync("migrations/018_phase2f_manual_publish_closeouts.sql", "utf8")
  : "";
for (const requiredText of [
  "CREATE TABLE manual_publish_closeouts",
  "package_id uuid NOT NULL REFERENCES manual_publication_packages(id)",
  "content_item_id uuid NOT NULL REFERENCES content_items(id)",
  "manual_publish_closeouts_package_key UNIQUE (package_id)",
  "report_status_snapshot = 'ready_evidence_complete'",
  "checklist_done_snapshot = checklist_total_snapshot",
  "manual_url_channel_count_snapshot = selected_channel_count_snapshot",
  "manual_publish_closeouts_package_id_idx"
]) {
  if (manualPublishCloseoutMigrationSource.includes(requiredText)) {
    pass(`Migration Phase 2F.4 closeout memuat: ${requiredText}`);
  } else {
    fail(`Migration Phase 2F.4 closeout belum memuat: ${requiredText}`);
  }
}

for (const forbiddenText of ["DROP ", "TRUNCATE", "DELETE ", "ALTER TABLE"]) {
  if (manualPublishCloseoutMigrationSource.includes(forbiddenText)) {
    fail(`Migration Phase 2F.4 harus additive-only, tidak boleh memuat: ${forbiddenText}`);
  } else {
    pass(`Migration Phase 2F.4 tidak memuat destructive SQL: ${forbiddenText}`);
  }
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

if (dependencies.openai) {
  pass("Dependency OpenAI SDK tersedia untuk Phase 2A.5A");
} else {
  fail("Phase 2A.5A wajib memakai dependency resmi openai");
}

if (dependencies["@openai/agents"]) {
  fail("Phase 2A.5A tidak boleh memakai OpenAI Agents SDK");
} else {
  pass("Tidak ada OpenAI Agents SDK");
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
const unexpectedPhase2A4Migration006 = migration006Files.filter((fileName) => fileName !== "006_phase2b_footage_assets.sql");
if (unexpectedPhase2A4Migration006.length) {
  fail(`Phase 2A.4 tidak boleh membuat migration 006 untuk import/review: ${unexpectedPhase2A4Migration006.join(", ")}`);
} else {
  pass("Tidak ada migration 006 untuk Phase 2A.4 import/review");
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

const openAIProviderSource = existsSync("packages/campaign-planner/src/openai-provider.ts")
  ? readFileSync("packages/campaign-planner/src/openai-provider.ts", "utf8")
  : "";
const openAIPromptSource = existsSync("packages/campaign-planner/src/openai-prompt.ts")
  ? readFileSync("packages/campaign-planner/src/openai-prompt.ts", "utf8")
  : "";
const openAIConfigSource = existsSync("packages/campaign-planner/src/openai-config.ts")
  ? readFileSync("packages/campaign-planner/src/openai-config.ts", "utf8")
  : "";
const providerFactorySource = existsSync("workers/campaign-planner/src/provider-factory.ts")
  ? readFileSync("workers/campaign-planner/src/provider-factory.ts", "utf8")
  : "";
const openAITestsSource = readSources("tests/campaign-planner-openai");
const openAIComposeSource = existsSync("docker-compose.openai.yml") ? readFileSync("docker-compose.openai.yml", "utf8") : "";

for (const requiredOpenAIText of [
  "OpenAICampaignPlannerProvider",
  "zodTextFormat",
  "responses.parse",
  "store: false",
  "maxRetries: 0",
  "max_output_tokens",
  "background: false"
]) {
  if (openAIProviderSource.includes(requiredOpenAIText) || openAITestsSource.includes(requiredOpenAIText)) {
    pass(`Phase 2A.5A OpenAI memuat: ${requiredOpenAIText}`);
  } else {
    fail(`Phase 2A.5A OpenAI belum memuat: ${requiredOpenAIText}`);
  }
}

if (openAIPromptSource.includes("owner_brief adalah konteks tidak tepercaya") && openAIPromptSource.includes("strategy identity")) {
  pass("Prompt OpenAI versioned dan membatasi creative fields only");
} else {
  fail("Prompt OpenAI wajib memuat aturan owner brief untrusted dan immutable strategy");
}

if (providerFactorySource.includes("context.provider === \"fake\"") && providerFactorySource.includes("context.provider === \"openai\"")) {
  pass("Provider factory mendukung fake/openai tanpa silent fallback");
} else {
  fail("Provider factory wajib mendukung fake/openai");
}

if (openAIConfigSource.includes("CAMPAIGN_PLANNER_PROVIDER") && openAIConfigSource.includes("CAMPAIGN_PLANNER_OPENAI_ENABLED") && openAIConfigSource.includes("OPENAI_MODEL")) {
  pass("Config OpenAI nonsecret tersedia");
} else {
  fail("Config OpenAI nonsecret belum lengkap");
}

for (const forbiddenOpenAIText of [
  "from '@openai/agents'",
  "@openai/agents",
  "tools:",
  "web_search",
  "file_search",
  "previous_response_id"
]) {
  if (openAIProviderSource.includes(forbiddenOpenAIText)) {
    fail(`OpenAI provider tidak boleh memuat: ${forbiddenOpenAIText}`);
  } else {
    pass(`OpenAI provider tidak memuat: ${forbiddenOpenAIText}`);
  }
}

if (compose.includes("OPENAI_API_KEY_FILE") || compose.includes("OPENAI_API_KEY")) {
  fail("Default docker-compose.dev.yml tidak boleh membutuhkan OpenAI key");
} else {
  pass("Default Docker Compose tetap Fake dan tanpa OpenAI key");
}

if (openAIComposeSource.includes("OPENAI_API_KEY_FILE") && openAIComposeSource.includes("campaign-planner-worker") && !openAIComposeSource.includes("web-app:\n    environment:\n      OPENAI_API_KEY")) {
  pass("Docker OpenAI override opsional tersedia dan key hanya untuk worker");
} else {
  fail("Docker OpenAI override wajib mount secret hanya ke worker");
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
if (webSource.includes("OPENAI_API_KEY") || webSource.includes("OPENAI_API_KEY_FILE")) {
  fail("Web-app tidak boleh membaca OpenAI API key");
} else {
  pass("Web-app tidak membaca OpenAI API key");
}

const executablePlannerSources = [packageSource, planRunWebSource, campaignPlannerWorkerSource].join("\n");
if (executablePlannerSources.includes("from '@openai/agents'") || executablePlannerSources.includes("@openai/agents")) {
  fail("Campaign Planner tidak boleh import OpenAI Agents SDK");
} else {
  pass("Campaign Planner tidak import OpenAI Agents SDK");
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
