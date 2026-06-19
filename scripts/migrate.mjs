import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import pg from "pg";
import { loadLocalEnv } from "./env.mjs";

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

function parseMigrationFile(fileName) {
  const match = fileName.match(/^(\d+)_(.+)\.sql$/);
  if (!match) {
    throw new Error(`Nama migration tidak valid: ${fileName}`);
  }

  return {
    version: match[1],
    name: match[2],
    fileName
  };
}

await client.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      name text NOT NULL,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const files = readdirSync(migrationsDir)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  for (const fileName of files) {
    const migration = parseMigrationFile(fileName);
    const path = join(migrationsDir, fileName);
    const sql = readFileSync(path, "utf8");
    const sqlChecksum = checksum(sql);
    const existing = await client.query(
      "SELECT checksum FROM schema_migrations WHERE version = $1",
      [migration.version]
    );

    if (existing.rows[0]) {
      if (existing.rows[0].checksum !== sqlChecksum) {
        throw new Error(
          `Checksum mismatch untuk migration ${fileName}. File migration yang sudah diterapkan tidak boleh diubah.`
        );
      }

      console.log(`[db:migrate] skip ${fileName}`);
      continue;
    }

    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(
        `INSERT INTO schema_migrations (version, name, checksum)
         VALUES ($1, $2, $3)`,
        [migration.version, migration.name, sqlChecksum]
      );
      await client.query("COMMIT");
      console.log(`[db:migrate] applied ${fileName}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  console.log("[db:migrate] selesai.");
} finally {
  await client.end();
}
