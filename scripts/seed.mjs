import { readFileSync } from "node:fs";
import pg from "pg";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("[db:seed] DATABASE_URL belum diset.");
  process.exit(1);
}

const knowledgeBase = JSON.parse(readFileSync("configs/campaign_knowledge_base.json", "utf8"));
const client = new pg.Client({ connectionString: databaseUrl });

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
  if (item[field] === undefined || item[field] === null || item[field] === "") {
    return null;
  }

  return String(item[field]).trim();
}

function boolValue(item, field, fallback = true) {
  return typeof item[field] === "boolean" ? item[field] : fallback;
}

function sortOrder(item) {
  return Number.isInteger(item.sort_order) ? item.sort_order : 0;
}

async function seedProducts(products) {
  for (const product of products) {
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
}

async function seedColors(colors) {
  for (const color of colors) {
    await client.query(
      `INSERT INTO colors (code, name, hex_preview, active, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (code) DO NOTHING`,
      [
        requireText(color, "code", "colors"),
        requireText(color, "name", "colors"),
        optionalText(color, "hex_preview"),
        boolValue(color, "active"),
        sortOrder(color)
      ]
    );
  }
}

async function seedSchoolLevelColorDefaults(defaults) {
  for (const defaultRow of defaults) {
    const schoolLevel = requireText(defaultRow, "school_level", "school_level_color_defaults");
    if (schoolLevel === "smk") {
      continue;
    }

    const colorCode = requireText(defaultRow, "color_code", "school_level_color_defaults");
    const color = await client.query("SELECT id FROM colors WHERE code = $1", [colorCode]);
    if (!color.rows[0]) {
      throw new Error(`Warna untuk default ${schoolLevel} tidak ditemukan: ${colorCode}`);
    }

    await client.query(
      `INSERT INTO school_level_color_defaults (school_level, color_id, active)
       VALUES ($1, $2, $3)
       ON CONFLICT (school_level) DO NOTHING`,
      [schoolLevel, color.rows[0].id, boolValue(defaultRow, "active")]
    );
  }
}

async function seedOffers(offers) {
  for (const offer of offers) {
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
}

async function seedPainPoints(painPoints) {
  for (const painPoint of painPoints) {
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
}

await client.connect();

try {
  await client.query("BEGIN");
  await seedProducts(requiredArray("products"));
  await seedColors(requiredArray("colors"));
  await seedSchoolLevelColorDefaults(requiredArray("school_level_color_defaults"));
  await seedOffers(requiredArray("offers"));
  await seedPainPoints(requiredArray("pain_points"));
  await client.query("COMMIT");

  const counts = await client.query(`
    SELECT 'products' AS table_name, count(*)::int AS count FROM products
    UNION ALL SELECT 'colors', count(*)::int FROM colors
    UNION ALL SELECT 'offers', count(*)::int FROM offers
    UNION ALL SELECT 'pain_points', count(*)::int FROM pain_points
    UNION ALL SELECT 'school_level_color_defaults', count(*)::int FROM school_level_color_defaults
    ORDER BY table_name
  `);

  console.log("[db:seed] selesai.");
  for (const row of counts.rows) {
    console.log(`[db:seed] ${row.table_name}: ${row.count}`);
  }
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
