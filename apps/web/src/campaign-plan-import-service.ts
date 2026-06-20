import type { CampaignPlannerInput, CampaignPlanStrategySlot, ValidationIssue } from "../../../packages/campaign-planner/src/index.ts";
import { CampaignPlanImportError } from "./campaign-plan-import-errors.ts";
import { createContentItemWithClient } from "./content-item-service.ts";
import { createContentPublicationWithClient } from "./content-publication-service.ts";
import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { assertUuid } from "./validation/library-validation.ts";

type RunRow = {
  id: string;
  campaign_id: string;
  status: string;
  approved_at: Date | string | null;
  imported_at: Date | string | null;
  input_snapshot: CampaignPlannerInput;
  strategy_snapshot: CampaignPlanStrategySlot[];
  error_code: string | null;
  error_message: string | null;
};

type CampaignRow = {
  id: string;
  code: string;
  name: string;
  start_date: Date | string;
  end_date: Date | string;
  status: string;
};

type DraftItemRow = {
  id: string;
  run_id: string;
  draft_sequence: number;
  planned_content_date: string;
  title: string;
  product_code: string | null;
  school_level: string | null;
  color_code: string | null;
  audience_segment: string;
  target_audience: string;
  content_pillar: string;
  primary_offer_code: string | null;
  primary_pain_point_code: string | null;
  hook: string;
  angle: string;
  cta_text: string;
  cta_keyword: string | null;
  planning_reason: string;
  review_status: string;
  owner_notes: string | null;
  validation_errors: ValidationIssue[];
  imported_content_item_id: string | null;
  imported_at: Date | string | null;
};

type DraftPublicationRow = {
  id: string;
  draft_item_id: string;
  draft_sequence: number;
  channel: string;
  publication_format: string;
  planned_publish_at: Date | string | null;
  platform_title: string | null;
  platform_caption: string | null;
  imported_publication_id: string | null;
  imported_at: Date | string | null;
};

type ReferenceMap = {
  products: Map<string, string>;
  colors: Map<string, string>;
  offers: Map<string, string>;
  painPoints: Map<string, string>;
};

export type CampaignPlanImportFailpoint =
  | "after_content_items"
  | "after_publications"
  | "before_mapping"
  | "before_finalize";

export type CampaignPlanImportOptions = {
  failpoint?: CampaignPlanImportFailpoint;
};

export type CampaignPlanImportResult = {
  run_id: string;
  status: "approved" | "imported" | string;
  already_imported: boolean;
  approved_at: string | null;
  imported_at: string | null;
  campaign: {
    id: string;
    code: string;
    name: string;
  };
  summary: {
    approved_draft_items: number;
    rejected_draft_items: number;
    content_items_created: number;
    publications_created: number;
  };
  content_items: Array<{
    draft_item_id: string;
    draft_sequence: number;
    content_item_id: string;
    content_code: string;
    title: string;
    notes: string | null;
  }>;
};

function iso(value: unknown): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

function dateOnly(value: unknown): string {
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

function timestampIso(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function jsonArray(value: unknown): ValidationIssue[] {
  return Array.isArray(value) ? value as ValidationIssue[] : [];
}

function ensureUnique(values: Array<string | null>, message: string): void {
  const seen = new Set<string>();
  for (const value of values.filter(Boolean) as string[]) {
    if (seen.has(value)) {
      throw new CampaignPlanImportError("campaign_plan_import_state_inconsistent", message, 409);
    }
    seen.add(value);
  }
}

function mapDraftItem(row: any): DraftItemRow {
  return {
    ...row,
    draft_sequence: Number(row.draft_sequence),
    planned_content_date: dateOnly(row.planned_content_date),
    validation_errors: jsonArray(row.validation_errors)
  };
}

function safeMessage(message: string): string {
  return message
    .replace(/postgresql:\/\/\S+/gi, "[database-url]")
    .replace(/password=[^\s]+/gi, "password=[redacted]")
    .replace(/DATABASE_URL/gi, "[database-url]")
    .slice(0, 500);
}

async function rows<T>(client: DatabaseClient, text: string, params: unknown[] = []): Promise<T[]> {
  const result = await client.query(text, params);
  return result.rows as T[];
}

async function getLockedRun(client: DatabaseClient, runId: string): Promise<RunRow> {
  const result = await rows<RunRow>(
    client,
    `SELECT *
     FROM campaign_plan_runs
     WHERE id = $1
     FOR UPDATE`,
    [runId]
  );
  const run = result[0];
  if (!run) {
    throw new CampaignPlanImportError("campaign_plan_run_not_found", "Campaign plan run tidak ditemukan.", 404);
  }
  return run;
}

async function getLockedCampaign(client: DatabaseClient, campaignId: string): Promise<CampaignRow> {
  const result = await rows<CampaignRow>(
    client,
    `SELECT id, code, name, start_date, end_date, status
     FROM campaigns
     WHERE id = $1
     FOR UPDATE`,
    [campaignId]
  );
  const campaign = result[0];
  if (!campaign) {
    throw new CampaignPlanImportError("campaign_plan_reference_unavailable", "Campaign tidak tersedia untuk import.", 409);
  }
  return campaign;
}

async function listLockedDraftItems(client: DatabaseClient, runId: string): Promise<DraftItemRow[]> {
  const result = await rows<any>(
    client,
    `SELECT *
     FROM campaign_plan_draft_items
     WHERE run_id = $1
     ORDER BY draft_sequence
     FOR UPDATE`,
    [runId]
  );
  return result.map(mapDraftItem);
}

async function listLockedDraftPublications(client: DatabaseClient, runId: string): Promise<DraftPublicationRow[]> {
  return rows<DraftPublicationRow>(
    client,
    `SELECT p.*, i.draft_sequence
     FROM campaign_plan_draft_publications p
     JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id
     WHERE i.run_id = $1
     ORDER BY i.draft_sequence, p.channel, p.publication_format
     FOR UPDATE OF p`,
    [runId]
  );
}

async function reconstructImportedResult(client: DatabaseClient, runId: string, alreadyImported = true): Promise<CampaignPlanImportResult> {
  const runRows = await rows<any>(
    client,
    `SELECT r.id, r.status, r.approved_at, r.imported_at, c.id AS campaign_id, c.code AS campaign_code, c.name AS campaign_name
     FROM campaign_plan_runs r
     JOIN campaigns c ON c.id = r.campaign_id
     WHERE r.id = $1`,
    [runId]
  );
  const run = runRows[0];
  if (!run) {
    throw new CampaignPlanImportError("campaign_plan_run_not_found", "Campaign plan run tidak ditemukan.", 404);
  }
  const summaryRows = await rows<any>(
    client,
     `SELECT
       COUNT(DISTINCT i.id) FILTER (WHERE i.review_status = 'approved')::int AS approved_draft_items,
       COUNT(DISTINCT i.id) FILTER (WHERE i.review_status = 'rejected')::int AS rejected_draft_items,
       COUNT(DISTINCT i.imported_content_item_id) FILTER (WHERE i.review_status = 'approved')::int AS content_items_created,
       COUNT(p.imported_publication_id) FILTER (WHERE i.review_status = 'approved')::int AS publications_created
     FROM campaign_plan_draft_items i
     LEFT JOIN campaign_plan_draft_publications p ON p.draft_item_id = i.id
     WHERE i.run_id = $1`,
    [runId]
  );
  const contentItemRows = await rows<any>(
    client,
    `SELECT i.id AS draft_item_id, i.draft_sequence, ci.id AS content_item_id, ci.content_code, ci.title, ci.notes
     FROM campaign_plan_draft_items i
     JOIN content_items ci ON ci.id = i.imported_content_item_id
     WHERE i.run_id = $1 AND i.review_status = 'approved'
     ORDER BY i.draft_sequence`,
    [runId]
  );
  const summary = summaryRows[0] || {};
  return {
    run_id: run.id,
    status: run.status,
    already_imported: alreadyImported,
    approved_at: iso(run.approved_at),
    imported_at: iso(run.imported_at),
    campaign: {
      id: run.campaign_id,
      code: run.campaign_code,
      name: run.campaign_name
    },
    summary: {
      approved_draft_items: Number(summary.approved_draft_items || 0),
      rejected_draft_items: Number(summary.rejected_draft_items || 0),
      content_items_created: Number(summary.content_items_created || 0),
      publications_created: Number(summary.publications_created || 0)
    },
    content_items: contentItemRows.map((row) => ({
      draft_item_id: row.draft_item_id,
      draft_sequence: Number(row.draft_sequence),
      content_item_id: row.content_item_id,
      content_code: row.content_code,
      title: row.title,
      notes: row.notes
    }))
  };
}

async function loadReferenceMap(client: DatabaseClient, table: string, codes: Set<string>): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!codes.size) return map;
  const result = await rows<{ code: string; ids: string[]; count: number }>(
    client,
    `SELECT code, array_agg(id::text ORDER BY id::text) AS ids, COUNT(*)::int AS count
     FROM ${table}
     WHERE code = ANY($1::text[]) AND active = true
     GROUP BY code`,
    [Array.from(codes)]
  );
  for (const row of result) {
    if (Number(row.count) !== 1 || !row.ids[0]) {
      throw new CampaignPlanImportError("campaign_plan_reference_unavailable", "Reference campaign planner tidak tersedia atau tidak aktif.", 409);
    }
    map.set(row.code, row.ids[0]);
  }
  for (const code of codes) {
    if (!map.has(code)) {
      throw new CampaignPlanImportError("campaign_plan_reference_unavailable", "Reference campaign planner tidak tersedia atau tidak aktif.", 409);
    }
  }
  return map;
}

async function resolveReferences(client: DatabaseClient, approvedItems: DraftItemRow[]): Promise<ReferenceMap> {
  const productCodes = new Set(approvedItems.map((item) => item.product_code).filter(Boolean) as string[]);
  const colorCodes = new Set(approvedItems.map((item) => item.color_code).filter(Boolean) as string[]);
  const offerCodes = new Set(approvedItems.map((item) => item.primary_offer_code).filter(Boolean) as string[]);
  const painPointCodes = new Set(approvedItems.map((item) => item.primary_pain_point_code).filter(Boolean) as string[]);
  return {
    products: await loadReferenceMap(client, "products", productCodes),
    colors: await loadReferenceMap(client, "colors", colorCodes),
    offers: await loadReferenceMap(client, "offers", offerCodes),
    painPoints: await loadReferenceMap(client, "pain_points", painPointCodes)
  };
}

function referenceId(map: Map<string, string>, code: string | null): string | null {
  if (!code) return null;
  const id = map.get(code);
  if (!id) {
    throw new CampaignPlanImportError("campaign_plan_reference_unavailable", "Reference campaign planner tidak tersedia atau tidak aktif.", 409);
  }
  return id;
}

function assertImportable(run: RunRow, items: DraftItemRow[]): void {
  if (run.status === "imported") return;
  if (run.status !== "approved" || !run.approved_at || run.imported_at) {
    throw new CampaignPlanImportError("campaign_plan_run_not_importable", "Run belum dapat diimport.", 409);
  }
  if (items.some((item) => item.review_status === "pending_review")) {
    throw new CampaignPlanImportError("pending_draft_reviews_exist", "Masih ada draft yang menunggu review.", 409);
  }
  const approved = items.filter((item) => item.review_status === "approved");
  if (!approved.length) {
    throw new CampaignPlanImportError("no_approved_draft_items", "Minimal satu draft harus disetujui sebelum import.", 409);
  }
  const invalid = approved.find((item) => item.validation_errors.length > 0);
  if (invalid) {
    throw new CampaignPlanImportError("approved_draft_item_invalid", "Draft approved masih memiliki validation error.", 409, invalid.validation_errors);
  }
}

function assertNoPartialImport(run: RunRow, items: DraftItemRow[], publications: DraftPublicationRow[]): void {
  if (run.status === "imported") return;
  if (items.some((item) => item.imported_content_item_id || item.imported_at)) {
    throw new CampaignPlanImportError("campaign_plan_import_state_inconsistent", "Mapping import staging tidak konsisten.", 409);
  }
  if (publications.some((publication) => publication.imported_publication_id || publication.imported_at)) {
    throw new CampaignPlanImportError("campaign_plan_import_state_inconsistent", "Mapping publication staging tidak konsisten.", 409);
  }
}

function assertCampaignDrift(run: RunRow, campaign: CampaignRow, approvedItems: DraftItemRow[]): void {
  const snapshot = run.input_snapshot?.campaign;
  if (!snapshot || snapshot.id !== campaign.id) {
    throw new CampaignPlanImportError("campaign_plan_campaign_changed", "Snapshot campaign tidak cocok dengan campaign saat ini.", 409);
  }
  if (snapshot.code !== campaign.code) {
    throw new CampaignPlanImportError("campaign_plan_campaign_changed", "Kode campaign berubah sejak generation run dibuat.", 409);
  }
  if (campaign.status === "completed" || campaign.status === "archived") {
    throw new CampaignPlanImportError("campaign_plan_run_not_importable", "Campaign selesai atau arsip tidak dapat diimport.", 409);
  }
  const startDate = dateOnly(campaign.start_date);
  const endDate = dateOnly(campaign.end_date);
  if (approvedItems.some((item) => item.planned_content_date < startDate || item.planned_content_date > endDate)) {
    throw new CampaignPlanImportError("campaign_plan_date_outside_campaign", "Tanggal draft approved berada di luar periode campaign saat ini.", 409);
  }
}

function assertStrategyConsistency(run: RunRow, items: DraftItemRow[], publications: DraftPublicationRow[]): void {
  const strategy = Array.isArray(run.strategy_snapshot) ? run.strategy_snapshot : [];
  const strategyBySequence = new Map(strategy.map((slot) => [Number(slot.draft_sequence), slot]));
  const publicationsByItem = new Map<string, DraftPublicationRow[]>();
  for (const publication of publications) {
    publicationsByItem.set(publication.draft_item_id, [...(publicationsByItem.get(publication.draft_item_id) || []), publication]);
  }

  for (const item of items.filter((row) => row.review_status === "approved")) {
    const slot = strategyBySequence.get(item.draft_sequence);
    if (
      !slot ||
      dateOnly(slot.planned_content_date) !== item.planned_content_date ||
      (slot.product_code || null) !== item.product_code ||
      slot.audience_segment !== item.audience_segment ||
      slot.content_pillar !== item.content_pillar ||
      (slot.primary_offer_code || null) !== item.primary_offer_code ||
      (slot.primary_pain_point_code || null) !== item.primary_pain_point_code
    ) {
      throw new CampaignPlanImportError("campaign_plan_import_state_inconsistent", "Staging draft tidak konsisten dengan strategy snapshot.", 409);
    }

    const expectedPublications = slot.publications || [];
    const actualPublications = publicationsByItem.get(item.id) || [];
    if (actualPublications.length !== expectedPublications.length) {
      throw new CampaignPlanImportError("campaign_plan_import_state_inconsistent", "Staging publication tidak lengkap sesuai strategy snapshot.", 409);
    }

    const expectedByKey = new Map(expectedPublications.map((publication) => [`${publication.channel}:${publication.publication_format}`, publication]));
    for (const publication of actualPublications) {
      const expected = expectedByKey.get(`${publication.channel}:${publication.publication_format}`);
      if (!expected || timestampIso(expected.planned_publish_at) !== timestampIso(publication.planned_publish_at)) {
        throw new CampaignPlanImportError("campaign_plan_import_state_inconsistent", "Staging publication berubah dari strategy snapshot.", 409);
      }
    }
  }
}

async function assertImportedMappingComplete(
  client: DatabaseClient,
  run: RunRow,
  items: DraftItemRow[],
  publications: DraftPublicationRow[]
): Promise<void> {
  const approvedIds = new Set(items.filter((item) => item.review_status === "approved").map((item) => item.id));
  if (items.some((item) => item.review_status === "approved" && !item.imported_content_item_id)) {
    throw new CampaignPlanImportError("campaign_plan_import_state_inconsistent", "Run imported tidak memiliki mapping content lengkap.", 409);
  }
  if (publications.some((publication) => approvedIds.has(publication.draft_item_id) && !publication.imported_publication_id)) {
    throw new CampaignPlanImportError("campaign_plan_import_state_inconsistent", "Run imported tidak memiliki mapping publication lengkap.", 409);
  }
  const approvedItems = items.filter((item) => item.review_status === "approved");
  const approvedPublications = publications.filter((publication) => approvedIds.has(publication.draft_item_id));
  ensureUnique(approvedItems.map((item) => item.imported_content_item_id), "Mapping content item imported duplikat.");
  ensureUnique(approvedPublications.map((publication) => publication.imported_publication_id), "Mapping publication imported duplikat.");

  const mappedItemIds = approvedItems.map((item) => item.imported_content_item_id).filter(Boolean) as string[];
  if (mappedItemIds.length) {
    const mappedRows = await rows<{ id: string; campaign_id: string }>(
      client,
      `SELECT id, campaign_id
       FROM content_items
       WHERE id = ANY($1::uuid[])`,
      [mappedItemIds]
    );
    if (mappedRows.length !== mappedItemIds.length || mappedRows.some((row) => row.campaign_id !== run.campaign_id)) {
      throw new CampaignPlanImportError("campaign_plan_import_state_inconsistent", "Mapping content item imported tidak cocok dengan campaign run.", 409);
    }
  }

  const mappedPublicationIds = approvedPublications.map((publication) => publication.imported_publication_id).filter(Boolean) as string[];
  if (mappedPublicationIds.length) {
    const mappedRows = await rows<{ id: string; campaign_id: string }>(
      client,
      `SELECT p.id, i.campaign_id
       FROM content_publications p
       JOIN content_items i ON i.id = p.content_item_id
       WHERE p.id = ANY($1::uuid[])`,
      [mappedPublicationIds]
    );
    if (mappedRows.length !== mappedPublicationIds.length || mappedRows.some((row) => row.campaign_id !== run.campaign_id)) {
      throw new CampaignPlanImportError("campaign_plan_import_state_inconsistent", "Mapping publication imported tidak cocok dengan campaign run.", 409);
    }
  }
}

function maybeFail(options: CampaignPlanImportOptions | undefined, failpoint: CampaignPlanImportFailpoint): void {
  if (options?.failpoint === failpoint) {
    throw new Error(`test_failpoint_${failpoint}`);
  }
}

async function updateRunImportFailure(runId: string, code: string, message: string): Promise<void> {
  try {
    await query(
      `UPDATE campaign_plan_runs
       SET status = 'approved',
           error_code = $2,
           error_message = $3,
           updated_at = now()
       WHERE id = $1 AND status = 'approved'`,
      [runId, code, safeMessage(message)]
    );
  } catch {
    // Best effort only. The import transaction already rolled back.
  }
}

export async function getCampaignPlanImportPreview(runId: string): Promise<CampaignPlanImportResult> {
  assertUuid(runId);
  return withTransaction(async (client) => {
    const run = await getLockedRun(client, runId);
    const campaign = await getLockedCampaign(client, run.campaign_id);
    const items = await listLockedDraftItems(client, runId);
    const publications = await listLockedDraftPublications(client, runId);
    if (run.status === "imported") {
      await assertImportedMappingComplete(client, run, items, publications);
      return reconstructImportedResult(client, runId, true);
    }
    const approved = items.filter((item) => item.review_status === "approved");
    return {
      run_id: run.id,
      status: run.status,
      already_imported: false,
      approved_at: iso(run.approved_at),
      imported_at: iso(run.imported_at),
      campaign: {
        id: campaign.id,
        code: campaign.code,
        name: campaign.name
      },
      summary: {
        approved_draft_items: approved.length,
        rejected_draft_items: items.filter((item) => item.review_status === "rejected").length,
        content_items_created: 0,
        publications_created: publications.filter((publication) => approved.some((item) => item.id === publication.draft_item_id)).length
      },
      content_items: []
    };
  });
}

export async function importApprovedCampaignPlanRun(
  runId: string,
  options?: CampaignPlanImportOptions
): Promise<CampaignPlanImportResult> {
  assertUuid(runId);
  try {
    return await withTransaction(async (client) => {
      const run = await getLockedRun(client, runId);
      const campaign = await getLockedCampaign(client, run.campaign_id);
      const items = await listLockedDraftItems(client, runId);
      const publications = await listLockedDraftPublications(client, runId);

      if (run.status === "imported") {
        await assertImportedMappingComplete(client, run, items, publications);
        return reconstructImportedResult(client, runId, true);
      }

      assertImportable(run, items);
      assertNoPartialImport(run, items, publications);
      const approvedItems = items.filter((item) => item.review_status === "approved");
      const rejectedItems = items.filter((item) => item.review_status === "rejected");
      assertStrategyConsistency(run, items, publications);
      assertCampaignDrift(run, campaign, approvedItems);
      const references = await resolveReferences(client, approvedItems);

      await client.query(
        `UPDATE campaign_plan_runs
         SET status = 'importing',
             error_code = NULL,
             error_message = NULL,
             updated_at = now()
         WHERE id = $1 AND status = 'approved'`,
        [runId]
      );

      const sharedImportTime = await rows<{ imported_at: Date }>(client, `SELECT now() AS imported_at`);
      const importedAt = sharedImportTime[0].imported_at;
      const importedContentItems: CampaignPlanImportResult["content_items"] = [];
      const publicationIdsByDraftPublication = new Map<string, string>();
      const contentItemIdByDraftItem = new Map<string, string>();

      for (const item of approvedItems) {
        const created = await createContentItemWithClient(client, {
          campaign_id: campaign.id,
          title: item.title,
          planned_content_date: item.planned_content_date,
          product_id: referenceId(references.products, item.product_code),
          school_level: item.school_level,
          color_id: referenceId(references.colors, item.color_code),
          audience_segment: item.audience_segment,
          target_audience: item.target_audience,
          content_pillar: item.content_pillar,
          primary_offer_id: referenceId(references.offers, item.primary_offer_code),
          primary_pain_point_id: referenceId(references.painPoints, item.primary_pain_point_code),
          hook: item.hook,
          angle: item.angle,
          cta_text: item.cta_text,
          cta_keyword: item.cta_keyword,
          notes: item.owner_notes
        });
        contentItemIdByDraftItem.set(item.id, created.id);
        importedContentItems.push({
          draft_item_id: item.id,
          draft_sequence: item.draft_sequence,
          content_item_id: created.id,
          content_code: created.content_code,
          title: item.title,
          notes: item.owner_notes
        });
      }

      maybeFail(options, "after_content_items");

      const approvedIds = new Set(approvedItems.map((item) => item.id));
      for (const publication of publications.filter((item) => approvedIds.has(item.draft_item_id))) {
        const contentItemId = contentItemIdByDraftItem.get(publication.draft_item_id);
        if (!contentItemId) {
          throw new CampaignPlanImportError("campaign_plan_import_state_inconsistent", "Mapping content item tidak ditemukan saat import.", 409);
        }
        const created = await createContentPublicationWithClient(client, contentItemId, {
          channel: publication.channel,
          publication_format: publication.publication_format,
          planned_publish_at: iso(publication.planned_publish_at),
          platform_title: publication.platform_title,
          platform_caption: null
        });
        publicationIdsByDraftPublication.set(publication.id, created.id);
      }

      maybeFail(options, "after_publications");
      maybeFail(options, "before_mapping");

      for (const item of approvedItems) {
        await client.query(
          `UPDATE campaign_plan_draft_items
           SET imported_content_item_id = $2,
               imported_at = $3,
               updated_at = now()
           WHERE id = $1
             AND imported_content_item_id IS NULL
             AND imported_at IS NULL`,
          [item.id, contentItemIdByDraftItem.get(item.id), importedAt]
        );
      }

      for (const publication of publications.filter((item) => approvedIds.has(item.draft_item_id))) {
        await client.query(
          `UPDATE campaign_plan_draft_publications
           SET imported_publication_id = $2,
               imported_at = $3,
               updated_at = now()
           WHERE id = $1
             AND imported_publication_id IS NULL
             AND imported_at IS NULL`,
          [publication.id, publicationIdsByDraftPublication.get(publication.id), importedAt]
        );
      }

      maybeFail(options, "before_finalize");

      await client.query(
        `UPDATE campaign_plan_runs
         SET status = 'imported',
             imported_at = $2,
             error_code = NULL,
             error_message = NULL,
             updated_at = now()
         WHERE id = $1 AND status = 'importing'`,
        [runId, importedAt]
      );

      return {
        run_id: runId,
        status: "imported",
        already_imported: false,
        approved_at: iso(run.approved_at),
        imported_at: iso(importedAt),
        campaign: {
          id: campaign.id,
          code: campaign.code,
          name: campaign.name
        },
        summary: {
          approved_draft_items: approvedItems.length,
          rejected_draft_items: rejectedItems.length,
          content_items_created: importedContentItems.length,
          publications_created: publicationIdsByDraftPublication.size
        },
        content_items: importedContentItems
      };
    });
  } catch (error: any) {
    if (error instanceof CampaignPlanImportError) throw error;
    const code = error?.code === "23505"
      ? "campaign_plan_import_conflict"
      : "campaign_plan_import_failed";
    const status = error?.code === "23505" ? 409 : 500;
    await updateRunImportFailure(runId, code, error?.message || "Import gagal.");
    throw new CampaignPlanImportError(code, status === 409 ? "Import konflik dengan data operational." : "Import gagal diproses.", status);
  }
}
