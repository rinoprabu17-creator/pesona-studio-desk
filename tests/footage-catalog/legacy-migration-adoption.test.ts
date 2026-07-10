import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import pg from "pg";
import test from "node:test";

const { Client } = pg;
const baseUrl = process.env.DATABASE_URL || "postgresql://localhost:5432/pesona_studio_test";

function dbName(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

function urlWithDb(name: string): string {
  const url = new URL(baseUrl);
  url.pathname = `/${name}`;
  return url.toString();
}

async function withDatabase<T>(name: string, callback: (url: string) => Promise<T>): Promise<T> {
  const adminUrl = urlWithDb("postgres");
  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE "${name}"`);
  } finally {
    await admin.end();
  }

  try {
    return await callback(urlWithDb(name));
  } finally {
    const cleanup = new Client({ connectionString: adminUrl });
    await cleanup.connect();
    try {
      await cleanup.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`, [name]);
      await cleanup.query(`DROP DATABASE IF EXISTS "${name}"`);
    } finally {
      await cleanup.end();
    }
  }
}

function runScript(script: string, databaseUrl: string, extraEnv: Record<string, string> = {}) {
  return spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: databaseUrl, ...extraEnv },
    encoding: "utf8"
  });
}

function hasCommand(command: string): boolean {
  return spawnSync(command, ["--version"], { encoding: "utf8" }).status === 0;
}

async function applySqlFiles(databaseUrl: string, versions: string[]): Promise<void> {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    for (const version of versions) {
      const file = migrationFile(version);
      await client.query(readFileSync(file, "utf8"));
    }
  } finally {
    await client.end();
  }
}

function migrationFile(version: string): string {
  const files = ["001_phase1a_libraries.sql", "002_phase1b_campaigns.sql", "003_phase1b_content_items.sql", "004_phase1b_content_publications.sql", "005_phase2a_campaign_plan_staging.sql", "006_phase2b_footage_assets.sql", "007_phase2c_content_item_footage.sql", "008_phase2c_script_shot_plans.sql", "009_phase2d_video_draft_jobs.sql", "010_phase2d_render_manifests.sql", "011_phase2d_render_preflight_runs.sql", "012_phase2e_controlled_render_attempts.sql", "013_phase2e_render_review_gate.sql", "014_phase2e_approved_render_promotions.sql", "015_phase2e_approved_video_handoff_board.sql", "016_phase2f_manual_publication_packages.sql", "017_phase2f_manual_publish_checklist_evidence.sql", "018_phase2f_manual_publish_closeouts.sql", "019_operational_mvp.sql"];
  const match = files.find((file) => file.startsWith(version));
  if (!match) throw new Error(`missing migration fixture ${version}`);
  return join(process.cwd(), "migrations", match);
}

async function count(client: pg.Client, sql: string): Promise<number> {
  const result = await client.query(sql);
  return Number(Object.values(result.rows[0])[0]);
}

test("empty database runs migrations 001-019 normally", async () => {
  await withDatabase(dbName("psd_empty_migrate"), async (databaseUrl) => {
    const result = runScript("scripts/migrate.mjs", databaseUrl);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /applied 001_phase1a_libraries.sql/);
    assert.match(result.stdout, /applied 019_operational_mvp.sql/);
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    try {
      assert.equal(await count(client, `SELECT COUNT(*)::int FROM schema_migrations`), 19);
      assert.equal(await count(client, `SELECT COUNT(*)::int FROM information_schema.tables WHERE table_schema='public' AND table_name='ops_campaigns'`), 1);
    } finally {
      await client.end();
    }
  });
});

test("legacy database adopts 001-018, preserves data, applies 019, and reruns idempotently", async (t) => {
  await withDatabase(dbName("psd_legacy_migrate"), async (databaseUrl) => {
    await applySqlFiles(databaseUrl, Array.from({ length: 18 }, (_, index) => String(index + 1).padStart(3, "0")));
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    try {
      await client.query(`INSERT INTO products (code, name, active, sort_order) VALUES ('sample_product', 'Sample Product', true, 99)`);
      assert.equal(await count(client, `SELECT COUNT(*)::int FROM products WHERE code = 'sample_product'`), 1);
    } finally {
      await client.end();
    }

    const backupDir = join(process.cwd(), "tmp", "legacy-backup-test");
    if (hasCommand("pg_dump") && hasCommand("pg_restore")) {
      mkdirSync(backupDir, { recursive: true });
      const backup = runScript("scripts/db-backup.mjs", databaseUrl, { DB_BACKUP_DIR: backupDir });
      assert.equal(backup.status, 0, backup.stderr || backup.stdout);
      const backupPath = JSON.parse(backup.stdout.match(/\{[\s\S]*\}/)?.[0] || "{}").output_path;
      const restore = runScript("scripts/db-restore-test.mjs", databaseUrl, {
        APP_STORAGE_DIR: process.cwd(),
        BACKUP_FILE: backupPath
      });
      assert.equal(restore.status, 0, restore.stderr || restore.stdout);
      const restoreJson = JSON.parse(restore.stdout.match(/\{[\s\S]*\}/)?.[0] || "{}");
      assert.equal(restoreJson.migration_tracking, "legacy_absent");
      assert.equal(restoreJson.migration_count, 0);
    } else {
      t.diagnostic("pg_dump/pg_restore not available on host; Docker verification covers legacy backup/restore.");
    }

    const migrate = runScript("scripts/migrate.mjs", databaseUrl);
    assert.equal(migrate.status, 0, migrate.stderr || migrate.stdout);
    assert.match(migrate.stdout, /adopted legacy baseline 001-018/);
    assert.match(migrate.stdout, /applied 019_operational_mvp.sql/);

    const verify = new Client({ connectionString: databaseUrl });
    await verify.connect();
    try {
      assert.equal(await count(verify, `SELECT COUNT(*)::int FROM schema_migrations`), 19);
      assert.equal(await count(verify, `SELECT COUNT(*)::int FROM products WHERE code = 'sample_product'`), 1);
      assert.equal(await count(verify, `SELECT COUNT(*)::int FROM information_schema.tables WHERE table_schema='public' AND table_name='ops_campaigns'`), 1);
    } finally {
      await verify.end();
      rmSync(backupDir, { recursive: true, force: true });
    }

    const rerun = runScript("scripts/migrate.mjs", databaseUrl);
    assert.equal(rerun.status, 0, rerun.stderr || rerun.stdout);
    assert.match(rerun.stdout, /skip 001_phase1a_libraries.sql/);
    assert.match(rerun.stdout, /skip 019_operational_mvp.sql/);
  });
});

test("partial legacy schema is rejected without baseline or new operational DDL", async () => {
  await withDatabase(dbName("psd_partial_migrate"), async (databaseUrl) => {
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    try {
      await client.query(readFileSync(migrationFile("001"), "utf8"));
    } finally {
      await client.end();
    }

    const result = runScript("scripts/migrate.mjs", databaseUrl);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr || result.stdout, /legacy_schema_verification_failed/);

    const verify = new Client({ connectionString: databaseUrl });
    await verify.connect();
    try {
      assert.equal(await count(verify, `SELECT COUNT(*)::int FROM information_schema.tables WHERE table_schema='public' AND table_name='schema_migrations'`), 0);
      assert.equal(await count(verify, `SELECT COUNT(*)::int FROM information_schema.tables WHERE table_schema='public' AND table_name='ops_campaigns'`), 0);
    } finally {
      await verify.end();
    }
  });
});
