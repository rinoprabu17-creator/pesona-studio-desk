import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();

const backupFile = process.env.BACKUP_FILE || process.argv[2];
if (!backupFile || !existsSync(backupFile)) {
  console.error("[db:restore-test] BACKUP_FILE harus menunjuk file backup yang ada.");
  process.exit(1);
}

const result = spawnSync("pg_restore", ["--list", backupFile], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
});

if (result.status !== 0) {
  console.error(JSON.stringify({
    status: "failed",
    error: result.error?.message || result.stderr || `pg_restore_exit_${result.status}`
  }, null, 2));
  process.exit(result.status || 1);
}

console.log(JSON.stringify({
  status: "restore_test_passed",
  backup_file: backupFile,
  listed_entries: result.stdout.split("\n").filter(Boolean).length,
  destructive_restore_performed: false
}, null, 2));
