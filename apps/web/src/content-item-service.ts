import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { ContentItemError } from "./content-item-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import {
  productionTransitions,
  validateContentItemInput,
  validateProductionStatus
} from "./validation/content-item-validation.ts";
import type { ContentItemInput } from "./validation/content-item-validation.ts";

export type ContentItemRow = {
  id: string;
  campaign_id: string;
  campaign_code: string;
  campaign_name: string;
  campaign_start_date: string;
  campaign_end_date: string;
  sequence_number: number;
  content_code: string;
  title: string;
  planned_content_date: string;
  product_id: string | null;
  product_code: string | null;
  product_name: string | null;
  product_active: boolean | null;
  school_level: string | null;
  color_id: string | null;
  color_code: string | null;
  color_name: string | null;
  color_hex_preview: string | null;
  color_active: boolean | null;
  audience_segment: string;
  target_audience: string;
  content_pillar: string;
  primary_offer_id: string | null;
  offer_title: string | null;
  offer_public_phrase: string | null;
  offer_condition_text: string | null;
  offer_risk_note: string | null;
  offer_active: boolean | null;
  primary_pain_point_id: string | null;
  pain_point_title: string | null;
  pain_point_buyer_fear: string | null;
  pain_point_content_angle: string | null;
  pain_point_safe_claim: string | null;
  pain_point_avoid_claim: string | null;
  pain_point_active: boolean | null;
  hook: string;
  angle: string;
  cta_text: string;
  cta_keyword: string | null;
  production_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type CampaignPeriod = {
  id: string;
  code: string;
  start_date: string;
  end_date: string;
};

const contentItemSelect = `
  SELECT ci.id,
         ci.campaign_id,
         c.code AS campaign_code,
         c.name AS campaign_name,
         c.start_date AS campaign_start_date,
         c.end_date AS campaign_end_date,
         ci.sequence_number,
         ci.content_code,
         ci.title,
         ci.planned_content_date,
         ci.product_id,
         p.code AS product_code,
         p.name AS product_name,
         p.active AS product_active,
         ci.school_level,
         ci.color_id,
         color.code AS color_code,
         color.name AS color_name,
         color.hex_preview AS color_hex_preview,
         color.active AS color_active,
         ci.audience_segment,
         ci.target_audience,
         ci.content_pillar,
         ci.primary_offer_id,
         offer.title AS offer_title,
         offer.public_phrase AS offer_public_phrase,
         offer.condition_text AS offer_condition_text,
         offer.risk_note AS offer_risk_note,
         offer.active AS offer_active,
         ci.primary_pain_point_id,
         pain.title AS pain_point_title,
         pain.buyer_fear AS pain_point_buyer_fear,
         pain.content_angle AS pain_point_content_angle,
         pain.safe_claim AS pain_point_safe_claim,
         pain.avoid_claim AS pain_point_avoid_claim,
         pain.active AS pain_point_active,
         ci.hook,
         ci.angle,
         ci.cta_text,
         ci.cta_keyword,
         ci.production_status,
         ci.notes,
         ci.created_at,
         ci.updated_at
  FROM content_items ci
  JOIN campaigns c ON c.id = ci.campaign_id
  LEFT JOIN products p ON p.id = ci.product_id
  LEFT JOIN colors color ON color.id = ci.color_id
  LEFT JOIN offers offer ON offer.id = ci.primary_offer_id
  LEFT JOIN pain_points pain ON pain.id = ci.primary_pain_point_id
`;

function formatDate(value: unknown): string {
  if (value instanceof Date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(value);
    const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
    return `${part("year")}-${part("month")}-${part("day")}`;
  }
  return String(value || "").slice(0, 10);
}

function mapContentItemRow(row: ContentItemRow): ContentItemRow {
  return {
    ...row,
    campaign_start_date: formatDate(row.campaign_start_date),
    campaign_end_date: formatDate(row.campaign_end_date),
    planned_content_date: formatDate(row.planned_content_date)
  };
}

async function clientRows<T>(client: DatabaseClient, text: string, params: unknown[] = []): Promise<T[]> {
  const result = await client.query(text, params);
  return result.rows as T[];
}

function assertWithinCampaignPeriod(date: string, campaign: CampaignPeriod): void {
  if (date < formatDate(campaign.start_date) || date > formatDate(campaign.end_date)) {
    throw new ContentItemError("content_date_outside_campaign", "Tanggal konten harus berada dalam periode campaign.", 400);
  }
}

async function getCampaignPeriodWithClient(client: DatabaseClient, id: string, lock = false): Promise<CampaignPeriod> {
  const rows = await clientRows<CampaignPeriod>(
    client,
    `SELECT id, code, start_date, end_date FROM campaigns WHERE id = $1 ${lock ? "FOR UPDATE" : ""}`,
    [id]
  );
  if (!rows[0]) {
    throw new ContentItemError("campaign_not_found", "Campaign tidak ditemukan.", 404);
  }
  return rows[0];
}

async function getCampaignPeriod(id: string): Promise<CampaignPeriod> {
  const rows = await query<CampaignPeriod>(
    `SELECT id, code, start_date, end_date FROM campaigns WHERE id = $1`,
    [id]
  );
  if (!rows[0]) {
    throw new ContentItemError("campaign_not_found", "Campaign tidak ditemukan.", 404);
  }
  return rows[0];
}

async function assertActiveProductWithClient(client: DatabaseClient, id: string | null): Promise<void> {
  if (!id) return;
  const rows = await clientRows<{ id: string; active: boolean }>(client, `SELECT id, active FROM products WHERE id = $1`, [id]);
  if (!rows[0]) throw new ContentItemError("product_not_found", "Produk tidak ditemukan.", 404);
  if (!rows[0].active) throw new ContentItemError("inactive_product", "Produk harus aktif.", 400);
}

async function assertActiveProduct(id: string | null): Promise<void> {
  await assertActiveProductWithClient({ query: async (text: string, params: unknown[] = []) => ({ rows: await query(text, params) }) } as DatabaseClient, id);
}

async function assertActiveColorWithClient(client: DatabaseClient, id: string | null): Promise<void> {
  if (!id) return;
  const rows = await clientRows<{ id: string; active: boolean }>(client, `SELECT id, active FROM colors WHERE id = $1`, [id]);
  if (!rows[0]) throw new ContentItemError("color_not_found", "Warna tidak ditemukan.", 404);
  if (!rows[0].active) throw new ContentItemError("inactive_color", "Warna harus aktif.", 400);
}

async function assertActiveColor(id: string | null): Promise<void> {
  await assertActiveColorWithClient({ query: async (text: string, params: unknown[] = []) => ({ rows: await query(text, params) }) } as DatabaseClient, id);
}

async function assertActiveOfferWithClient(client: DatabaseClient, id: string | null): Promise<void> {
  if (!id) return;
  const rows = await clientRows<{ id: string; active: boolean }>(client, `SELECT id, active FROM offers WHERE id = $1`, [id]);
  if (!rows[0]) throw new ContentItemError("offer_not_found", "Offer tidak ditemukan.", 404);
  if (!rows[0].active) throw new ContentItemError("inactive_offer", "Offer harus aktif.", 400);
}

async function assertActiveOffer(id: string | null): Promise<void> {
  await assertActiveOfferWithClient({ query: async (text: string, params: unknown[] = []) => ({ rows: await query(text, params) }) } as DatabaseClient, id);
}

async function assertActivePainPointWithClient(client: DatabaseClient, id: string | null): Promise<void> {
  if (!id) return;
  const rows = await clientRows<{ id: string; active: boolean }>(client, `SELECT id, active FROM pain_points WHERE id = $1`, [id]);
  if (!rows[0]) throw new ContentItemError("pain_point_not_found", "Pain point tidak ditemukan.", 404);
  if (!rows[0].active) throw new ContentItemError("inactive_pain_point", "Pain point harus aktif.", 400);
}

async function assertActivePainPoint(id: string | null): Promise<void> {
  await assertActivePainPointWithClient({ query: async (text: string, params: unknown[] = []) => ({ rows: await query(text, params) }) } as DatabaseClient, id);
}

async function contentPublicationsTableExists(): Promise<boolean> {
  const rows = await query<{ exists: boolean }>(
    `SELECT to_regclass('public.content_publications') IS NOT NULL AS exists`
  );
  return Boolean(rows[0]?.exists);
}

async function assertNoActivePublications(contentItemId: string): Promise<void> {
  if (!(await contentPublicationsTableExists())) {
    return;
  }

  const rows = await query<{ id: string }>(
    `SELECT id
     FROM content_publications
     WHERE content_item_id = $1
       AND publication_status NOT IN ('posted', 'cancelled')
     LIMIT 1`,
    [contentItemId]
  );

  if (rows[0]) {
    throw new ContentItemError(
      "active_publications_exist",
      "Konten belum dapat diarsipkan karena masih memiliki publikasi yang belum selesai atau belum dibatalkan.",
      409
    );
  }
}

function handleWriteError(error: any): never {
  if (error?.code === "23505") {
    throw new ContentItemError("content_code_conflict", "Content code atau sequence sudah digunakan.", 409);
  }
  throw error;
}

export async function listContentItems(filters: { campaign_id?: string | null; production_status?: string | null } = {}): Promise<ContentItemRow[]> {
  const where: string[] = [];
  const params: unknown[] = [];

  if (filters.campaign_id) {
    assertUuid(filters.campaign_id);
    params.push(filters.campaign_id);
    where.push(`ci.campaign_id = $${params.length}`);
  }

  if (filters.production_status) {
    const status = validateProductionStatus(filters.production_status);
    params.push(status);
    where.push(`ci.production_status = $${params.length}`);
  }

  const rows = await query<ContentItemRow>(
    `${contentItemSelect}
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY ci.planned_content_date ASC, c.code ASC, ci.sequence_number ASC`,
    params
  );
  return rows.map(mapContentItemRow);
}

export async function getContentItem(id: string): Promise<ContentItemRow> {
  assertUuid(id);
  const rows = await query<ContentItemRow>(`${contentItemSelect} WHERE ci.id = $1`, [id]);
  if (!rows[0]) {
    throw new ContentItemError("content_item_not_found", "Content item tidak ditemukan.", 404);
  }
  return mapContentItemRow(rows[0]);
}

export async function createContentItemWithClient(
  client: DatabaseClient,
  input: ContentItemInput
): Promise<{ id: string; content_code: string; sequence_number: number }> {
  const value = validateContentItemInput(input, { requireCampaign: true });
  await assertActiveProductWithClient(client, value.product_id);
  await assertActiveColorWithClient(client, value.color_id);
  await assertActiveOfferWithClient(client, value.primary_offer_id);
  await assertActivePainPointWithClient(client, value.primary_pain_point_id);

  const campaign = await getCampaignPeriodWithClient(client, value.campaign_id!, true);
  assertWithinCampaignPeriod(value.planned_content_date, campaign);

  const sequenceRows = await clientRows<{ max_sequence: number | null }>(
    client,
    `SELECT MAX(sequence_number) AS max_sequence FROM content_items WHERE campaign_id = $1`,
    [campaign.id]
  );
  const sequenceNumber = Number(sequenceRows[0]?.max_sequence || 0) + 1;
  const contentCode = `${campaign.code}-D${String(sequenceNumber).padStart(2, "0")}`;

  const rows = await clientRows<{ id: string }>(
    client,
    `INSERT INTO content_items (
       campaign_id, sequence_number, content_code, title, planned_content_date,
       product_id, school_level, color_id, audience_segment, target_audience,
       content_pillar, primary_offer_id, primary_pain_point_id, hook, angle,
       cta_text, cta_keyword, notes
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
     RETURNING id`,
    [
      campaign.id,
      sequenceNumber,
      contentCode,
      value.title,
      value.planned_content_date,
      value.product_id,
      value.school_level,
      value.color_id,
      value.audience_segment,
      value.target_audience,
      value.content_pillar,
      value.primary_offer_id,
      value.primary_pain_point_id,
      value.hook,
      value.angle,
      value.cta_text,
      value.cta_keyword,
      value.notes
    ]
  );

  return { id: rows[0].id, content_code: contentCode, sequence_number: sequenceNumber };
}

export async function createContentItem(input: ContentItemInput): Promise<ContentItemRow> {
  try {
    const insertedId = await withTransaction(async (client) => {
      const created = await createContentItemWithClient(client, input);
      return created.id;
    });

    return getContentItem(insertedId);
  } catch (error: any) {
    handleWriteError(error);
  }
}

export async function updateContentItem(id: string, input: ContentItemInput): Promise<ContentItemRow> {
  assertUuid(id);
  if (input.campaign_id !== undefined || input.sequence_number !== undefined || input.content_code !== undefined) {
    throw new ContentItemError("immutable_content_identity", "Identitas konten tidak boleh diubah.", 400);
  }
  if (input.production_status !== undefined) {
    throw new ContentItemError("invalid_production_status", "Production status harus diubah dari action status.", 400);
  }

  const current = await getContentItem(id);
  const value = validateContentItemInput({ ...input, campaign_id: current.campaign_id }, { requireCampaign: true });
  const campaign = await getCampaignPeriod(current.campaign_id);
  assertWithinCampaignPeriod(value.planned_content_date, campaign);

  if (value.product_id !== current.product_id) await assertActiveProduct(value.product_id);
  if (value.color_id !== current.color_id) await assertActiveColor(value.color_id);
  if (value.primary_offer_id !== current.primary_offer_id) await assertActiveOffer(value.primary_offer_id);
  if (value.primary_pain_point_id !== current.primary_pain_point_id) await assertActivePainPoint(value.primary_pain_point_id);

  const rows = await query<{ id: string }>(
    `UPDATE content_items
     SET title = $2,
         planned_content_date = $3,
         product_id = $4,
         school_level = $5,
         color_id = $6,
         audience_segment = $7,
         target_audience = $8,
         content_pillar = $9,
         primary_offer_id = $10,
         primary_pain_point_id = $11,
         hook = $12,
         angle = $13,
         cta_text = $14,
         cta_keyword = $15,
         notes = $16,
         updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [
      id,
      value.title,
      value.planned_content_date,
      value.product_id,
      value.school_level,
      value.color_id,
      value.audience_segment,
      value.target_audience,
      value.content_pillar,
      value.primary_offer_id,
      value.primary_pain_point_id,
      value.hook,
      value.angle,
      value.cta_text,
      value.cta_keyword,
      value.notes
    ]
  );

  if (!rows[0]) {
    throw new ContentItemError("content_item_not_found", "Content item tidak ditemukan.", 404);
  }

  return getContentItem(rows[0].id);
}

export async function updateContentItemProductionStatus(id: string, nextStatusInput: unknown): Promise<ContentItemRow> {
  assertUuid(id);
  const nextStatus = validateProductionStatus(nextStatusInput);
  const current = await getContentItem(id);
  const allowed = productionTransitions[current.production_status] || [];

  if (!allowed.includes(nextStatus)) {
    throw new ContentItemError("invalid_production_transition", "Perubahan production status tidak valid.", 409);
  }

  if (nextStatus === "archived") {
    await assertNoActivePublications(id);
  }

  const rows = await query<{ id: string }>(
    `UPDATE content_items
     SET production_status = $2,
         updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [id, nextStatus]
  );

  if (!rows[0]) {
    throw new ContentItemError("content_item_not_found", "Content item tidak ditemukan.", 404);
  }

  return getContentItem(rows[0].id);
}
