import { query } from "./db.ts";
import { FootageAssetError } from "./footage-asset-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import {
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
  product_code?: string | null;
  theme?: string | null;
  shot_type?: string | null;
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

async function assertActiveProduct(id: string | null): Promise<void> {
  if (!id) return;
  const rows = await query<{ id: string; active: boolean }>(`SELECT id, active FROM products WHERE id = $1`, [id]);
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

  if (filters.product_code) {
    const productCode = String(filters.product_code).trim();
    if (productCode) {
      params.push(productCode);
      where.push(`p.code = $${params.length}`);
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

  const rows = await query<FootageAssetRow>(
    `${footageAssetSelect}
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY f.created_at DESC, f.filename ASC`,
    params
  );
  return rows.map(mapFootageAssetRow);
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
