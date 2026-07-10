export const LEGACY_BASELINE_LAST_VERSION = "018";

export function parseMigrationFileName(fileName) {
  const match = fileName.match(/^(\d+)_(.+)\.sql$/);
  if (!match) {
    throw new Error(`Nama migration tidak valid: ${fileName}`);
  }
  return { version: match[1], name: match[2], fileName };
}

export function extractLegacyRequirements(migrationFiles) {
  const tables = new Map();
  const constraints = new Set();
  const indexes = new Set();

  for (const file of migrationFiles.filter((item) => item.version <= LEGACY_BASELINE_LAST_VERSION)) {
    for (const match of file.sql.matchAll(/CREATE TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([\s\S]*?)\n\);/g)) {
      const tableName = match[1];
      const body = match[2];
      const columns = tables.get(tableName) || new Set();
      for (const rawLine of body.split("\n")) {
        const line = rawLine.trim().replace(/,$/, "");
        if (!line || line.startsWith("CONSTRAINT ") || line.startsWith("PRIMARY KEY") || line.startsWith("FOREIGN KEY")) continue;
        const column = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s+/)?.[1];
        if (column && ["AND", "OR", "NOT", "CHECK", "UNIQUE", "REFERENCES"].includes(column.toUpperCase())) continue;
        if (column) columns.add(column);
      }
      for (const constraint of body.matchAll(/CONSTRAINT\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+/g)) {
        constraints.add(constraint[1]);
      }
      tables.set(tableName, columns);
    }

    for (const match of file.sql.matchAll(/ALTER TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)[\s\S]*?ADD CONSTRAINT\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+/g)) {
      constraints.add(match[2]);
    }

    for (const match of file.sql.matchAll(/CREATE INDEX\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+/g)) {
      indexes.add(match[1]);
    }
  }

  return {
    tables: Array.from(tables.entries()).map(([table, columns]) => ({ table, columns: Array.from(columns).sort() })).sort((a, b) => a.table.localeCompare(b.table)),
    constraints: Array.from(constraints).sort(),
    indexes: Array.from(indexes).sort()
  };
}

export async function schemaMigrationsExists(client) {
  const result = await client.query(`SELECT to_regclass('public.schema_migrations') AS regclass`);
  return Boolean(result.rows[0]?.regclass);
}

export async function publicSchemaObjectCount(client) {
  const result = await client.query(`
    SELECT COUNT(*)::int AS count
    FROM (
      SELECT table_name AS name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      UNION ALL
      SELECT indexname AS name FROM pg_indexes WHERE schemaname = 'public'
    ) objects
  `);
  return Number(result.rows[0].count);
}

export async function verifyLegacySchema(client, requirements) {
  const missing = [];

  for (const requirement of requirements.tables) {
    const tableResult = await client.query(`SELECT to_regclass($1) AS regclass`, [`public.${requirement.table}`]);
    if (!tableResult.rows[0]?.regclass) {
      missing.push(`table:${requirement.table}`);
      continue;
    }
    const columnResult = await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1`,
      [requirement.table]
    );
    const columns = new Set(columnResult.rows.map((row) => row.column_name));
    for (const column of requirement.columns) {
      if (!columns.has(column)) missing.push(`column:${requirement.table}.${column}`);
    }
  }

  if (requirements.constraints.length > 0) {
    const result = await client.query(
      `SELECT conname
       FROM pg_constraint
       WHERE connamespace = 'public'::regnamespace AND conname = ANY($1::text[])`,
      [requirements.constraints]
    );
    const found = new Set(result.rows.map((row) => row.conname));
    for (const constraint of requirements.constraints) {
      if (!found.has(constraint)) missing.push(`constraint:${constraint}`);
    }
  }

  if (requirements.indexes.length > 0) {
    const result = await client.query(
      `SELECT indexname
       FROM pg_indexes
       WHERE schemaname = 'public' AND indexname = ANY($1::text[])`,
      [requirements.indexes]
    );
    const found = new Set(result.rows.map((row) => row.indexname));
    for (const index of requirements.indexes) {
      if (!found.has(index)) missing.push(`index:${index}`);
    }
  }

  return {
    ok: missing.length === 0,
    missing,
    table_count: requirements.tables.length,
    column_count: requirements.tables.reduce((total, table) => total + table.columns.length, 0),
    constraint_count: requirements.constraints.length,
    index_count: requirements.indexes.length
  };
}

export async function adoptLegacyBaseline(client, migrationFiles, checksums) {
  const legacyFiles = migrationFiles.filter((file) => file.version <= LEGACY_BASELINE_LAST_VERSION);
  await client.query("BEGIN");
  try {
    await client.query(`
      CREATE TABLE schema_migrations (
        version text PRIMARY KEY,
        name text NOT NULL,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    for (const migration of legacyFiles) {
      await client.query(
        `INSERT INTO schema_migrations (version, name, checksum)
         VALUES ($1, $2, $3)`,
        [migration.version, migration.name, checksums.get(migration.fileName)]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
