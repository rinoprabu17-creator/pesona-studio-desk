import { query } from "./db.ts";
import { LibraryError } from "./library-errors.ts";
import { assertUuid, schoolLevels, validateColorInput } from "./validation/library-validation.ts";
import type { ColorInput } from "./validation/library-validation.ts";

export async function listProducts() {
  return query(
    `SELECT id, code, name, active, sort_order, created_at, updated_at
     FROM products
     ORDER BY sort_order, name`
  );
}

export async function listOffers() {
  return query(
    `SELECT id, code, title, public_phrase, condition_text, risk_note, active, sort_order, created_at, updated_at
     FROM offers
     ORDER BY sort_order, title`
  );
}

export async function listPainPoints() {
  return query(
    `SELECT id, code, title, buyer_fear, content_angle, safe_claim, avoid_claim, active, sort_order, created_at, updated_at
     FROM pain_points
     ORDER BY sort_order, title`
  );
}

export async function listColors(options: { activeOnly?: boolean } = {}) {
  const where = options.activeOnly ? "WHERE active = true" : "";
  return query(
    `SELECT id, code, name, hex_preview, active, sort_order, created_at, updated_at
     FROM colors
     ${where}
     ORDER BY sort_order, name`
  );
}

export async function getColor(id: string) {
  assertUuid(id);
  const rows = await query(
    `SELECT id, code, name, hex_preview, active, sort_order, created_at, updated_at
     FROM colors
     WHERE id = $1`,
    [id]
  );

  if (!rows[0]) {
    throw new LibraryError("not_found", "Warna tidak ditemukan.", 404);
  }

  return rows[0];
}

export async function createColor(input: ColorInput) {
  const value = validateColorInput(input, true);

  try {
    const rows = await query(
      `INSERT INTO colors (code, name, hex_preview, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING id, code, name, hex_preview, active, sort_order, created_at, updated_at`,
      [value.code, value.name, value.hex_preview, value.sort_order]
    );
    return rows[0];
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new LibraryError("duplicate_code", "Kode warna sudah digunakan.", 409);
    }
    throw error;
  }
}

export async function updateColor(id: string, input: ColorInput) {
  assertUuid(id);
  const value = validateColorInput(input, false);

  try {
    const rows = await query(
      `UPDATE colors
       SET name = $2,
           hex_preview = $3,
           sort_order = $4,
           updated_at = now()
       WHERE id = $1
       RETURNING id, code, name, hex_preview, active, sort_order, created_at, updated_at`,
      [id, value.name, value.hex_preview, value.sort_order]
    );

    if (!rows[0]) {
      throw new LibraryError("not_found", "Warna tidak ditemukan.", 404);
    }

    return rows[0];
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new LibraryError("duplicate_code", "Kode warna sudah digunakan.", 409);
    }
    throw error;
  }
}

export async function activateColor(id: string) {
  assertUuid(id);
  const rows = await query(
    `UPDATE colors
     SET active = true, updated_at = now()
     WHERE id = $1
     RETURNING id, code, name, hex_preview, active, sort_order, created_at, updated_at`,
    [id]
  );

  if (!rows[0]) {
    throw new LibraryError("not_found", "Warna tidak ditemukan.", 404);
  }

  return rows[0];
}

export async function deactivateColor(id: string) {
  assertUuid(id);
  const usage = await query(
    `SELECT school_level
     FROM school_level_color_defaults
     WHERE color_id = $1 AND active = true
     LIMIT 1`,
    [id]
  );

  if (usage[0]) {
    throw new LibraryError("color_in_use", "Warna masih dipakai oleh rekomendasi jenjang aktif.", 409);
  }

  const rows = await query(
    `UPDATE colors
     SET active = false, updated_at = now()
     WHERE id = $1
     RETURNING id, code, name, hex_preview, active, sort_order, created_at, updated_at`,
    [id]
  );

  if (!rows[0]) {
    throw new LibraryError("not_found", "Warna tidak ditemukan.", 404);
  }

  return rows[0];
}

export async function listSchoolLevelColorDefaults() {
  return query(
    `SELECT d.id,
            d.school_level,
            d.color_id,
            d.active,
            d.created_at,
            d.updated_at,
            c.code AS color_code,
            c.name AS color_name,
            c.hex_preview AS color_hex_preview,
            c.active AS color_active
     FROM school_level_color_defaults d
     JOIN colors c ON c.id = d.color_id
     ORDER BY CASE d.school_level
       WHEN 'sd' THEN 1
       WHEN 'smp' THEN 2
       WHEN 'sma' THEN 3
       WHEN 'smk' THEN 4
       WHEN 'mi' THEN 5
       WHEN 'mts' THEN 6
       WHEN 'ma' THEN 7
       ELSE 8
     END`
  );
}

export async function upsertSchoolLevelColorDefault(schoolLevel: string, colorId: string) {
  if (!schoolLevels.includes(schoolLevel as any)) {
    throw new LibraryError("invalid_school_level", "Jenjang sekolah tidak valid.", 400);
  }

  assertUuid(colorId);
  const colors = await query(`SELECT id FROM colors WHERE id = $1 AND active = true`, [colorId]);
  if (!colors[0]) {
    throw new LibraryError("inactive_color", "Warna default harus menunjuk warna aktif.", 400);
  }

  const rows = await query(
    `INSERT INTO school_level_color_defaults (school_level, color_id, active)
     VALUES ($1, $2, true)
     ON CONFLICT (school_level)
     DO UPDATE SET color_id = EXCLUDED.color_id,
                   active = true,
                   updated_at = now()
     RETURNING id, school_level, color_id, active, created_at, updated_at`,
    [schoolLevel, colorId]
  );

  return rows[0];
}
