import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";

export const RESTORE_TEST_DB_PREFIX = "psd_restore_test_";

export function resolveStorageRoot(env = process.env, cwd = process.cwd()) {
  if (env.APP_STORAGE_DIR) return resolve(env.APP_STORAGE_DIR);
  if (existsSync("/app/storage")) return "/app/storage";
  return resolve(cwd, "storage");
}

export function resolveBackupPath(input, env = process.env, cwd = process.cwd()) {
  if (!input) throw new Error("backup_file_required");
  const storageRoot = resolveStorageRoot(env, cwd);
  const backupPath = resolve(input);
  if (backupPath !== storageRoot && !backupPath.startsWith(`${storageRoot}${sep}`)) {
    throw new Error(`backup_file_must_be_under_storage: ${storageRoot}`);
  }
  return backupPath;
}

export function pgEnvFromDatabaseUrl(databaseUrl, baseEnv = process.env) {
  const url = new URL(databaseUrl);
  return {
    ...baseEnv,
    PGHOST: url.hostname,
    PGPORT: url.port || "5432",
    PGDATABASE: decodeURIComponent(url.pathname.replace(/^\//, "")),
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password)
  };
}

export function databaseNameFromUrl(databaseUrl) {
  return decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, ""));
}

export function databaseUrlWithName(databaseUrl, databaseName) {
  const url = new URL(databaseUrl);
  url.pathname = `/${databaseName}`;
  return url.toString();
}

export function makeRestoreTestDatabaseName(now = Date.now(), randomText = Math.random().toString(36).slice(2, 10)) {
  return `${RESTORE_TEST_DB_PREFIX}${now}_${randomText}`.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 62);
}

export function assertSafeRestoreTarget(databaseUrl, targetDatabaseName) {
  const current = databaseNameFromUrl(databaseUrl);
  if (!targetDatabaseName.startsWith(RESTORE_TEST_DB_PREFIX)) {
    throw new Error("restore_target_must_use_restore_test_prefix");
  }
  if (targetDatabaseName === current) {
    throw new Error("restore_target_must_not_be_current_database");
  }
  if (["pesona_studio", "postgres", "template0", "template1"].includes(targetDatabaseName)) {
    throw new Error("restore_target_must_not_be_production_or_template_database");
  }
}

export function quoteIdentifier(identifier) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/.test(identifier)) {
    throw new Error("invalid_database_identifier");
  }
  return `"${identifier.replaceAll('"', '""')}"`;
}
