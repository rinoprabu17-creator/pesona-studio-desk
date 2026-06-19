import { existsSync, readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const requiredPaths = [
  "docker-compose.dev.yml",
  ".env.example",
  ".env.local.example",
  "README.local.md",
  "package.json",
  "package-lock.json",
  "apps/web/Dockerfile",
  "apps/web/src/server.ts",
  "apps/web/src/db.ts",
  "apps/web/src/library-service.ts",
  "apps/web/src/campaign-service.ts",
  "apps/web/src/campaign-errors.ts",
  "apps/web/src/content-item-service.ts",
  "apps/web/src/content-item-errors.ts",
  "apps/web/src/http/request.ts",
  "apps/web/src/http/response.ts",
  "apps/web/src/routes/campaign-api-routes.ts",
  "apps/web/src/routes/campaign-page-routes.ts",
  "apps/web/src/routes/content-item-api-routes.ts",
  "apps/web/src/routes/content-item-page-routes.ts",
  "apps/web/src/routes/library-api-routes.ts",
  "apps/web/src/routes/library-page-routes.ts",
  "apps/web/src/views/campaign-pages.ts",
  "apps/web/src/views/content-item-pages.ts",
  "apps/web/src/views/layout.ts",
  "apps/web/src/views/library-pages.ts",
  "apps/web/src/validation/campaign-validation.ts",
  "apps/web/src/validation/content-item-validation.ts",
  "apps/web/src/validation/library-validation.ts",
  "migrations/001_phase1a_libraries.sql",
  "migrations/002_phase1b_campaigns.sql",
  "migrations/003_phase1b_content_items.sql",
  "scripts/migrate.mjs",
  "scripts/seed.mjs",
  "workers/video/Dockerfile",
  "workers/video/src/index.ts",
  "workers/mockup/Dockerfile",
  "workers/mockup/src/index.ts",
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
  "/content-items",
  "/content-items/new",
  "/api/content-items"
];

const forbiddenPhase1BTables = [
  "CREATE TABLE campaigns",
  "CREATE TABLE content_items",
  "CREATE TABLE content_publications"
];

let failed = false;

const lockedMigrationHashes = {
  "migrations/001_phase1a_libraries.sql": "dc77e3d5bfd4b2208112282e50c5d084f298a83e6ab94d8cf252636c76e1cfef",
  "migrations/002_phase1b_campaigns.sql": "5beb7f1dd1cf0d5e9f283dd4ad6ac337bbb2af190e519c15832e2cabef4a3525"
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

if (failed) {
  process.exit(1);
}

console.log("[check] Struktur Phase 1A local development siap.");
