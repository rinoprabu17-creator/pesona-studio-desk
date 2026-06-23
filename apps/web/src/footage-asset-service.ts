import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { FootageAssetError } from "./footage-asset-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import {
  footageSchoolLevels,
  footageShotTypes,
  validateFootageAssetInput,
  validateFootageStatus
} from "./validation/footage-asset-validation.ts";
import type { FootageAssetInput } from "./validation/footage-asset-validation.ts";

export type FootageAssetRow = {
  id: string;
  relative_path: string;
  filename: string;
  file_extension: string;
  size_bytes: number;
  status: string;
  product_id: string | null;
  product_code: string | null;
  product_name: string | null;
  product_active: boolean | null;
  school_level: string | null;
  theme: string | null;
  shot_type: string;
  quality_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type FootageAssetFilters = {
  status?: string | null;
  product_id?: string | null;
  product_code?: string | null;
  school_level?: string | null;
  theme?: string | null;
  shot_type?: string | null;
  incomplete?: boolean | string | null;
};

export type FootageBatchUpdateInput = {
  ids?: unknown;
  updates?: Record<string, unknown>;
};

export type FootageBatchUpdateResult = {
  requested_count: number;
  updated_count: number;
  ids: string[];
};

const footageAssetSelect = `
  SELECT f.id,
         f.relative_path,
         f.filename,
         f.file_extension,
         f.size_bytes,
         f.status,
         f.product_id,
         p.code AS product_code,
         p.name AS product_name,
         p.active AS product_active,
         f.school_level,
         f.theme,
         f.shot_type,
         f.quality_score,
         f.notes,
         f.created_at,
         f.updated_at
  FROM footage_assets f
  LEFT JOIN products p ON p.id = f.product_id
`;

async function assertActiveProduct(id: string | null, client?: DatabaseClient): Promise<void> {
  if (!id) return;
  const sql = `SELECT id, active FROM products WHERE id = $1`;
  const rows = client
    ? (await client.query<{ id: string; active: boolean }>(sql, [id])).rows
    : await query<{ id: string; active: boolean }>(sql, [id]);
  if (!rows[0]) throw new FootageAssetError("product_not_found", "Produk tidak ditemukan.", 404);
  if (!rows[0].active) throw new FootageAssetError("inactive_product", "Produk footage harus aktif.", 400);
}

function handleWriteError(error: any): never {
  if (error?.code === "23505") {
    throw new FootageAssetError("duplicate_footage_path", "Relative path footage sudah tercatat.", 409);
  }
  throw error;
}

function mapFootageAssetRow(row: FootageAssetRow): FootageAssetRow {
  return {
    ...row,
    size_bytes: Number(row.size_bytes),
    quality_score: row.quality_score === null ? null : Number(row.quality_score)
  };
}

export async function listFootageAssets(filters: FootageAssetFilters = {}): Promise<FootageAssetRow[]> {
  const where: string[] = [];
  const params: unknown[] = [];

  if (filters.status) {
    params.push(validateFootageStatus(filters.status));
    where.push(`f.status = $${params.length}`);
  }

  if (filters.product_id) {
    const productId = String(filters.product_id).trim();
    if (productId) {
      assertUuid(productId);
      params.push(productId);
      where.push(`f.product_id = $${params.length}`);
    }
  }

  if (filters.product_code) {
    const productCode = String(filters.product_code).trim();
    if (productCode) {
      params.push(productCode);
      where.push(`p.code = $${params.length}`);
    }
  }

  if (filters.school_level) {
    const schoolLevel = String(filters.school_level).trim();
    if (schoolLevel) {
      if (!footageSchoolLevels.includes(schoolLevel as any)) {
        throw new FootageAssetError("invalid_school_level", "Jenjang footage tidak valid.", 400);
      }
      params.push(schoolLevel);
      where.push(`f.school_level = $${params.length}`);
    }
  }

  if (filters.theme) {
    const theme = String(filters.theme).trim();
    if (theme) {
      params.push(`%${theme}%`);
      where.push(`f.theme ILIKE $${params.length}`);
    }
  }

  if (filters.shot_type) {
    const shotType = String(filters.shot_type).trim();
    if (!footageShotTypes.includes(shotType as any)) {
      throw new FootageAssetError("invalid_shot_type", "Shot type footage tidak valid.", 400);
    }
    params.push(shotType);
    where.push(`f.shot_type = $${params.length}`);
  }

  if (filters.incomplete === true || filters.incomplete === "true" || filters.incomplete === "1") {
    where.push(`(f.status = 'new' OR f.shot_type = 'other' OR f.product_id IS NULL OR f.theme IS NULL OR f.quality_score IS NULL)`);
  }

  const rows = await query<FootageAssetRow>(
    `${footageAssetSelect}
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY f.created_at DESC, f.filename ASC`,
    params
  );
  return rows.map(mapFootageAssetRow);
}

function normalizeBatchIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new FootageAssetError("invalid_batch_ids", "Daftar footage wajib berupa array ID.", 400);
  }

  const ids = [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))];
  if (ids.length === 0) {
    throw new FootageAssetError("empty_batch_ids", "Pilih minimal satu footage untuk batch update.", 400);
  }
  if (ids.length > 100) {
    throw new FootageAssetError("too_many_batch_ids", "Batch update maksimal 100 footage sekaligus.", 400);
  }

  for (const id of ids) {
    assertUuid(id);
  }
  return ids;
}

function normalizeNullableTextField(value: unknown, max: number, code: string, message: string): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  if (text.length > max) {
    throw new FootageAssetError(code, message, 400);
  }
  return text;
}

function normalizeNullableUuidField(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  assertUuid(text);
  return text;
}

function normalizeNullableQualityScoreField(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new FootageAssetError("invalid_quality_score", "Quality score harus kosong atau angka 1 sampai 5.", 400);
  }
  return parsed;
}

function normalizeBatchUpdates(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new FootageAssetError("invalid_batch_updates", "Update batch wajib berisi field metadata yang diizinkan.", 400);
  }

  const input = value as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  const allowed = new Set(["status", "shot_type", "school_level", "theme", "product_id", "quality_score", "notes"]);

  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) {
      throw new FootageAssetError("invalid_batch_update_field", `Field batch update tidak diizinkan: ${key}.`, 400);
    }
  }

  if ("status" in input) updates.status = validateFootageStatus(input.status);

  if ("shot_type" in input) {
    const shotType = typeof input.shot_type === "string" ? input.shot_type.trim() : "";
    if (!footageShotTypes.includes(shotType as any)) {
      throw new FootageAssetError("invalid_shot_type", "Shot type footage tidak valid.", 400);
    }
    updates.shot_type = shotType;
  }

  if ("school_level" in input) {
    const schoolLevel = typeof input.school_level === "string" ? input.school_level.trim() : "";
    if (schoolLevel && !footageSchoolLevels.includes(schoolLevel as any)) {
      throw new FootageAssetError("invalid_school_level", "Jenjang footage tidak valid.", 400);
    }
    updates.school_level = schoolLevel || null;
  }

  if ("theme" in input) {
    updates.theme = normalizeNullableTextField(input.theme, 160, "invalid_theme", "Tema footage maksimal 160 karakter.");
  }

  if ("product_id" in input) {
    updates.product_id = normalizeNullableUuidField(input.product_id);
  }

  if ("quality_score" in input) {
    updates.quality_score = normalizeNullableQualityScoreField(input.quality_score);
  }

  if ("notes" in input) {
    updates.notes = normalizeNullableTextField(input.notes, 2000, "invalid_notes", "Catatan footage maksimal 2000 karakter.");
  }

  if (Object.keys(updates).length === 0) {
    throw new FootageAssetError("empty_batch_updates", "Pilih minimal satu metadata untuk diupdate.", 400);
  }

  return updates;
}

export async function batchUpdateFootageAssets(input: FootageBatchUpdateInput): Promise<FootageBatchUpdateResult> {
  const ids = normalizeBatchIds(input.ids);
  const updates = normalizeBatchUpdates(input.updates);

  return withTransaction(async (client) => {
    if ("product_id" in updates) {
      await assertActiveProduct(updates.product_id as string | null, client);
    }

    const existing = await client.query<{ id: string }>(`SELECT id FROM footage_assets WHERE id = ANY($1::uuid[]) FOR UPDATE`, [ids]);
    if (existing.rows.length !== ids.length) {
      throw new FootageAssetError("footage_asset_not_found", "Sebagian footage tidak ditemukan.", 404);
    }

    const params: unknown[] = [ids];
    const setClauses = Object.entries(updates).map(([field, value]) => {
      params.push(value);
      return `${field} = $${params.length}`;
    });

    const result = await client.query<{ id: string }>(
      `UPDATE footage_assets
       SET ${setClauses.join(", ")},
           updated_at = now()
       WHERE id = ANY($1::uuid[])
       RETURNING id`,
      params
    );

    return {
      requested_count: ids.length,
      updated_count: result.rows.length,
      ids: result.rows.map((row) => row.id)
    };
  });
}

export async function getFootageAsset(id: string): Promise<FootageAssetRow> {
  assertUuid(id);
  const rows = await query<FootageAssetRow>(`${footageAssetSelect} WHERE f.id = $1`, [id]);
  if (!rows[0]) {
    throw new FootageAssetError("footage_asset_not_found", "Footage tidak ditemukan.", 404);
  }
  return mapFootageAssetRow(rows[0]);
}

export async function createFootageAsset(input: FootageAssetInput): Promise<FootageAssetRow> {
  const value = validateFootageAssetInput(input);
  await assertActiveProduct(value.product_id);

  try {
    const rows = await query<{ id: string }>(
      `INSERT INTO footage_assets (
         relative_path, filename, file_extension, size_bytes, status,
         product_id, school_level, theme, shot_type, quality_score, notes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        value.relative_path,
        value.filename,
        value.file_extension,
        value.size_bytes,
        value.status,
        value.product_id,
        value.school_level,
        value.theme,
        value.shot_type,
        value.quality_score,
        value.notes
      ]
    );
    return getFootageAsset(rows[0].id);
  } catch (error: any) {
    handleWriteError(error);
  }
}

export async function updateFootageAsset(id: string, input: FootageAssetInput): Promise<FootageAssetRow> {
  assertUuid(id);
  const value = validateFootageAssetInput(input);
  await assertActiveProduct(value.product_id);

  try {
    const rows = await query<{ id: string }>(
      `UPDATE footage_assets
       SET relative_path = $2,
           filename = $3,
           file_extension = $4,
           size_bytes = $5,
           status = $6,
           product_id = $7,
           school_level = $8,
           theme = $9,
           shot_type = $10,
           quality_score = $11,
           notes = $12,
           updated_at = now()
       WHERE id = $1
       RETURNING id`,
      [
        id,
        value.relative_path,
        value.filename,
        value.file_extension,
        value.size_bytes,
        value.status,
        value.product_id,
        value.school_level,
        value.theme,
        value.shot_type,
        value.quality_score,
        value.notes
      ]
    );

    if (!rows[0]) {
      throw new FootageAssetError("footage_asset_not_found", "Footage tidak ditemukan.", 404);
    }
    return getFootageAsset(rows[0].id);
  } catch (error: any) {
    handleWriteError(error);
  }
}
