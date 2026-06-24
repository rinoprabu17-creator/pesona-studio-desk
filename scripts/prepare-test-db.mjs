import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();

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

function quoteIdentifier(value) {
  return `"${value.replaceAll("\"", "\"\"")}"`;
}

function sanitizeDatabaseUrl(value) {
  try {
    const url = new URL(value);
    const databaseName = basename(url.pathname);
    return `${url.protocol}//${url.hostname}:${url.port || "5432"}/${databaseName}`;
  } catch {
    return "[invalid-test-database-url]";
  }
}

function maintenanceUrlFor(testDatabaseUrl) {
  const url = new URL(testDatabaseUrl);
  const targetDatabase = url.pathname.replace(/^\//, "");
  if (!targetDatabase) {
    throw new Error("TEST_DATABASE_URL harus menyertakan nama database test.");
  }

  const maintenance = new URL(url.toString());
  maintenance.pathname = "/postgres";
  return { maintenanceUrl: maintenance.toString(), targetDatabase };
}

async function ensureDatabaseExists(testDatabaseUrl) {
  const { maintenanceUrl, targetDatabase } = maintenanceUrlFor(testDatabaseUrl);
  const client = new pg.Client({ connectionString: maintenanceUrl });
  await client.connect();
  try {
    const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [targetDatabase]);
    if (!existing.rows[0]) {
      await client.query(`CREATE DATABASE ${quoteIdentifier(targetDatabase)}`);
      console.log(`[test-db] database dibuat: ${targetDatabase}`);
    } else {
      console.log(`[test-db] database tersedia: ${targetDatabase}`);
    }
  } finally {
    await client.end();
  }
}

async function migrateTestDatabase(testDatabaseUrl) {
  const client = new pg.Client({ connectionString: testDatabaseUrl });
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
      .filter((fileName) => parseMigrationFile(fileName).version <= "016")
      .sort();

    for (const fileName of files) {
      const migration = parseMigrationFile(fileName);
      const path = join(migrationsDir, fileName);
      const sql = readFileSync(path, "utf8");
      const sqlChecksum = checksum(sql);
      const existing = await client.query("SELECT checksum FROM schema_migrations WHERE version = $1", [
        migration.version
      ]);

      if (existing.rows[0]) {
        if (existing.rows[0].checksum !== sqlChecksum) {
          throw new Error(`Checksum mismatch untuk migration ${fileName}.`);
        }
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
        console.log(`[test-db] migration applied ${fileName}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}

async function seedTestDatabase(testDatabaseUrl) {
  const knowledgeBase = JSON.parse(readFileSync("configs/campaign_knowledge_base.json", "utf8"));
  const client = new pg.Client({ connectionString: testDatabaseUrl });

  function requiredArray(name) {
    if (!Array.isArray(knowledgeBase[name])) {
      throw new Error(`campaign_knowledge_base.json harus memiliki array ${name}.`);
    }
    return knowledgeBase[name];
  }

  function requireText(item, field, collectionName) {
    if (typeof item[field] !== "string" || item[field].trim() === "") {
      throw new Error(`${collectionName}.${field} wajib berupa string.`);
    }
    return item[field].trim();
  }

  function optionalText(item, field) {
    if (item[field] === undefined || item[field] === null || item[field] === "") return null;
    return String(item[field]).trim();
  }

  function boolValue(item, field, fallback = true) {
    return typeof item[field] === "boolean" ? item[field] : fallback;
  }

  function sortOrder(item) {
    return Number.isInteger(item.sort_order) ? item.sort_order : 0;
  }

  await client.connect();
  try {
    await client.query("BEGIN");
    for (const product of requiredArray("products")) {
      await client.query(
        `INSERT INTO products (code, name, active, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code)
         DO UPDATE SET name = EXCLUDED.name,
                       active = EXCLUDED.active,
                       sort_order = EXCLUDED.sort_order,
                       updated_at = now()`,
        [
          requireText(product, "code", "products"),
          requireText(product, "name", "products"),
          boolValue(product, "active"),
          sortOrder(product)
        ]
      );
    }

    for (const color of requiredArray("colors")) {
      await client.query(
        `INSERT INTO colors (code, name, hex_preview, active, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (code)
         DO UPDATE SET name = EXCLUDED.name,
                       hex_preview = EXCLUDED.hex_preview,
                       active = EXCLUDED.active,
                       sort_order = EXCLUDED.sort_order,
                       updated_at = now()`,
        [
          requireText(color, "code", "colors"),
          requireText(color, "name", "colors"),
          optionalText(color, "hex_preview"),
          boolValue(color, "active"),
          sortOrder(color)
        ]
      );
    }

    for (const defaultRow of requiredArray("school_level_color_defaults")) {
      const schoolLevel = requireText(defaultRow, "school_level", "school_level_color_defaults");
      if (schoolLevel === "smk") continue;
      const color = await client.query("SELECT id FROM colors WHERE code = $1", [
        requireText(defaultRow, "color_code", "school_level_color_defaults")
      ]);
      if (!color.rows[0]) {
        throw new Error(`Warna untuk default ${schoolLevel} tidak ditemukan.`);
      }

      await client.query(
        `INSERT INTO school_level_color_defaults (school_level, color_id, active)
         VALUES ($1, $2, $3)
         ON CONFLICT (school_level)
         DO UPDATE SET color_id = EXCLUDED.color_id,
                       active = EXCLUDED.active,
                       updated_at = now()`,
        [schoolLevel, color.rows[0].id, boolValue(defaultRow, "active")]
      );
    }

    for (const offer of requiredArray("offers")) {
      await client.query(
        `INSERT INTO offers (code, title, public_phrase, condition_text, risk_note, active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (code)
         DO UPDATE SET title = EXCLUDED.title,
                       public_phrase = EXCLUDED.public_phrase,
                       condition_text = EXCLUDED.condition_text,
                       risk_note = EXCLUDED.risk_note,
                       active = EXCLUDED.active,
                       sort_order = EXCLUDED.sort_order,
                       updated_at = now()`,
        [
          requireText(offer, "code", "offers"),
          requireText(offer, "title", "offers"),
          requireText(offer, "public_phrase", "offers"),
          optionalText(offer, "condition_text"),
          optionalText(offer, "risk_note"),
          boolValue(offer, "active"),
          sortOrder(offer)
        ]
      );
    }

    for (const painPoint of requiredArray("pain_points")) {
      await client.query(
        `INSERT INTO pain_points (code, title, buyer_fear, content_angle, safe_claim, avoid_claim, active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (code)
         DO UPDATE SET title = EXCLUDED.title,
                       buyer_fear = EXCLUDED.buyer_fear,
                       content_angle = EXCLUDED.content_angle,
                       safe_claim = EXCLUDED.safe_claim,
                       avoid_claim = EXCLUDED.avoid_claim,
                       active = EXCLUDED.active,
                       sort_order = EXCLUDED.sort_order,
                       updated_at = now()`,
        [
          requireText(painPoint, "code", "pain_points"),
          requireText(painPoint, "title", "pain_points"),
          optionalText(painPoint, "buyer_fear"),
          optionalText(painPoint, "content_angle"),
          optionalText(painPoint, "safe_claim"),
          optionalText(painPoint, "avoid_claim"),
          boolValue(painPoint, "active"),
          sortOrder(painPoint)
        ]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

function assertSafeTestUrl(testDatabaseUrl) {
  const devDatabaseUrl = process.env.DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL wajib diset untuk integration tests.");
  }
  if (devDatabaseUrl && devDatabaseUrl === testDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL tidak boleh sama dengan DATABASE_URL development.");
  }
}

export async function prepareTestDatabase() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  assertSafeTestUrl(testDatabaseUrl);
  console.log(`[test-db] preparing ${sanitizeDatabaseUrl(testDatabaseUrl)}`);
  await ensureDatabaseExists(testDatabaseUrl);
  await migrateTestDatabase(testDatabaseUrl);
  await seedTestDatabase(testDatabaseUrl);
  console.log("[test-db] siap.");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await prepareTestDatabase();
}
