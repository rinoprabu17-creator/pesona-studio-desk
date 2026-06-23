import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { ContentItemFootageError } from "./content-item-footage-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import {
  validateContentItemFootageSelectionInput,
  validateContentItemFootageSelectionUpdateInput
} from "./validation/content-item-footage-validation.ts";
import type {
  ContentItemFootageSelectionInput,
  ContentItemFootageSelectionUpdateInput
} from "./validation/content-item-footage-validation.ts";

export type ContentItemFootageSelectionRow = {
  id: string;
  content_item_id: string;
  footage_asset_id: string;
  sequence_number: number;
  role: string;
  usage_note: string | null;
  created_at: string;
  updated_at: string;
  relative_path: string;
  filename: string;
  file_extension: string;
  size_bytes: number;
  footage_status: string;
  product_id: string | null;
  product_code: string | null;
  product_name: string | null;
  school_level: string | null;
  theme: string | null;
  shot_type: string;
  quality_score: number | null;
  notes: string | null;
};

const contentItemFootageSelect = `
  SELECT s.id,
         s.content_item_id,
         s.footage_asset_id,
         s.sequence_number,
         s.role,
         s.usage_note,
         s.created_at,
         s.updated_at,
         f.relative_path,
         f.filename,
         f.file_extension,
         f.size_bytes,
         f.status AS footage_status,
         f.product_id,
         p.code AS product_code,
         p.name AS product_name,
         f.school_level,
         f.theme,
         f.shot_type,
         f.quality_score,
         f.notes
  FROM content_item_footage_selections s
  JOIN footage_assets f ON f.id = s.footage_asset_id
  LEFT JOIN products p ON p.id = f.product_id
`;

function mapSelectionRow(row: ContentItemFootageSelectionRow): ContentItemFootageSelectionRow {
  return {
    ...row,
    sequence_number: Number(row.sequence_number),
    size_bytes: Number(row.size_bytes),
    quality_score: row.quality_score === null ? null : Number(row.quality_score)
  };
}

async function assertContentItemExists(contentItemId: string, client?: DatabaseClient): Promise<void> {
  const result = client
    ? await client.query<{ id: string }>(`SELECT id FROM content_items WHERE id = $1`, [contentItemId])
    : { rows: await query<{ id: string }>(`SELECT id FROM content_items WHERE id = $1`, [contentItemId]) };
  if (!result.rows[0]) {
    throw new ContentItemFootageError("content_item_not_found", "Content item tidak ditemukan.", 404);
  }
}

async function assertSelectableFootageAsset(footageAssetId: string, client?: DatabaseClient): Promise<void> {
  const result = client
    ? await client.query<{ id: string; status: string }>(`SELECT id, status FROM footage_assets WHERE id = $1`, [footageAssetId])
    : { rows: await query<{ id: string; status: string }>(`SELECT id, status FROM footage_assets WHERE id = $1`, [footageAssetId]) };
  const row = result.rows[0];
  if (!row) {
    throw new ContentItemFootageError("footage_asset_not_found", "Footage tidak ditemukan.", 404);
  }
  if (!["reviewed", "approved"].includes(row.status)) {
    throw new ContentItemFootageError("footage_not_selectable", "Footage harus berstatus reviewed atau approved sebelum dipilih untuk konten.", 400);
  }
}

function handleWriteError(error: any): never {
  if (error?.code === "23505") {
    if (error.constraint === "content_item_footage_item_sequence_key") {
      throw new ContentItemFootageError("duplicate_footage_sequence", "Urutan footage sudah dipakai pada konten ini.", 409);
    }
    if (error.constraint === "content_item_footage_item_asset_key") {
      throw new ContentItemFootageError("duplicate_content_footage", "Footage ini sudah dipilih untuk konten tersebut.", 409);
    }
  }
  throw error;
}

export async function listContentItemFootageSelections(contentItemId: string): Promise<ContentItemFootageSelectionRow[]> {
  assertUuid(contentItemId);
  await assertContentItemExists(contentItemId);
  const rows = await query<ContentItemFootageSelectionRow>(
    `${contentItemFootageSelect}
     WHERE s.content_item_id = $1
     ORDER BY s.sequence_number ASC, s.created_at ASC`,
    [contentItemId]
  );
  return rows.map(mapSelectionRow);
}

export async function getContentItemFootageSelection(selectionId: string): Promise<ContentItemFootageSelectionRow> {
  assertUuid(selectionId);
  const rows = await query<ContentItemFootageSelectionRow>(
    `${contentItemFootageSelect}
     WHERE s.id = $1`,
    [selectionId]
  );
  if (!rows[0]) {
    throw new ContentItemFootageError("content_item_footage_not_found", "Pilihan footage konten tidak ditemukan.", 404);
  }
  return mapSelectionRow(rows[0]);
}

async function assertSelectionBelongsToContentItem(contentItemId: string, selectionId: string): Promise<void> {
  assertUuid(contentItemId);
  assertUuid(selectionId);
  await assertContentItemExists(contentItemId);

  const rows = await query<{ content_item_id: string }>(
    `SELECT content_item_id
     FROM content_item_footage_selections
     WHERE id = $1`,
    [selectionId]
  );
  if (!rows[0]) {
    throw new ContentItemFootageError("content_item_footage_not_found", "Pilihan footage konten tidak ditemukan.", 404);
  }
  if (rows[0].content_item_id !== contentItemId) {
    throw new ContentItemFootageError("content_item_footage_mismatch", "Pilihan footage tidak dimiliki konten ini.", 404);
  }
}

export async function addContentItemFootageSelection(
  contentItemId: string,
  input: ContentItemFootageSelectionInput
): Promise<ContentItemFootageSelectionRow> {
  assertUuid(contentItemId);
  const value = validateContentItemFootageSelectionInput(input);

  try {
    const selectionId = await withTransaction(async (client) => {
      await assertContentItemExists(contentItemId, client);
      await assertSelectableFootageAsset(value.footage_asset_id, client);
      const result = await client.query<{ id: string }>(
        `INSERT INTO content_item_footage_selections (
           content_item_id, footage_asset_id, sequence_number, role, usage_note
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [contentItemId, value.footage_asset_id, value.sequence_number, value.role, value.usage_note]
      );
      return result.rows[0].id;
    });
    return getContentItemFootageSelection(selectionId);
  } catch (error: any) {
    handleWriteError(error);
  }
}

export async function updateContentItemFootageSelection(
  selectionId: string,
  input: ContentItemFootageSelectionUpdateInput
): Promise<ContentItemFootageSelectionRow> {
  assertUuid(selectionId);
  const updates = validateContentItemFootageSelectionUpdateInput(input);

  try {
    const updatedId = await withTransaction(async (client) => {
      const existing = await client.query<{ id: string }>(
        `SELECT id FROM content_item_footage_selections WHERE id = $1 FOR UPDATE`,
        [selectionId]
      );
      if (!existing.rows[0]) {
        throw new ContentItemFootageError("content_item_footage_not_found", "Pilihan footage konten tidak ditemukan.", 404);
      }

      const params: unknown[] = [selectionId];
      const setClauses = Object.entries(updates).map(([field, value]) => {
        params.push(value);
        return `${field} = $${params.length}`;
      });
      const result = await client.query<{ id: string }>(
        `UPDATE content_item_footage_selections
         SET ${setClauses.join(", ")},
             updated_at = now()
         WHERE id = $1
         RETURNING id`,
        params
      );
      return result.rows[0].id;
    });
    return getContentItemFootageSelection(updatedId);
  } catch (error: any) {
    handleWriteError(error);
  }
}

export async function updateContentItemFootageSelectionForContentItem(
  contentItemId: string,
  selectionId: string,
  input: ContentItemFootageSelectionUpdateInput
): Promise<ContentItemFootageSelectionRow> {
  await assertSelectionBelongsToContentItem(contentItemId, selectionId);
  return updateContentItemFootageSelection(selectionId, input);
}

export async function removeContentItemFootageSelection(selectionId: string): Promise<{ removed: true; id: string }> {
  assertUuid(selectionId);
  const result = await query<{ id: string }>(
    `DELETE FROM content_item_footage_selections
     WHERE id = $1
     RETURNING id`,
    [selectionId]
  );
  if (!result[0]) {
    throw new ContentItemFootageError("content_item_footage_not_found", "Pilihan footage konten tidak ditemukan.", 404);
  }
  return { removed: true, id: result[0].id };
}

export async function removeContentItemFootageSelectionForContentItem(
  contentItemId: string,
  selectionId: string
): Promise<{ removed: true; id: string }> {
  await assertSelectionBelongsToContentItem(contentItemId, selectionId);
  return removeContentItemFootageSelection(selectionId);
}
