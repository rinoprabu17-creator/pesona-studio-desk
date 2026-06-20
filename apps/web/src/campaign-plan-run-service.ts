import {
  buildCampaignPlanStrategy,
  CampaignPlannerInputSchema,
  splitStrategyIntoBatches,
  timezone
} from "../../../packages/campaign-planner/src/index.ts";
import type { CampaignPlannerInput, CampaignPlanStrategySlot } from "../../../packages/campaign-planner/src/index.ts";
import { CampaignError } from "./campaign-errors.ts";
import { CampaignPlanRunError } from "./campaign-plan-run-errors.ts";
import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { assertUuid } from "./validation/library-validation.ts";
import { validateCampaignPlanRunInput } from "./validation/campaign-plan-run-validation.ts";
import type { CampaignPlanRunInput } from "./validation/campaign-plan-run-validation.ts";

const promptVersion = "phase-2a2-fake-v1";
const fakeModel = "fake-campaign-planner-v1";
const unresolvedStatuses = ["queued", "generating", "validation_failed", "ready_for_review", "approved", "importing", "failed"];

export type CampaignPlanRunSummary = {
  id: string;
  campaign_id: string;
  campaign_code: string;
  campaign_name: string;
  status: string;
  provider: string;
  model: string;
  requested_content_count: number;
  selected_channels: string[];
  validation_summary: any | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  approved_at: string | null;
  imported_at: string | null;
};

type CampaignForPlanner = {
  id: string;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  target_audience: string;
  primary_product_code: string | null;
  status: string;
};

function safeErrorMessage(message: string): string {
  return message.replace(/postgresql:\/\/\S+/gi, "[database-url]").slice(0, 500);
}

function configuredProvider(): string {
  return process.env.CAMPAIGN_PLANNER_PROVIDER || "fake";
}

function ensureFakeProvider(): void {
  if (configuredProvider() !== "fake") {
    throw new CampaignPlanRunError(
      "campaign_planner_provider_unavailable",
      "Campaign Planner Phase 2A.2 hanya mendukung Fake Provider.",
      503
    );
  }
}

function mapDate(value: unknown): string {
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

function mapRun(row: any): CampaignPlanRunSummary {
  return {
    ...row,
    requested_content_count: Number(row.requested_content_count),
    selected_channels: row.selected_channels || [],
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    started_at: row.started_at ? (row.started_at instanceof Date ? row.started_at.toISOString() : String(row.started_at)) : null,
    completed_at: row.completed_at ? (row.completed_at instanceof Date ? row.completed_at.toISOString() : String(row.completed_at)) : null,
    approved_at: row.approved_at ? (row.approved_at instanceof Date ? row.approved_at.toISOString() : String(row.approved_at)) : null,
    imported_at: row.imported_at ? (row.imported_at instanceof Date ? row.imported_at.toISOString() : String(row.imported_at)) : null
  };
}

async function getCampaignForPlanner(client: DatabaseClient, campaignId: string): Promise<CampaignForPlanner> {
  const result = await client.query(
    `SELECT c.id,
            c.code,
            c.name,
            c.start_date,
            c.end_date,
            c.target_audience,
            c.status,
            p.code AS primary_product_code
     FROM campaigns c
     LEFT JOIN products p ON p.id = c.primary_product_id
     WHERE c.id = $1`,
    [campaignId]
  );

  const row = result.rows[0];
  if (!row) {
    throw new CampaignError("campaign_not_found", "Campaign tidak ditemukan.", 404);
  }

  if (row.status === "completed" || row.status === "archived") {
    throw new CampaignPlanRunError("campaign_not_plannable", "Campaign selesai atau arsip tidak dapat dibuatkan rencana konten.", 409);
  }

  return {
    ...row,
    start_date: mapDate(row.start_date),
    end_date: mapDate(row.end_date)
  };
}

async function activeSnapshots(client: DatabaseClient) {
  const products = await client.query(`SELECT code, name, active FROM products WHERE active = true ORDER BY sort_order, name`);
  const colors = await client.query(`SELECT code, name, hex_preview, active FROM colors WHERE active = true ORDER BY sort_order, name`);
  const defaults = await client.query(
    `SELECT d.school_level, c.code AS color_code, d.active
     FROM school_level_color_defaults d
     JOIN colors c ON c.id = d.color_id
     WHERE d.active = true AND c.active = true
     ORDER BY d.school_level`
  );
  const offers = await client.query(
    `SELECT code, title, public_phrase, condition_text, risk_note, active
     FROM offers
     WHERE active = true
     ORDER BY sort_order, title`
  );
  const painPoints = await client.query(
    `SELECT code, title, buyer_fear, content_angle, safe_claim, avoid_claim, active
     FROM pain_points
     WHERE active = true
     ORDER BY sort_order, title`
  );

  return {
    products: products.rows,
    colors: colors.rows,
    school_level_defaults: defaults.rows,
    offers: offers.rows,
    pain_points: painPoints.rows
  };
}

function buildPlannerInput(
  campaign: CampaignForPlanner,
  values: CampaignPlanRunInput,
  snapshots: Awaited<ReturnType<typeof activeSnapshots>>
): CampaignPlannerInput {
  return CampaignPlannerInputSchema.parse({
    campaign: {
      id: campaign.id,
      code: campaign.code,
      name: campaign.name,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      target_audience: campaign.target_audience,
      primary_product_code: campaign.primary_product_code
    },
    requested_content_count: values.requested_content_count,
    selected_channels: values.selected_channels,
    owner_brief: values.owner_brief,
    default_posting_times: values.default_posting_times,
    ...snapshots,
    timezone
  });
}

async function insertBatches(
  client: DatabaseClient,
  runId: string,
  batches: CampaignPlanStrategySlot[][],
  provider: string,
  model: string
): Promise<void> {
  for (const [index, slots] of batches.entries()) {
    await client.query(
      `INSERT INTO campaign_plan_generation_batches
         (run_id, batch_number, sequence_start, sequence_end, strategy_slots, provider, model)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        runId,
        index + 1,
        slots[0].draft_sequence,
        slots[slots.length - 1].draft_sequence,
        JSON.stringify(slots),
        provider,
        model
      ]
    );
  }
}

export async function createCampaignPlanRun(campaignId: string, input: Record<string, unknown>) {
  assertUuid(campaignId);
  ensureFakeProvider();
  const values = validateCampaignPlanRunInput(input);
  const provider = "fake";
  const model = fakeModel;

  try {
    const runId = await withTransaction(async (client) => {
      const campaign = await getCampaignForPlanner(client, campaignId);
      const snapshots = await activeSnapshots(client);
      const plannerInput = buildPlannerInput(campaign, values, snapshots);
      const strategy = buildCampaignPlanStrategy(plannerInput);
      const batchSize = Number(process.env.CAMPAIGN_PLANNER_BATCH_SIZE || "5");
      const batches = splitStrategyIntoBatches(strategy, batchSize);

      const runResult = await client.query(
        `INSERT INTO campaign_plan_runs
           (campaign_id, status, provider, model, prompt_version, requested_content_count,
            selected_channels, owner_brief, default_posting_times, input_snapshot, strategy_snapshot)
         VALUES ($1, 'queued', $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          campaign.id,
          provider,
          model,
          promptVersion,
          plannerInput.requested_content_count,
          plannerInput.selected_channels,
          plannerInput.owner_brief,
          plannerInput.default_posting_times ? JSON.stringify(plannerInput.default_posting_times) : null,
          JSON.stringify(plannerInput),
          JSON.stringify(strategy)
        ]
      );

      const runId = runResult.rows[0].id;
      await insertBatches(client, runId, batches, provider, model);
      return runId;
    });
    return getCampaignPlanRun(runId);
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new CampaignPlanRunError("active_campaign_plan_run_exists", "Campaign masih memiliki plan run aktif.", 409);
    }
    if (error instanceof CampaignPlanRunError || error instanceof CampaignError) throw error;
    throw new CampaignPlanRunError("campaign_plan_run_create_failed", safeErrorMessage(error?.message || "Plan run gagal dibuat."), 500);
  }
}

export async function listCampaignPlanRuns(campaignId: string): Promise<CampaignPlanRunSummary[]> {
  assertUuid(campaignId);
  const rows = await query<any>(
    `SELECT r.id, r.campaign_id, c.code AS campaign_code, c.name AS campaign_name,
            r.status, r.provider, r.model, r.requested_content_count, r.selected_channels,
            r.validation_summary, r.error_code, r.error_message, r.created_at, r.started_at, r.completed_at,
            r.approved_at, r.imported_at
     FROM campaign_plan_runs r
     JOIN campaigns c ON c.id = r.campaign_id
     WHERE r.campaign_id = $1
     ORDER BY r.created_at DESC`,
    [campaignId]
  );
  return rows.map(mapRun);
}

export async function getCampaignPlanRun(id: string) {
  assertUuid(id);
  const rows = await query<any>(
    `SELECT r.id, r.campaign_id, c.code AS campaign_code, c.name AS campaign_name,
            r.status, r.provider, r.model, r.prompt_version, r.requested_content_count,
            r.selected_channels, r.plan_summary, r.validation_summary,
            r.error_code, r.error_message, r.created_at, r.started_at, r.completed_at,
            r.approved_at, r.imported_at
     FROM campaign_plan_runs r
     JOIN campaigns c ON c.id = r.campaign_id
     WHERE r.id = $1`,
    [id]
  );
  const run = rows[0];
  if (!run) {
    throw new CampaignPlanRunError("campaign_plan_run_not_found", "Campaign plan run tidak ditemukan.", 404);
  }

  const batches = await query<any>(
    `SELECT id, batch_number, sequence_start, sequence_end, status, attempt_count,
            error_code, error_message, started_at, completed_at
     FROM campaign_plan_generation_batches
     WHERE run_id = $1
     ORDER BY batch_number`,
    [id]
  );
  const draftCounts = await query<{ items: string; publications: string }>(
    `SELECT COUNT(DISTINCT i.id)::text AS items,
            COUNT(p.id)::text AS publications
     FROM campaign_plan_draft_items i
     LEFT JOIN campaign_plan_draft_publications p ON p.draft_item_id = i.id
     WHERE i.run_id = $1`,
    [id]
  );
  const importCounts = await query<{
    approved_draft_items: string;
    rejected_draft_items: string;
    imported_content_items: string;
    imported_publications: string;
  }>(
    `SELECT COUNT(DISTINCT i.id) FILTER (WHERE i.review_status = 'approved')::text AS approved_draft_items,
            COUNT(DISTINCT i.id) FILTER (WHERE i.review_status = 'rejected')::text AS rejected_draft_items,
            COUNT(DISTINCT i.imported_content_item_id) FILTER (WHERE i.review_status = 'approved')::text AS imported_content_items,
            COUNT(p.imported_publication_id) FILTER (WHERE i.review_status = 'approved')::text AS imported_publications
     FROM campaign_plan_draft_items i
     LEFT JOIN campaign_plan_draft_publications p ON p.draft_item_id = i.id
     WHERE i.run_id = $1`,
    [id]
  );

  const progress = {
    total: batches.length,
    queued: batches.filter((batch) => batch.status === "queued").length,
    generating: batches.filter((batch) => batch.status === "generating").length,
    completed: batches.filter((batch) => batch.status === "completed").length,
    failed: batches.filter((batch) => batch.status === "failed" || batch.status === "validation_failed").length,
    cancelled: batches.filter((batch) => batch.status === "cancelled").length
  };

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
    prompt_version: run.prompt_version,
    requested_content_count: Number(run.requested_content_count),
    selected_channels: run.selected_channels || [],
    batch_progress: progress,
    batches,
    draft_counts: {
      items: Number(draftCounts[0]?.items || 0),
      publications: Number(draftCounts[0]?.publications || 0)
    },
    import_summary: {
      approved_draft_items: Number(importCounts[0]?.approved_draft_items || 0),
      rejected_draft_items: Number(importCounts[0]?.rejected_draft_items || 0),
      content_items_created: Number(importCounts[0]?.imported_content_items || 0),
      publications_created: Number(importCounts[0]?.imported_publications || 0)
    },
    validation_summary: run.validation_summary,
    error: run.error_code ? { code: run.error_code, message: run.error_message || "Plan run gagal." } : null,
    plan_summary: run.plan_summary,
    created_at: run.created_at instanceof Date ? run.created_at.toISOString() : String(run.created_at),
    started_at: run.started_at ? (run.started_at instanceof Date ? run.started_at.toISOString() : String(run.started_at)) : null,
    completed_at: run.completed_at ? (run.completed_at instanceof Date ? run.completed_at.toISOString() : String(run.completed_at)) : null,
    approved_at: run.approved_at ? (run.approved_at instanceof Date ? run.approved_at.toISOString() : String(run.approved_at)) : null,
    imported_at: run.imported_at ? (run.imported_at instanceof Date ? run.imported_at.toISOString() : String(run.imported_at)) : null
  };
}

export async function retryCampaignPlanRun(id: string) {
  assertUuid(id);
  await withTransaction(async (client) => {
    const run = await client.query(`SELECT id, status FROM campaign_plan_runs WHERE id = $1 FOR UPDATE`, [id]);
    if (!run.rows[0]) {
      throw new CampaignPlanRunError("campaign_plan_run_not_found", "Campaign plan run tidak ditemukan.", 404);
    }
    if (!["validation_failed", "failed"].includes(run.rows[0].status)) {
      throw new CampaignPlanRunError("invalid_campaign_plan_run_transition", "Run tidak dapat diretry dari status saat ini.", 409);
    }

    await client.query(
      `DELETE FROM campaign_plan_draft_publications
       WHERE draft_item_id IN (SELECT id FROM campaign_plan_draft_items WHERE run_id = $1)`,
      [id]
    );
    await client.query(`DELETE FROM campaign_plan_draft_items WHERE run_id = $1`, [id]);
    await client.query(
      `UPDATE campaign_plan_generation_batches
       SET status = 'queued',
           attempt_count = 0,
           provider_output = NULL,
           provider_response_id = NULL,
           input_tokens = NULL,
           output_tokens = NULL,
           total_tokens = NULL,
           error_code = NULL,
           error_message = NULL,
           claimed_at = NULL,
           claimed_by = NULL,
           heartbeat_at = NULL,
           lease_expires_at = NULL,
           started_at = NULL,
           completed_at = NULL,
           next_attempt_at = now(),
           updated_at = now()
       WHERE run_id = $1`,
      [id]
    );
    await client.query(
      `UPDATE campaign_plan_runs
       SET status = 'queued',
           validation_summary = NULL,
           error_code = NULL,
           error_message = NULL,
           attempt_count = 0,
           claimed_at = NULL,
           claimed_by = NULL,
           heartbeat_at = NULL,
           lease_expires_at = NULL,
           completed_at = NULL,
           next_attempt_at = now(),
           updated_at = now()
       WHERE id = $1`,
      [id]
    );
  });
  return getCampaignPlanRun(id);
}

export async function cancelCampaignPlanRun(id: string) {
  assertUuid(id);
  await withTransaction(async (client) => {
    const run = await client.query(`SELECT id, status FROM campaign_plan_runs WHERE id = $1 FOR UPDATE`, [id]);
    if (!run.rows[0]) {
      throw new CampaignPlanRunError("campaign_plan_run_not_found", "Campaign plan run tidak ditemukan.", 404);
    }
    if (!["queued", "generating", "validation_failed", "failed"].includes(run.rows[0].status)) {
      throw new CampaignPlanRunError("invalid_campaign_plan_run_transition", "Run tidak dapat dibatalkan dari status saat ini.", 409);
    }

    await client.query(
      `UPDATE campaign_plan_generation_batches
       SET status = 'cancelled',
           claimed_at = NULL,
           claimed_by = NULL,
           heartbeat_at = NULL,
           lease_expires_at = NULL,
           updated_at = now()
       WHERE run_id = $1 AND status IN ('queued', 'generating')`,
      [id]
    );
    await client.query(
      `UPDATE campaign_plan_runs
       SET status = 'cancelled',
           claimed_at = NULL,
           claimed_by = NULL,
           heartbeat_at = NULL,
           lease_expires_at = NULL,
           completed_at = COALESCE(completed_at, now()),
           updated_at = now()
       WHERE id = $1`,
      [id]
    );
  });
  return getCampaignPlanRun(id);
}

export function isUnresolvedStatus(status: string): boolean {
  return unresolvedStatuses.includes(status);
}
