import { existsSync, readFileSync } from "node:fs";

const requiredPaths = [
  "docker-compose.dev.yml",
  ".env.example",
  ".env.local.example",
  "README.local.md",
  "package.json",
  "apps/web/Dockerfile",
  "apps/web/src/server.ts",
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
  "campaign-calendar",
  "shot-list",
  "footage-inbox",
  "draft-videos",
  "approval-board",
  "mockup-generator",
  "lead-log"
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
    pass(`Route dashboard tersedia: /${route}`);
  } else {
    fail(`Route dashboard belum ada: /${route}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("[check] Struktur skeleton local development siap.");
