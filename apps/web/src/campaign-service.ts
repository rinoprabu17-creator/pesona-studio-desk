import { query } from "./db.ts";
import { CampaignError } from "./campaign-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import { validateCampaignInput } from "./validation/campaign-validation.ts";
import type { CampaignInput } from "./validation/campaign-validation.ts";

export type CampaignRow = {
  id: string;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  target_audience: string;
  primary_product_id: string | null;
  primary_product_code: string | null;
  primary_product_name: string | null;
  primary_product_active: boolean | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const campaignSelect = `
  SELECT c.id,
         c.code,
         c.name,
         c.start_date,
         c.end_date,
         c.target_audience,
         c.primary_product_id,
         p.code AS primary_product_code,
         p.name AS primary_product_name,
         p.active AS primary_product_active,
         c.status,
         c.notes,
         c.created_at,
         c.updated_at
  FROM campaigns c
  LEFT JOIN products p ON p.id = c.primary_product_id
`;

function formatDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value || "").slice(0, 10);
}

function mapCampaignRow(row: CampaignRow): CampaignRow {
  return {
    ...row,
    start_date: formatDate(row.start_date),
    end_date: formatDate(row.end_date)
  };
}

async function assertActiveProduct(productId: string | null): Promise<void> {
  if (!productId) {
    return;
  }

  const rows = await query<{ id: string; active: boolean }>(
    `SELECT id, active FROM products WHERE id = $1`,
    [productId]
  );

  if (!rows[0]) {
    throw new CampaignError("product_not_found", "Produk utama tidak ditemukan.", 404);
  }

  if (!rows[0].active) {
    throw new CampaignError("inactive_product", "Produk utama harus aktif.", 400);
  }
}

function handleCampaignWriteError(error: any): never {
  if (error?.code === "23505") {
    throw new CampaignError("duplicate_campaign_code", "Kode campaign sudah digunakan.", 409);
  }

  throw error;
}

export async function listCampaigns(): Promise<CampaignRow[]> {
  const rows = await query<CampaignRow>(
    `${campaignSelect}
     ORDER BY c.start_date DESC, c.created_at DESC`
  );
  return rows.map(mapCampaignRow);
}

export async function getCampaign(id: string): Promise<CampaignRow> {
  assertUuid(id);
  const rows = await query<CampaignRow>(
    `${campaignSelect}
     WHERE c.id = $1`,
    [id]
  );

  if (!rows[0]) {
    throw new CampaignError("campaign_not_found", "Campaign tidak ditemukan.", 404);
  }

  return mapCampaignRow(rows[0]);
}

export async function createCampaign(input: CampaignInput): Promise<CampaignRow> {
  const value = validateCampaignInput(input);
  await assertActiveProduct(value.primary_product_id);

  try {
    const rows = await query<CampaignRow>(
      `INSERT INTO campaigns (code, name, start_date, end_date, target_audience, primary_product_id, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        value.code,
        value.name,
        value.start_date,
        value.end_date,
        value.target_audience,
        value.primary_product_id,
        value.status,
        value.notes
      ]
    );
    return getCampaign(rows[0].id);
  } catch (error: any) {
    handleCampaignWriteError(error);
  }
}

export async function updateCampaign(id: string, input: CampaignInput): Promise<CampaignRow> {
  assertUuid(id);
  const value = validateCampaignInput(input);
  await assertActiveProduct(value.primary_product_id);

  try {
    const rows = await query<{ id: string }>(
      `UPDATE campaigns
       SET code = $2,
           name = $3,
           start_date = $4,
           end_date = $5,
           target_audience = $6,
           primary_product_id = $7,
           status = $8,
           notes = $9,
           updated_at = now()
       WHERE id = $1
       RETURNING id`,
      [
        id,
        value.code,
        value.name,
        value.start_date,
        value.end_date,
        value.target_audience,
        value.primary_product_id,
        value.status,
        value.notes
      ]
    );

    if (!rows[0]) {
      throw new CampaignError("campaign_not_found", "Campaign tidak ditemukan.", 404);
    }

    return getCampaign(rows[0].id);
  } catch (error: any) {
    handleCampaignWriteError(error);
  }
}
