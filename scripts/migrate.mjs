import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import pg from "pg";
import { loadLocalEnv } from "./env.mjs";
import {
  adoptLegacyBaseline,
  extractLegacyRequirements,
  parseMigrationFileName,
  publicSchemaObjectCount,
  schemaMigrationsExists,
  verifyLegacySchema
} from "./migration-legacy-adoption.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("[db:migrate] DATABASE_URL belum diset.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl });
const migrationsDir = join(process.cwd(), "migrations");

function checksum(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

await client.connect();

try {
  const migrationFiles = readdirSync(migrationsDir)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort()
    .map((fileName) => {
      const migration = parseMigrationFileName(fileName);
      const sql = readFileSync(join(migrationsDir, fileName), "utf8");
      return { ...migration, sql };
    });
  const checksums = new Map(migrationFiles.map((file) => [file.fileName, checksum(file.sql)]));

  const hasMigrationTracking = await schemaMigrationsExists(client);
  if (!hasMigrationTracking) {
    const objectCount = await publicSchemaObjectCount(client);
    if (objectCount === 0) {
      await client.query(`
        CREATE TABLE schema_migrations (
          version text PRIMARY KEY,
          name text NOT NULL,
          checksum text NOT NULL,
          applied_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      console.log("[db:migrate] initialized schema_migrations for empty database.");
    } else {
      const requirements = extractLegacyRequirements(migrationFiles);
      const verification = await verifyLegacySchema(client, requirements);
      if (!verification.ok) {
        throw new Error(`legacy_schema_verification_failed: ${verification.missing.join(", ")}`);
      }
      await adoptLegacyBaseline(client, migrationFiles, checksums);
      console.log(
        `[db:migrate] adopted legacy baseline 001-018 ` +
          `(tables=${verification.table_count}, columns=${verification.column_count}, constraints=${verification.constraint_count}, indexes=${verification.index_count}).`
      );
    }
  }

  for (const migration of migrationFiles) {
    const sqlChecksum = checksums.get(migration.fileName);
    const existing = await client.query(
      "SELECT checksum FROM schema_migrations WHERE version = $1",
      [migration.version]
    );

    if (existing.rows[0]) {
      if (existing.rows[0].checksum !== sqlChecksum) {
        throw new Error(
          `Checksum mismatch untuk migration ${migration.fileName}. File migration yang sudah diterapkan tidak boleh diubah.`
        );
      }

      console.log(`[db:migrate] skip ${migration.fileName}`);
      continue;
    }

    await client.query("BEGIN");
    try {
      await client.query(migration.sql);
      await client.query(
        `INSERT INTO schema_migrations (version, name, checksum)
         VALUES ($1, $2, $3)`,
        [migration.version, migration.name, sqlChecksum]
      );
      await client.query("COMMIT");
      console.log(`[db:migrate] applied ${migration.fileName}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  console.log("[db:migrate] selesai.");
} finally {
  await client.end();
}
