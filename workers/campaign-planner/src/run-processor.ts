import {
  consolidateCampaignPlan,
  ProviderBatchResultSchema
} from "../../../packages/campaign-planner/src/index.ts";
import { CampaignPlannerProviderError } from "../../../packages/campaign-planner/src/index.ts";
import type {
  CampaignPlannerInput,
  CampaignPlanDraft,
  CampaignPlanStrategySlot,
  ProviderBatchResult,
  ValidationIssue
} from "../../../packages/campaign-planner/src/index.ts";
import type pg from "pg";
import type { CampaignPlannerWorkerConfig } from "./lease.ts";
import { createProviderForRun } from "./provider-factory.ts";

type Client = pg.PoolClient;

export class LostWorkerLeaseError extends Error {
  code = "lost_worker_lease";

  constructor(message = "Worker lease sudah tidak valid.") {
    super(message);
    this.name = "LostWorkerLeaseError";
  }
}

type RunClaim = {
  id: string;
  claimed_by: string;
  attempt_count: number;
};

type BatchClaim = {
  id: string;
  claimed_by: string;
  attempt_count: number;
};

function safeMessage(message: string): string {
  return message
    .replace(/postgresql:\/\/\S+/gi, "[database-url]")
    .replace(/\s+at\s+.+/g, "")
    .slice(0, 500);
}

function issueForItem(issues: ValidationIssue[], itemIndex: number): ValidationIssue[] {
  return issues.filter((issue) => issue.path === `items.${itemIndex}` || issue.path?.startsWith(`items.${itemIndex}.`));
}

async function refreshRunLease(client: Client, run: RunClaim, config: CampaignPlannerWorkerConfig): Promise<boolean> {
  const result = await client.query<{ status: string }>(
    `UPDATE campaign_plan_runs
     SET heartbeat_at = now(),
         lease_expires_at = now() + ($2::text || ' seconds')::interval,
         updated_at = now()
     WHERE id = $1
       AND status = 'generating'
       AND claimed_by = $3
       AND attempt_count = $4
       AND lease_expires_at > now()
     RETURNING status`,
    [run.id, config.leaseSeconds, run.claimed_by, run.attempt_count]
  );
  return result.rows[0]?.status === "generating";
}

async function refreshBatchLease(client: Client, run: RunClaim, batch: BatchClaim, config: CampaignPlannerWorkerConfig): Promise<boolean> {
  const result = await client.query(
    `UPDATE campaign_plan_generation_batches b
     SET heartbeat_at = now(),
         lease_expires_at = now() + ($2::text || ' seconds')::interval,
         updated_at = now()
     WHERE b.id = $1
       AND b.status = 'generating'
       AND b.claimed_by = $3
       AND b.attempt_count = $4
       AND b.lease_expires_at > now()
       AND EXISTS (
         SELECT 1
         FROM campaign_plan_runs r
         WHERE r.id = b.run_id
           AND r.id = $5
           AND r.status = 'generating'
           AND r.claimed_by = $6
           AND r.attempt_count = $7
           AND r.lease_expires_at > now()
       )`,
    [batch.id, config.leaseSeconds, batch.claimed_by, batch.attempt_count, run.id, run.claimed_by, run.attempt_count]
  );
  return result.rowCount === 1;
}

function startHeartbeat(client: Client, run: RunClaim, batch: BatchClaim, config: CampaignPlannerWorkerConfig) {
  let stopped = false;
  let inFlight: Promise<void> | null = null;
  let timeout: NodeJS.Timeout | null = null;

  const tick = () => {
    if (stopped || inFlight) return;
    inFlight = (async () => {
      await refreshRunLease(client, run, config);
      await refreshBatchLease(client, run, batch, config);
    })().catch(() => undefined).finally(() => {
      inFlight = null;
      if (!stopped) {
        timeout = setTimeout(tick, config.heartbeatIntervalMs);
      }
    });
  };

  timeout = setTimeout(tick, config.heartbeatIntervalMs);

  return async () => {
    stopped = true;
    if (timeout) clearTimeout(timeout);
    if (inFlight) await inFlight;
  };
}

async function cancelQueuedBatches(client: Client, runId: string): Promise<void> {
  await client.query(
    `UPDATE campaign_plan_generation_batches
     SET status = 'cancelled',
         claimed_at = NULL,
         claimed_by = NULL,
         heartbeat_at = NULL,
         lease_expires_at = NULL,
         updated_at = now()
     WHERE run_id = $1 AND status IN ('queued', 'generating')`,
    [runId]
  );
}

async function markRunFailure(
  client: Client,
  run: RunClaim,
  status: "validation_failed" | "failed",
  code: string,
  message: string,
  validationSummary: any = null
): Promise<void> {
  const result = await client.query(
    `UPDATE campaign_plan_runs
     SET status = $2,
         validation_summary = $3,
         error_code = $4,
         error_message = $5,
         claimed_at = NULL,
         claimed_by = NULL,
         heartbeat_at = NULL,
         lease_expires_at = NULL,
         completed_at = now(),
         updated_at = now()
     WHERE id = $1
       AND status = 'generating'
       AND claimed_by = $6
       AND attempt_count = $7
       AND lease_expires_at > now()`,
    [run.id, status, validationSummary ? JSON.stringify(validationSummary) : null, code, safeMessage(message), run.claimed_by, run.attempt_count]
  );
  if (result.rowCount !== 1) throw new LostWorkerLeaseError();
}

async function resetBatchForRetry(
  client: Client,
  run: RunClaim,
  batch: BatchClaim,
  code: string,
  message: string
): Promise<void> {
  const result = await client.query(
    `UPDATE campaign_plan_generation_batches
     SET status = 'queued',
         next_attempt_at = now() + interval '1 second',
         error_code = $2,
         error_message = $3,
         claimed_at = NULL,
         claimed_by = NULL,
         heartbeat_at = NULL,
         lease_expires_at = NULL,
         updated_at = now()
     WHERE id = $1
       AND status = 'generating'
       AND claimed_by = $4
       AND attempt_count = $5
       AND lease_expires_at > now()
       AND EXISTS (
         SELECT 1 FROM campaign_plan_runs r
         WHERE r.id = campaign_plan_generation_batches.run_id
           AND r.id = $6
           AND r.status = 'generating'
           AND r.claimed_by = $7
           AND r.attempt_count = $8
           AND r.lease_expires_at > now()
       )`,
    [batch.id, code, safeMessage(message), batch.claimed_by, batch.attempt_count, run.id, run.claimed_by, run.attempt_count]
  );
  if (result.rowCount !== 1) throw new LostWorkerLeaseError();
}

async function markBatchFailure(
  client: Client,
  run: RunClaim,
  batch: BatchClaim,
  status: "validation_failed" | "failed",
  code: string,
  message: string
): Promise<void> {
  const result = await client.query(
    `UPDATE campaign_plan_generation_batches
     SET status = $2,
         error_code = $3,
         error_message = $4,
         claimed_at = NULL,
         claimed_by = NULL,
         heartbeat_at = NULL,
         lease_expires_at = NULL,
         completed_at = now(),
         updated_at = now()
     WHERE id = $1
       AND status = 'generating'
       AND claimed_by = $5
       AND attempt_count = $6
       AND lease_expires_at > now()
       AND EXISTS (
         SELECT 1 FROM campaign_plan_runs r
         WHERE r.id = campaign_plan_generation_batches.run_id
           AND r.id = $7
           AND r.status = 'generating'
           AND r.claimed_by = $8
           AND r.attempt_count = $9
           AND r.lease_expires_at > now()
       )`,
    [batch.id, status, code, safeMessage(message), batch.claimed_by, batch.attempt_count, run.id, run.claimed_by, run.attempt_count]
  );
  if (result.rowCount !== 1) throw new LostWorkerLeaseError();
}

async function processBatch(client: Client, run: any, batch: any, config: CampaignPlannerWorkerConfig): Promise<"completed" | "retry" | "failed" | "cancelled" | "lost_lease"> {
  const runClaim: RunClaim = {
    id: run.id,
    claimed_by: run.claimed_by,
    attempt_count: Number(run.attempt_count)
  };
  const stillGenerating = await refreshRunLease(client, runClaim, config);
  if (!stillGenerating) return "lost_lease";

  const claim = await client.query(
    `UPDATE campaign_plan_generation_batches
     SET status = 'generating',
         attempt_count = attempt_count + 1,
         claimed_at = now(),
         claimed_by = $2,
         heartbeat_at = now(),
         lease_expires_at = now() + ($3::text || ' seconds')::interval,
         started_at = COALESCE(started_at, now()),
         updated_at = now()
     WHERE id = $1
       AND status = 'queued'
       AND EXISTS (
         SELECT 1 FROM campaign_plan_runs r
         WHERE r.id = campaign_plan_generation_batches.run_id
           AND r.id = $4
           AND r.status = 'generating'
           AND r.claimed_by = $5
           AND r.attempt_count = $6
           AND r.lease_expires_at > now()
       )
     RETURNING *`,
    [batch.id, config.workerId, config.leaseSeconds, runClaim.id, runClaim.claimed_by, runClaim.attempt_count]
  );
  const claimed = claim.rows[0];
  if (!claimed) return "completed";
  const batchClaim: BatchClaim = {
    id: claimed.id,
    claimed_by: claimed.claimed_by,
    attempt_count: Number(claimed.attempt_count)
  };

  const stopHeartbeat = startHeartbeat(client, runClaim, batchClaim, config);
  try {
    const provider = createProviderForRun(
      {
        provider: run.provider,
        model: run.model,
        promptVersion: run.prompt_version,
        fakeMode: config.fakeMode
      },
      config
    );
    const result = await provider.generateBatch({
      run_id: run.id,
      batch_index: claimed.batch_number,
      campaign: run.input_snapshot.campaign,
      knowledge: {
        products: run.input_snapshot.products,
        colors: run.input_snapshot.colors,
        school_level_defaults: run.input_snapshot.school_level_defaults,
        offers: run.input_snapshot.offers,
        pain_points: run.input_snapshot.pain_points
      },
      strategy_slots: claimed.strategy_slots as CampaignPlanStrategySlot[],
      owner_brief: run.input_snapshot.owner_brief
    });

    await stopHeartbeat();
    const parsed = ProviderBatchResultSchema.parse(result);
    const active = await refreshRunLease(client, runClaim, config);
    if (!active) return "lost_lease";

    const saved = await client.query(
      `UPDATE campaign_plan_generation_batches
       SET status = 'completed',
           provider_response_id = $2,
           provider_output = $3,
           input_tokens = $4,
           output_tokens = $5,
           total_tokens = $6,
           error_code = NULL,
           error_message = NULL,
           claimed_at = NULL,
           claimed_by = NULL,
           heartbeat_at = NULL,
           lease_expires_at = NULL,
           completed_at = now(),
           updated_at = now()
       WHERE id = $1
         AND status = 'generating'
         AND claimed_by = $7
         AND attempt_count = $8
         AND lease_expires_at > now()
         AND EXISTS (
           SELECT 1 FROM campaign_plan_runs r
           WHERE r.id = campaign_plan_generation_batches.run_id
             AND r.id = $9
             AND r.status = 'generating'
             AND r.claimed_by = $10
             AND r.attempt_count = $11
             AND r.lease_expires_at > now()
         )`,
      [
        claimed.id,
        parsed.response_id,
        JSON.stringify(parsed),
        parsed.usage?.input_tokens ?? null,
        parsed.usage?.output_tokens ?? null,
        parsed.usage?.total_tokens ?? null,
        batchClaim.claimed_by,
        batchClaim.attempt_count,
        runClaim.id,
        runClaim.claimed_by,
        runClaim.attempt_count
      ]
    );
    if (saved.rowCount !== 1) throw new LostWorkerLeaseError();
    return "completed";
  } catch (error: any) {
    await stopHeartbeat();
    if (error instanceof LostWorkerLeaseError) {
      return "lost_lease";
    }
    const code = error instanceof CampaignPlannerProviderError ? error.code : "provider_batch_failed";
    const message = error instanceof Error ? error.message : "Batch generation gagal.";
    const retryable = error instanceof CampaignPlannerProviderError && error.retryable;
    if (retryable && claimed.attempt_count < config.maxAttempts) {
      await resetBatchForRetry(client, runClaim, batchClaim, code, message);
      const resetRun = await client.query(
        `UPDATE campaign_plan_runs
         SET status = 'queued',
             claimed_at = NULL,
             claimed_by = NULL,
             heartbeat_at = NULL,
             lease_expires_at = NULL,
             next_attempt_at = now() + interval '1 second',
             updated_at = now()
         WHERE id = $1
           AND status = 'generating'
           AND claimed_by = $2
           AND attempt_count = $3
           AND lease_expires_at > now()`,
        [run.id, runClaim.claimed_by, runClaim.attempt_count]
      );
      if (resetRun.rowCount !== 1) throw new LostWorkerLeaseError();
      return "retry";
    }

    const status = retryable ? "failed" : "validation_failed";
    await markBatchFailure(client, runClaim, batchClaim, status, code, message);
    await markRunFailure(client, runClaim, status, code, message);
    return "failed";
  }
}

async function insertDraft(
  client: Client,
  runId: string,
  draft: CampaignPlanDraft,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  config: CampaignPlannerWorkerConfig
): Promise<void> {
  await client.query(
    `DELETE FROM campaign_plan_draft_publications
     WHERE draft_item_id IN (SELECT id FROM campaign_plan_draft_items WHERE run_id = $1)`,
    [runId]
  );
  await client.query(`DELETE FROM campaign_plan_draft_items WHERE run_id = $1`, [runId]);

  for (const [index, item] of draft.items.entries()) {
    if (config.finalizeFailAfterDraftItems !== null && index >= config.finalizeFailAfterDraftItems) {
      throw new Error("simulated_finalization_failure");
    }
    const inserted = await client.query<{ id: string }>(
      `INSERT INTO campaign_plan_draft_items
         (run_id, draft_sequence, planned_content_date, title, product_code, school_level, color_code,
          audience_segment, target_audience, content_pillar, primary_offer_code, primary_pain_point_code,
          hook, angle, cta_text, cta_keyword, planning_reason, review_status, validation_errors, validation_warnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'pending_review', $18, $19)
       RETURNING id`,
      [
        runId,
        item.draft_sequence,
        item.planned_content_date,
        item.title,
        item.product_code,
        item.school_level,
        item.color_code,
        item.audience_segment,
        item.target_audience,
        item.content_pillar,
        item.primary_offer_code,
        item.primary_pain_point_code,
        item.hook,
        item.angle,
        item.cta_text,
        item.cta_keyword,
        item.planning_reason,
        JSON.stringify(issueForItem(errors, index)),
        JSON.stringify(issueForItem(warnings, index))
      ]
    );

    const draftItemId = inserted.rows[0].id;
    for (const publication of item.publications) {
      await client.query(
        `INSERT INTO campaign_plan_draft_publications
           (draft_item_id, channel, publication_format, planned_publish_at, platform_title, platform_caption)
         VALUES ($1, $2, $3, $4, $5, NULL)`,
        [
          draftItemId,
          publication.channel,
          publication.publication_format,
          publication.planned_publish_at,
          publication.platform_title
        ]
      );
    }
  }
}

async function finalizeRun(client: Client, run: any, config: CampaignPlannerWorkerConfig): Promise<void> {
  const runClaim: RunClaim = {
    id: run.id,
    claimed_by: run.claimed_by,
    attempt_count: Number(run.attempt_count)
  };
  const outputRows = await client.query<{ provider_output: ProviderBatchResult }>(
    `SELECT provider_output
     FROM campaign_plan_generation_batches
     WHERE run_id = $1
     ORDER BY batch_number`,
    [run.id]
  );
  const outputs = outputRows.rows.map((row) => row.provider_output);
  const result = consolidateCampaignPlan(
    run.input_snapshot as CampaignPlannerInput,
    run.strategy_snapshot as CampaignPlanStrategySlot[],
    outputs
  );

  await client.query("BEGIN");
  try {
    const locked = await client.query(
      `SELECT id
       FROM campaign_plan_runs
       WHERE id = $1
         AND status = 'generating'
         AND claimed_by = $2
         AND attempt_count = $3
         AND lease_expires_at > now()
       FOR UPDATE`,
      [runClaim.id, runClaim.claimed_by, runClaim.attempt_count]
    );
    if (!locked.rows[0]) {
      throw new LostWorkerLeaseError();
    }

    const completed = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM campaign_plan_generation_batches
       WHERE run_id = $1 AND status = 'completed'`,
      [run.id]
    );
    const total = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM campaign_plan_generation_batches
       WHERE run_id = $1`,
      [run.id]
    );
    if (Number(completed.rows[0]?.count || 0) !== Number(total.rows[0]?.count || 0)) {
      throw new LostWorkerLeaseError("Batch belum lengkap untuk finalization.");
    }

    if (!result.summary.valid || !result.draft) {
      const failed = await client.query(
        `UPDATE campaign_plan_runs
         SET status = 'validation_failed',
             validation_summary = $2,
             error_code = 'campaign_plan_validation_failed',
             error_message = 'Draft gagal validasi bisnis.',
             claimed_at = NULL,
             claimed_by = NULL,
             heartbeat_at = NULL,
             lease_expires_at = NULL,
             completed_at = now(),
             updated_at = now()
         WHERE id = $1
           AND status = 'generating'
           AND claimed_by = $3
           AND attempt_count = $4
           AND lease_expires_at > now()`,
        [run.id, JSON.stringify(result.summary), runClaim.claimed_by, runClaim.attempt_count]
      );
      if (failed.rowCount !== 1) throw new LostWorkerLeaseError();
      await client.query("COMMIT");
      return;
    }

    await insertDraft(client, run.id, result.draft, result.errors, result.warnings, config);
    const finalized = await client.query(
      `UPDATE campaign_plan_runs
       SET status = 'ready_for_review',
           plan_summary = $2,
           validation_summary = $3,
           error_code = NULL,
           error_message = NULL,
           claimed_at = NULL,
           claimed_by = NULL,
           heartbeat_at = NULL,
           lease_expires_at = NULL,
           completed_at = now(),
           updated_at = now()
       WHERE id = $1
         AND status = 'generating'
         AND claimed_by = $4
         AND attempt_count = $5
         AND lease_expires_at > now()`,
      [run.id, result.draft.plan_summary, JSON.stringify(result.summary), runClaim.claimed_by, runClaim.attempt_count]
    );
    if (finalized.rowCount !== 1) throw new LostWorkerLeaseError();
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

export async function processClaimedRun(client: Client, run: any, config: CampaignPlannerWorkerConfig): Promise<string> {
  const runClaim: RunClaim = {
    id: run.id,
    claimed_by: run.claimed_by,
    attempt_count: Number(run.attempt_count)
  };
  const batches = await client.query(
    `SELECT *
     FROM campaign_plan_generation_batches
     WHERE run_id = $1
     ORDER BY batch_number`,
    [run.id]
  );

  for (const batch of batches.rows) {
    const current = await client.query(
      `SELECT status, claimed_by, attempt_count
       FROM campaign_plan_runs
       WHERE id = $1`,
      [run.id]
    );
    if (current.rows[0]?.status === "cancelled") {
      await cancelQueuedBatches(client, run.id);
      return "cancelled";
    }
    if (
      current.rows[0]?.status !== "generating" ||
      current.rows[0]?.claimed_by !== runClaim.claimed_by ||
      Number(current.rows[0]?.attempt_count) !== runClaim.attempt_count
    ) {
      return "lost_lease";
    }

    if (batch.status === "completed") continue;
    if (batch.status !== "queued") continue;

    const result = await processBatch(client, run, batch, config);
    if (result !== "completed") return result;
  }

  const completed = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM campaign_plan_generation_batches
     WHERE run_id = $1 AND status = 'completed'`,
    [run.id]
  );
  if (Number(completed.rows[0]?.count || 0) === batches.rows.length) {
    await finalizeRun(client, run, config);
    return "finalized";
  }

  return "pending";
}
