import { existsSync, readFileSync } from "node:fs";

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
  "migrations/001_phase1a_libraries.sql",
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
  "/api/school-level-color-defaults"
];

const forbiddenPhase1BTables = [
  "CREATE TABLE campaigns",
  "CREATE TABLE content_items",
  "CREATE TABLE content_publications"
];

let failed = false;

function fail(message) {
  failed = true;
  console.error(`[check] FAIL ${message}`);
}

function pass(message) {
  console.log(`[check] OK ${message}`);
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

const compose = existsSync("docker-compose.dev.yml") ? readFileSync("docker-compose.dev.yml", "utf8") : "";
for (const service of requiredServices) {
  if (compose.includes(service)) {
    pass(`Service Compose tersedia: ${service.replace(":", "")}`);
  } else {
    fail(`Service Compose belum ada: ${service.replace(":", "")}`);
  }
}

const webSource = existsSync("apps/web/src/server.ts") ? readFileSync("apps/web/src/server.ts", "utf8") : "";
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

if (failed) {
  process.exit(1);
}

console.log("[check] Struktur Phase 1A local development siap.");
