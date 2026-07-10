import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import pg from "pg";
import { loadLocalEnv } from "./env.mjs";
import {
  assertSafeRestoreTarget,
  databaseUrlWithName,
  makeRestoreTestDatabaseName,
  pgEnvFromDatabaseUrl,
  quoteIdentifier,
  resolveBackupPath
} from "./db-backup-helpers.mjs";

loadLocalEnv();

const backupFile = process.env.BACKUP_FILE || process.argv[2];
if (!backupFile) {
  console.error("[db:restore-test] BACKUP_FILE harus menunjuk file backup yang ada.");
  process.exit(1);
}

const backupPath = resolveBackupPath(backupFile);
if (!existsSync(backupPath)) {
  console.error("[db:restore-test] BACKUP_FILE harus menunjuk file backup yang ada.");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("[db:restore-test] DATABASE_URL belum diset.");
  process.exit(1);
}

const tempDatabaseName = makeRestoreTestDatabaseName();
assertSafeRestoreTarget(databaseUrl, tempDatabaseName);
const maintenanceUrl = databaseUrlWithName(databaseUrl, "postgres");
const tempDatabaseUrl = databaseUrlWithName(databaseUrl, tempDatabaseName);
const maintenanceClient = new pg.Client({ connectionString: maintenanceUrl });
let tempCreated = false;
let maintenanceConnected = false;

try {
  const listResult = spawnSync("pg_restore", ["--list", backupPath], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (listResult.status !== 0) {
    throw new Error(listResult.error?.message || listResult.stderr || `pg_restore_list_exit_${listResult.status}`);
  }

  await maintenanceClient.connect();
  maintenanceConnected = true;
  await maintenanceClient.query(`CREATE DATABASE ${quoteIdentifier(tempDatabaseName)}`);
  tempCreated = true;

  const restoreResult = spawnSync("pg_restore", ["--no-owner", "--no-acl", "--dbname", tempDatabaseName, backupPath], {
    encoding: "utf8",
    env: pgEnvFromDatabaseUrl(tempDatabaseUrl),
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (restoreResult.status !== 0) {
    throw new Error(restoreResult.error?.message || restoreResult.stderr || `pg_restore_exit_${restoreResult.status}`);
  }

  const verifyClient = new pg.Client({ connectionString: tempDatabaseUrl });
  await verifyClient.connect();
  try {
    const tableResult = await verifyClient.query(
      `SELECT COUNT(*)::int AS table_count
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
    );
    const migrationResult = await verifyClient.query(`SELECT COUNT(*)::int AS migration_count FROM schema_migrations`);
    if (Number(tableResult.rows[0].table_count) < 1) throw new Error("restore_test_has_no_public_tables");
    if (Number(migrationResult.rows[0].migration_count) < 1) throw new Error("restore_test_has_no_schema_migrations");

    console.log(JSON.stringify({
      status: "restore_test_passed",
      backup_file: backupPath,
      temporary_database: tempDatabaseName,
      listed_entries: listResult.stdout.split("\n").filter(Boolean).length,
      table_count: Number(tableResult.rows[0].table_count),
      migration_count: Number(migrationResult.rows[0].migration_count),
      production_database_mutated: false,
      temporary_database_dropped: true
    }, null, 2));
  } finally {
    await verifyClient.end();
  }
} catch (error) {
  console.error(JSON.stringify({
    status: "failed",
    temporary_database: tempDatabaseName,
    error: error instanceof Error ? error.message : String(error)
  }, null, 2));
  process.exitCode = 1;
} finally {
  if (maintenanceConnected) {
    if (tempCreated) {
      await maintenanceClient.query(
        `SELECT pg_terminate_backend(pid)
         FROM pg_stat_activity
         WHERE datname = $1 AND pid <> pg_backend_pid()`,
        [tempDatabaseName]
      );
      await maintenanceClient.query(`DROP DATABASE IF EXISTS ${quoteIdentifier(tempDatabaseName)}`);
    }
    await maintenanceClient.end();
  }
}
