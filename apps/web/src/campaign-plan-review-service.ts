import {
  validateCampaignPlanDraft,
  type CampaignPlanDraft,
  type CampaignPlannerInput,
  type ValidationIssue
} from "../../../packages/campaign-planner/src/index.ts";
import { CampaignPlanReviewError } from "./campaign-plan-review-errors.ts";
import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { assertUuid } from "./validation/library-validation.ts";
import {
  validateDraftItemDecisionInput,
  validateDraftItemEditInput,
  type DraftItemDecisionInput,
  type DraftItemEditInput
} from "./validation/campaign-plan-review-validation.ts";

const reviewableStatus = "ready_for_review";

const readonlyClient = {
  async query(text: string, params: unknown[] = []) {
    return { rows: await query(text, params) };
  }
} as unknown as DatabaseClient;

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
  edited_at: string | null;
  revision_number: number;
  validation_errors: ValidationIssue[];
  validation_warnings: ValidationIssue[];
  updated_at: string;
};

type PublicationRow = {
  id: string;
  draft_item_id: string;
  channel: string;
  publication_format: string;
  planned_publish_at: string | null;
  platform_title: string | null;
  platform_caption: null;
  updated_at: string;
};

function iso(value: unknown): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

function jakartaPlannerTimestamp(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}:00+07:00`;
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
  return String(value).slice(0, 10);
}

function mapJsonArray(value: unknown): ValidationIssue[] {
  return Array.isArray(value) ? value as ValidationIssue[] : [];
}

function mapItem(row: any): DraftItemRow {
  return {
    ...row,
    draft_sequence: Number(row.draft_sequence),
    planned_content_date: dateOnly(row.planned_content_date),
    revision_number: Number(row.revision_number),
    validation_errors: mapJsonArray(row.validation_errors),
    validation_warnings: mapJsonArray(row.validation_warnings),
    edited_at: iso(row.edited_at),
    updated_at: iso(row.updated_at) || ""
  };
}

function mapPublication(row: any): PublicationRow {
  return {
    ...row,
    planned_publish_at: jakartaPlannerTimestamp(row.planned_publish_at),
    platform_caption: null,
    updated_at: iso(row.updated_at) || ""
  };
}

function issueForItem(issues: ValidationIssue[], itemIndex: number): ValidationIssue[] {
  return issues.filter((issue) =>
    issue.path === "items" ||
    issue.path === `items.${itemIndex}` ||
    Boolean(issue.path?.startsWith(`items.${itemIndex}.`))
  );
}

function mapIssueCode(code: string): string {
  const map: Record<string, string> = {
    duplicate_title: "duplicate_draft_title",
    duplicate_hook: "duplicate_draft_hook",
    invalid_color_reference: "invalid_draft_color",
    invalid_school_level: "invalid_draft_school_level",
    missing_cta_text: "invalid_draft_cta_text",
    invalid_cta_keyword: "invalid_draft_cta_keyword",
    youtube_title_required: "youtube_title_required",
    schema_validation_failed: "invalid_draft_title",
    final_schema_invalid: "invalid_draft_title"
  };
  if (map[code]) return map[code];
  if (
    code.includes("claim") ||
    code.includes("mockup") ||
    code.includes("desain") ||
    code.includes("dp_") ||
    code.includes("gratis_") ||
    code.includes("garansi") ||
    code.includes("foil") ||
    code.includes("response_time") ||
    code.includes("revisi")
  ) {
    return "forbidden_campaign_claim";
  }
  return code;
}

function firstBlockingCode(issues: ValidationIssue[]): string {
  return issues[0] ? mapIssueCode(issues[0].code) : "invalid_draft_title";
}

function assertReviewable(run: any): void {
  if (!run) {
    throw new CampaignPlanReviewError("campaign_plan_run_not_found", "Campaign plan run tidak ditemukan.", 404);
  }
  if (run.status !== reviewableStatus) {
    throw new CampaignPlanReviewError("campaign_plan_run_not_reviewable", "Run tidak dapat direview dari status saat ini.", 409);
  }
}

function assertRevision(item: DraftItemRow, expectedRevision: number): void {
  if (item.revision_number !== expectedRevision) {
    throw new CampaignPlanReviewError("stale_draft_revision", "Draft sudah berubah. Muat ulang sebelum menyimpan keputusan.", 409);
  }
}

async function getRunById(client: DatabaseClient, runId: string, lock = false): Promise<any> {
  const result = await client.query(
    `SELECT r.*, c.code AS campaign_code, c.name AS campaign_name
     FROM campaign_plan_runs r
     JOIN campaigns c ON c.id = r.campaign_id
     WHERE r.id = $1 ${lock ? "FOR UPDATE OF r" : ""}`,
    [runId]
  );
  return result.rows[0];
}

async function getItemRunId(client: DatabaseClient, itemId: string): Promise<string> {
  const result = await client.query(`SELECT run_id FROM campaign_plan_draft_items WHERE id = $1`, [itemId]);
  const row = result.rows[0];
  if (!row) {
    throw new CampaignPlanReviewError("campaign_plan_draft_item_not_found", "Draft item tidak ditemukan.", 404);
  }
  return row.run_id;
}

async function getLockedItem(client: DatabaseClient, itemId: string): Promise<DraftItemRow> {
  const result = await client.query(`SELECT * FROM campaign_plan_draft_items WHERE id = $1 FOR UPDATE`, [itemId]);
  const row = result.rows[0];
  if (!row) {
    throw new CampaignPlanReviewError("campaign_plan_draft_item_not_found", "Draft item tidak ditemukan.", 404);
  }
  return mapItem(row);
}

async function listItems(client: DatabaseClient, runId: string, lock = false): Promise<DraftItemRow[]> {
  const result = await client.query(
    `SELECT *
     FROM campaign_plan_draft_items
     WHERE run_id = $1
     ORDER BY draft_sequence
     ${lock ? "FOR UPDATE" : ""}`,
    [runId]
  );
  return result.rows.map(mapItem);
}

async function listPublications(client: DatabaseClient, itemIds: string[], lock = false): Promise<PublicationRow[]> {
  if (!itemIds.length) return [];
  const result = await client.query(
    `SELECT *
     FROM campaign_plan_draft_publications
     WHERE draft_item_id = ANY($1::uuid[])
     ORDER BY draft_item_id, channel, publication_format
     ${lock ? "FOR UPDATE" : ""}`,
    [itemIds]
  );
  return result.rows.map(mapPublication);
}

function attachPublications(items: DraftItemRow[], publications: PublicationRow[]) {
  const grouped = new Map<string, PublicationRow[]>();
  for (const publication of publications) {
    grouped.set(publication.draft_item_id, [...(grouped.get(publication.draft_item_id) || []), publication]);
  }
  return items.map((item) => ({ ...item, publications: grouped.get(item.id) || [] }));
}

function buildDraft(run: any, items: DraftItemRow[], publications: PublicationRow[]): CampaignPlanDraft {
  const grouped = attachPublications(items, publications);
  return {
    plan_summary: run.plan_summary || `Draft rencana ${run.requested_content_count} konten untuk campaign ${run.campaign_code}.`,
    requested_content_count: Number(run.requested_content_count),
    items: grouped.map((item) => ({
      draft_sequence: item.draft_sequence,
      planned_content_date: item.planned_content_date,
      title: item.title,
      product_code: item.product_code,
      school_level: item.school_level as any,
      color_code: item.color_code,
      audience_segment: item.audience_segment as any,
      target_audience: item.target_audience,
      content_pillar: item.content_pillar as any,
      primary_offer_code: item.primary_offer_code,
      primary_pain_point_code: item.primary_pain_point_code,
      hook: item.hook,
      angle: item.angle,
      cta_text: item.cta_text,
      cta_keyword: item.cta_keyword,
      planning_reason: item.planning_reason,
      publications: item.publications.map((publication) => ({
        channel: publication.channel as any,
        publication_format: publication.publication_format as any,
        planned_publish_at: publication.planned_publish_at,
        platform_title: publication.platform_title,
        platform_caption: null
      }))
    }))
  };
}

async function persistValidation(
  client: DatabaseClient,
  runId: string,
  items: DraftItemRow[],
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  summary: any
): Promise<void> {
  for (const [index, item] of items.entries()) {
    await client.query(
      `UPDATE campaign_plan_draft_items
       SET validation_errors = $2,
           validation_warnings = $3,
           updated_at = now()
       WHERE id = $1`,
      [item.id, JSON.stringify(issueForItem(errors, index)), JSON.stringify(issueForItem(warnings, index))]
    );
  }
  await client.query(
    `UPDATE campaign_plan_runs
     SET validation_summary = $2,
         updated_at = now()
     WHERE id = $1`,
    [runId, JSON.stringify(summary)]
  );
}

async function revalidateRun(client: DatabaseClient, run: any, items: DraftItemRow[], publications: PublicationRow[]) {
  const draft = buildDraft(run, items, publications);
  const validation = validateCampaignPlanDraft(run.input_snapshot as CampaignPlannerInput, draft);
  return { draft, ...validation };
}

function reviewSummary(items: DraftItemRow[], publications: PublicationRow[]) {
  const total = items.length;
  const approved = items.filter((item) => item.review_status === "approved").length;
  const rejected = items.filter((item) => item.review_status === "rejected").length;
  const pending = items.filter((item) => item.review_status === "pending_review").length;
  return {
    total_items: total,
    pending_review: pending,
    approved,
    rejected,
    items_with_errors: items.filter((item) => item.validation_errors.length > 0).length,
    items_with_warnings: items.filter((item) => item.validation_warnings.length > 0).length,
    total_publications: publications.length,
    progress_percent: total ? Math.round(((approved + rejected) / total) * 100) : 0
  };
}

async function hydrateRunReview(client: DatabaseClient, runId: string) {
  const run = await getRunById(client, runId);
  if (!run) {
    throw new CampaignPlanReviewError("campaign_plan_run_not_found", "Campaign plan run tidak ditemukan.", 404);
  }
  const items = await listItems(client, runId);
  const publications = await listPublications(client, items.map((item) => item.id));
  return {
    id: run.id,
    campaign: {
      id: run.campaign_id,
      code: run.campaign_code,
      name: run.campaign_name
    },
    status: run.status,
    provider: run.provider,
    model: run.model,
    requested_content_count: Number(run.requested_content_count),
    selected_channels: run.selected_channels || [],
    validation_summary: run.validation_summary,
    approved_at: iso(run.approved_at),
    rejected_at: iso(run.rejected_at),
    created_at: iso(run.created_at),
    updated_at: iso(run.updated_at),
    summary: reviewSummary(items, publications),
    items: attachPublications(items, publications)
  };
}

async function hydrateDraftItem(client: DatabaseClient, itemId: string) {
  const result = await client.query(
    `SELECT i.*, r.status AS run_status, r.provider, r.model, r.selected_channels,
            c.code AS campaign_code, c.name AS campaign_name
     FROM campaign_plan_draft_items i
     JOIN campaign_plan_runs r ON r.id = i.run_id
     JOIN campaigns c ON c.id = r.campaign_id
     WHERE i.id = $1`,
    [itemId]
  );
  const row = result.rows[0];
  if (!row) {
    throw new CampaignPlanReviewError("campaign_plan_draft_item_not_found", "Draft item tidak ditemukan.", 404);
  }
  const item = mapItem(row);
  const publications = await listPublications(client, [item.id]);
  return {
    ...item,
    run_status: row.run_status,
    campaign: {
      code: row.campaign_code,
      name: row.campaign_name
    },
    publications
  };
}

function creativeChanged(current: DraftItemRow, values: DraftItemEditInput, currentYoutubeTitles: string[]): boolean {
  return (
    (values.title !== undefined && values.title !== current.title) ||
    (values.school_level !== undefined && values.school_level !== current.school_level) ||
    (values.color_code !== undefined && values.color_code !== current.color_code) ||
    (values.target_audience !== undefined && values.target_audience !== current.target_audience) ||
    (values.hook !== undefined && values.hook !== current.hook) ||
    (values.angle !== undefined && values.angle !== current.angle) ||
    (values.cta_text !== undefined && values.cta_text !== current.cta_text) ||
    (values.cta_keyword !== undefined && values.cta_keyword !== current.cta_keyword) ||
    (values.planning_reason !== undefined && values.planning_reason !== current.planning_reason) ||
    (values.youtube_platform_title !== undefined && currentYoutubeTitles.some((title) => values.youtube_platform_title !== title))
  );
}

function applyEditValues(item: DraftItemRow, values: DraftItemEditInput): DraftItemRow {
  return {
    ...item,
    title: values.title ?? item.title,
    school_level: values.school_level !== undefined ? values.school_level : item.school_level,
    color_code: values.color_code !== undefined ? values.color_code : item.color_code,
    target_audience: values.target_audience ?? item.target_audience,
    hook: values.hook ?? item.hook,
    angle: values.angle ?? item.angle,
    cta_text: values.cta_text ?? item.cta_text,
    cta_keyword: values.cta_keyword !== undefined ? values.cta_keyword : item.cta_keyword,
    planning_reason: values.planning_reason ?? item.planning_reason,
    owner_notes: values.owner_notes !== undefined ? values.owner_notes : item.owner_notes
  };
}

export async function getCampaignPlanRunReview(runId: string) {
  assertUuid(runId);
  return hydrateRunReview(readonlyClient, runId);
}

export async function getCampaignPlanDraftItem(itemId: string) {
  assertUuid(itemId);
  return hydrateDraftItem(readonlyClient, itemId);
}

export async function editCampaignPlanDraftItem(itemId: string, input: Record<string, unknown>) {
  assertUuid(itemId);
  const values = validateDraftItemEditInput(input);
  const runId = await withTransaction(async (client) => {
    const runId = await getItemRunId(client, itemId);
    const run = await getRunById(client, runId, true);
    assertReviewable(run);
    const allItems = await listItems(client, runId, true);
    const item = allItems.find((row) => row.id === itemId);
    if (!item) {
      throw new CampaignPlanReviewError("campaign_plan_draft_item_not_found", "Draft item tidak ditemukan.", 404);
    }
    assertRevision(item, values.expected_revision_number);
    const publications = await listPublications(client, allItems.map((row) => row.id), true);
    const itemPublications = publications.filter((publication) => publication.draft_item_id === item.id);
    const youtubePublications = itemPublications.filter((publication) => publication.channel === "youtube");
    if (youtubePublications.length && values.youtube_platform_title === undefined) {
      values.youtube_platform_title = youtubePublications[0].platform_title || "";
    }
    if (youtubePublications.length && !values.youtube_platform_title) {
      throw new CampaignPlanReviewError("youtube_title_required", "YouTube platform title wajib diisi.", 400);
    }

    const changed = creativeChanged(item, values, youtubePublications.map((publication) => publication.platform_title || ""));
    const nextItem = applyEditValues(item, values);
    const nextItems = allItems.map((row) => row.id === item.id ? nextItem : row);
    const nextPublications = publications.map((publication) =>
      publication.draft_item_id === item.id && publication.channel === "youtube" && values.youtube_platform_title !== undefined
        ? { ...publication, platform_title: values.youtube_platform_title }
        : publication
    );

    if (changed) {
      const validation = await revalidateRun(client, run, nextItems, nextPublications);
      if (validation.errors.length) {
        throw new CampaignPlanReviewError(firstBlockingCode(validation.errors), "Perubahan draft melanggar validasi Campaign Planner.", 400, validation.errors);
      }
      await client.query(
        `UPDATE campaign_plan_draft_items
         SET title = $2,
             school_level = $3,
             color_code = $4,
             target_audience = $5,
             hook = $6,
             angle = $7,
             cta_text = $8,
             cta_keyword = $9,
             planning_reason = $10,
             owner_notes = $11,
             review_status = 'pending_review',
             revision_number = revision_number + 1,
             edited_at = now(),
             updated_at = now()
         WHERE id = $1`,
        [
          item.id,
          nextItem.title,
          nextItem.school_level,
          nextItem.color_code,
          nextItem.target_audience,
          nextItem.hook,
          nextItem.angle,
          nextItem.cta_text,
          nextItem.cta_keyword,
          nextItem.planning_reason,
          nextItem.owner_notes
        ]
      );
      if (values.youtube_platform_title !== undefined) {
        await client.query(
          `UPDATE campaign_plan_draft_publications
           SET platform_title = $2,
               updated_at = now()
           WHERE draft_item_id = $1 AND channel = 'youtube'`,
          [item.id, values.youtube_platform_title]
        );
      }
      const persistedItems = nextItems.map((row) => row.id === item.id
        ? { ...nextItem, review_status: "pending_review", revision_number: item.revision_number + 1 }
        : row
      );
      await persistValidation(client, runId, persistedItems, validation.errors, validation.warnings, validation.summary);
    } else if (values.owner_notes !== undefined && values.owner_notes !== item.owner_notes) {
      await client.query(
        `UPDATE campaign_plan_draft_items
         SET owner_notes = $2,
             updated_at = now()
         WHERE id = $1`,
        [item.id, values.owner_notes]
      );
    }

    return runId;
  });
  return getCampaignPlanRunReview(runId);
}

async function mutateDraftItemDecision(itemId: string, values: DraftItemDecisionInput, decision: "approved" | "rejected") {
  const runId = await withTransaction(async (client) => {
    const runId = await getItemRunId(client, itemId);
    const run = await getRunById(client, runId, true);
    assertReviewable(run);
    const item = await getLockedItem(client, itemId);
    assertRevision(item, values.expected_revision_number);

    if (decision === "approved" && item.validation_errors.length) {
      throw new CampaignPlanReviewError("draft_item_has_validation_errors", "Draft item masih memiliki validation error.", 409, item.validation_errors);
    }

    await client.query(
      `UPDATE campaign_plan_draft_items
       SET review_status = $2,
           owner_notes = CASE WHEN $3::text IS NULL THEN owner_notes ELSE $3 END,
           updated_at = now()
       WHERE id = $1`,
      [item.id, decision, values.owner_notes]
    );
    return runId;
  });
  return getCampaignPlanRunReview(runId);
}

export async function approveCampaignPlanDraftItem(itemId: string, input: Record<string, unknown>) {
  assertUuid(itemId);
  return mutateDraftItemDecision(itemId, validateDraftItemDecisionInput(input), "approved");
}

export async function rejectCampaignPlanDraftItem(itemId: string, input: Record<string, unknown>) {
  assertUuid(itemId);
  return mutateDraftItemDecision(itemId, validateDraftItemDecisionInput(input), "rejected");
}

export async function approveAllReadyDraftItems(runId: string) {
  assertUuid(runId);
  const summary = await withTransaction(async (client) => {
    const run = await getRunById(client, runId, true);
    assertReviewable(run);
    const items = await listItems(client, runId, true);
    const publications = await listPublications(client, items.map((item) => item.id), true);
    const validation = await revalidateRun(client, run, items, publications);
    await persistValidation(client, runId, items, validation.errors, validation.warnings, validation.summary);

    const errorsByItem = new Map(items.map((item, index) => [item.id, issueForItem(validation.errors, index)]));
    const readyIds = items
      .filter((item) => item.review_status === "pending_review" && (errorsByItem.get(item.id) || []).length === 0)
      .map((item) => item.id);
    if (readyIds.length) {
      await client.query(
        `UPDATE campaign_plan_draft_items
         SET review_status = 'approved',
             updated_at = now()
         WHERE id = ANY($1::uuid[])`,
        [readyIds]
      );
    }
    const refreshed = await listItems(client, runId);
    return {
      approved_count: refreshed.filter((item) => item.review_status === "approved").length,
      rejected_count: refreshed.filter((item) => item.review_status === "rejected").length,
      pending_count: refreshed.filter((item) => item.review_status === "pending_review").length,
      blocked_count: refreshed.filter((item) => item.review_status === "pending_review" && item.validation_errors.length > 0).length
    };
  });
  return summary;
}

export async function approveCampaignPlanRun(runId: string) {
  assertUuid(runId);
  await withTransaction(async (client) => {
    const run = await getRunById(client, runId, true);
    if (!run) {
      throw new CampaignPlanReviewError("campaign_plan_run_not_found", "Campaign plan run tidak ditemukan.", 404);
    }
    if (run.status === "approved") {
      throw new CampaignPlanReviewError("invalid_campaign_plan_run_transition", "Run sudah disetujui.", 409);
    }
    const items = await listItems(client, runId, true);
    if (items.some((item) => item.review_status === "pending_review")) {
      throw new CampaignPlanReviewError("pending_draft_reviews_exist", "Masih ada draft yang menunggu review.", 409);
    }
    const approvedItems = items.filter((item) => item.review_status === "approved");
    if (!approvedItems.length) {
      throw new CampaignPlanReviewError("no_approved_draft_items", "Minimal satu draft harus disetujui.", 409);
    }
    assertReviewable(run);
    const invalidApproved = approvedItems.find((item) => item.validation_errors.length > 0);
    if (invalidApproved) {
      throw new CampaignPlanReviewError("approved_draft_item_invalid", "Draft yang disetujui masih memiliki validation error.", 409, invalidApproved.validation_errors);
    }
    await client.query(
      `UPDATE campaign_plan_runs
       SET status = 'approved',
           approved_at = now(),
           rejected_at = NULL,
           updated_at = now()
       WHERE id = $1 AND status = 'ready_for_review'`,
      [runId]
    );
  });
  return {
    message: "Rencana telah disetujui dan siap diimpor pada Phase 2A.4.",
    run: await getCampaignPlanRunReview(runId)
  };
}

export async function rejectCampaignPlanRun(runId: string) {
  assertUuid(runId);
  await withTransaction(async (client) => {
    const run = await getRunById(client, runId, true);
    if (!run) {
      throw new CampaignPlanReviewError("campaign_plan_run_not_found", "Campaign plan run tidak ditemukan.", 404);
    }
    if (run.status !== reviewableStatus) {
      throw new CampaignPlanReviewError("invalid_campaign_plan_run_transition", "Run tidak dapat ditolak dari status saat ini.", 409);
    }
    await client.query(
      `UPDATE campaign_plan_runs
       SET status = 'rejected',
           rejected_at = now(),
           approved_at = NULL,
           updated_at = now()
       WHERE id = $1 AND status = 'ready_for_review'`,
      [runId]
    );
  });
  return getCampaignPlanRunReview(runId);
}
