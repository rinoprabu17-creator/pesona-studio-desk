import { chmodSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadLocalEnv } from "./env.mjs";
import { pgEnvFromDatabaseUrl, resolveStorageRoot } from "./db-backup-helpers.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("[db:backup] DATABASE_URL belum diset.");
  process.exit(1);
}

const outputDir = process.env.DB_BACKUP_DIR || join(resolveStorageRoot(), "backups", "postgres");
mkdirSync(outputDir, { recursive: true });

const stamp = new Date().toISOString().replaceAll(":", "").replaceAll(".", "");
const outputPath = join(outputDir, `pesona-studio-${stamp}.dump`);
const result = spawnSync("pg_dump", ["--format=custom", "--no-owner", "--no-acl", "--file", outputPath], {
  encoding: "utf8",
  env: pgEnvFromDatabaseUrl(databaseUrl),
  stdio: ["ignore", "pipe", "pipe"]
});

if (result.status !== 0) {
  console.error(JSON.stringify({
    status: "failed",
    error: result.error?.message || result.stderr || `pg_dump_exit_${result.status}`
  }, null, 2));
  process.exit(result.status || 1);
}

chmodSync(outputPath, 0o600);
const sizeBytes = statSync(outputPath).size;
const sha256 = createHash("sha256").update(readFileSync(outputPath)).digest("hex");

console.log(JSON.stringify({
  status: "backup_created",
  output_path: outputPath,
  size_bytes: sizeBytes,
  sha256
}, null, 2));
