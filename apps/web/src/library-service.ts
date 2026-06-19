import { query } from "./db.ts";

export type LibraryErrorCode =
  | "bad_request"
  | "duplicate_code"
  | "invalid_hex"
  | "invalid_school_level"
  | "invalid_uuid"
  | "not_found"
  | "color_in_use"
  | "inactive_color";

export class LibraryError extends Error {
  code: LibraryErrorCode;
  statusCode: number;

  constructor(code: LibraryErrorCode, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export type ColorInput = {
  code?: string;
  name?: string;
  hex_preview?: string | null;
  sort_order?: number;
};

export const schoolLevels = ["sd", "smp", "sma", "smk", "mi", "mts", "ma", "other"] as const;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const slugPattern = /^[a-z0-9_]+$/;
const hexPattern = /^#[0-9A-Fa-f]{6}$/;

export function assertUuid(value: string): void {
  if (!uuidPattern.test(value)) {
    throw new LibraryError("invalid_uuid", "ID tidak valid.", 400);
  }
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalHex(value: unknown): string | null {
  const text = normalizeText(value);
  return text === "" ? null : text;
}

function parseSortOrder(value: unknown): number {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new LibraryError("bad_request", "Urutan harus berupa angka bulat.", 400);
  }

  return parsed;
}

function validateColorInput(input: ColorInput, requireCode: boolean): Required<ColorInput> {
  const code = normalizeText(input.code);
  const name = normalizeText(input.name);
  const hexPreview = normalizeOptionalHex(input.hex_preview);
  const sortOrder = parseSortOrder(input.sort_order);

  if (requireCode && !code) {
    throw new LibraryError("bad_request", "Kode warna wajib diisi.", 400);
  }

  if (code && !slugPattern.test(code)) {
    throw new LibraryError("bad_request", "Kode warna hanya boleh huruf kecil, angka, dan underscore.", 400);
  }

  if (!name) {
    throw new LibraryError("bad_request", "Nama warna wajib diisi.", 400);
  }

  if (hexPreview && !hexPattern.test(hexPreview)) {
    throw new LibraryError("invalid_hex", "Preview hex harus menggunakan format #RRGGBB.", 400);
  }

  return {
    code,
    name,
    hex_preview: hexPreview,
    sort_order: sortOrder
  };
}

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
