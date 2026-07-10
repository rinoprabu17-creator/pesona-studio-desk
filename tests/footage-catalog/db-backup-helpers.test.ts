import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  assertSafeRestoreTarget,
  databaseNameFromUrl,
  databaseUrlWithName,
  makeRestoreTestDatabaseName,
  pgEnvFromDatabaseUrl,
  resolveBackupPath,
  resolveStorageRoot
} from "../../scripts/db-backup-helpers.mjs";

test("database backup helpers keep backup files under configured storage", () => {
  const env = { APP_STORAGE_DIR: "/app/storage" };
  assert.equal(resolveStorageRoot(env, "/app"), "/app/storage");
  assert.equal(resolveBackupPath("/app/storage/backups/postgres/a.dump", env, "/app"), "/app/storage/backups/postgres/a.dump");
  assert.throws(() => resolveBackupPath("/tmp/a.dump", env, "/app"), /backup_file_must_be_under_storage/);
});

test("database restore target must be temporary and never current or production", () => {
  const databaseUrl = "postgresql://pesona:secret@postgres:5432/pesona_studio";
  const tempName = makeRestoreTestDatabaseName(1, "abc123");
  assert.match(tempName, /^psd_restore_test_/);
  assert.doesNotThrow(() => assertSafeRestoreTarget(databaseUrl, tempName));
  assert.throws(() => assertSafeRestoreTarget(databaseUrl, "pesona_studio"), /restore_target_must_use_restore_test_prefix|current/);
  assert.throws(() => assertSafeRestoreTarget(databaseUrl, "postgres"), /restore_target_must_use_restore_test_prefix|production/);
});

test("database URL helpers map env without putting password in command arguments", () => {
  const databaseUrl = "postgresql://pesona:secret-value@postgres:5432/pesona_studio";
  const env = pgEnvFromDatabaseUrl(databaseUrl, {});
  assert.equal(env.PGHOST, "postgres");
  assert.equal(env.PGDATABASE, "pesona_studio");
  assert.equal(env.PGUSER, "pesona");
  assert.equal(env.PGPASSWORD, "secret-value");
  assert.equal(databaseNameFromUrl(databaseUrl), "pesona_studio");
  assert.equal(databaseNameFromUrl(databaseUrlWithName(databaseUrl, "psd_restore_test_1")), "psd_restore_test_1");
});

test("web-app Dockerfile includes PostgreSQL client and backup runtime files", () => {
  const dockerfile = readFileSync(join(process.cwd(), "apps/web/Dockerfile"), "utf8");
  assert.match(dockerfile, /postgresql16-client/);
  assert.match(dockerfile, /COPY migrations \.\/migrations/);
  assert.match(dockerfile, /COPY scripts\/db-backup\.mjs/);
  assert.match(dockerfile, /COPY scripts\/db-restore-test\.mjs/);
});
