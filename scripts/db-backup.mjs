import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("[db:backup] DATABASE_URL belum diset.");
  process.exit(1);
}

const outputDir = process.env.DB_BACKUP_DIR || join(process.cwd(), "storage", "backups", "postgres");
mkdirSync(outputDir, { recursive: true });

const stamp = new Date().toISOString().replaceAll(":", "").replaceAll(".", "");
const outputPath = join(outputDir, `pesona-studio-${stamp}.dump`);
const result = spawnSync("pg_dump", ["--format=custom", "--no-owner", "--no-acl", "--file", outputPath, databaseUrl], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
});

if (result.status !== 0) {
  console.error(JSON.stringify({
    status: "failed",
    error: result.stderr || `pg_dump_exit_${result.status}`
  }, null, 2));
  process.exit(result.status || 1);
}

console.log(JSON.stringify({
  status: "backup_created",
  output_path: outputPath
}, null, 2));
