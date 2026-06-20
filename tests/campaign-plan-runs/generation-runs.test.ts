import test from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import { createCampaignPlanRun, cancelCampaignPlanRun, getCampaignPlanRun, retryCampaignPlanRun } from "../../apps/web/src/campaign-plan-run-service.ts";
import { closeDatabase, query } from "../../apps/web/src/db.ts";
import { claimNextRun, processNextRun, recoverStaleJobs, runPollingLoop } from "../../workers/campaign-planner/src/worker.ts";
import { loadWorkerConfig } from "../../workers/campaign-planner/src/lease.ts";
import { processClaimedRun } from "../../workers/campaign-planner/src/run-processor.ts";
import { CampaignPlannerProviderError, FakeCampaignPlannerProvider } from "../../packages/campaign-planner/src/index.ts";

const databaseUrl = process.env.TEST_DATABASE_URL;
const shouldRun = Boolean(databaseUrl);
const { Pool } = pg;
const testCampaignPrefix = `PLANRUN-${process.pid}-`;

function maybeTest(name: string, fn: Parameters<typeof test>[1]) {
  test(name, { skip: shouldRun ? false : "TEST_DATABASE_URL tidak tersedia." }, fn);
}

const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, max: 6 }) : null;
const campaignIds: string[] = [];

async function createCampaign(codeSuffix: string) {
  const result = await pool!.query<{ id: string }>(
    `INSERT INTO campaigns (code, name, start_date, end_date, target_audience, status)
     VALUES ($1, $2, '2026-07-01', '2026-07-30', 'TU Sekolah', 'active')
     RETURNING id`,
    [`${testCampaignPrefix}${codeSuffix}-${Date.now()}`, `Plan Run ${codeSuffix}`]
  );
  campaignIds.push(result.rows[0].id);
  return result.rows[0].id;
}

async function cleanup() {
  if (!pool) return;
  const trackedCampaigns = await pool.query<{ id: string }>(
    `SELECT id
     FROM campaigns
     WHERE id = ANY($1::uuid[]) OR code LIKE $2`,
    [campaignIds, `${testCampaignPrefix}%`]
  );
  const ids = trackedCampaigns.rows.map((row) => row.id);
  if (!ids.length) return;
  await pool.query(
    `DELETE FROM campaign_plan_draft_publications
     WHERE draft_item_id IN (
       SELECT i.id
       FROM campaign_plan_draft_items i
       JOIN campaign_plan_runs r ON r.id = i.run_id
       WHERE r.campaign_id = ANY($1::uuid[])
     )`,
    [ids]
  );
  await pool.query(
    `DELETE FROM campaign_plan_draft_items
     WHERE run_id IN (SELECT id FROM campaign_plan_runs WHERE campaign_id = ANY($1::uuid[]))`,
    [ids]
  );
  await pool.query(
    `DELETE FROM campaign_plan_generation_batches
     WHERE run_id IN (SELECT id FROM campaign_plan_runs WHERE campaign_id = ANY($1::uuid[]))`,
    [ids]
  );
  await pool.query(`DELETE FROM campaign_plan_runs WHERE campaign_id = ANY($1::uuid[])`, [ids]);
  await pool.query(`DELETE FROM campaigns WHERE id = ANY($1::uuid[])`, [ids]);
}

test.after(async () => {
  await cleanup();
  await pool?.end();
  await closeDatabase();
});

test.beforeEach(async () => {
  await cleanup();
  campaignIds.length = 0;
});

function validRunInput() {
  return {
    requested_content_count: 30,
    selected_channels: ["instagram", "facebook", "tiktok", "youtube", "whatsapp_status"],
    owner_brief: "Audit generation run.",
    default_posting_times: {
      instagram: "09:00",
      facebook: "09:15",
      tiktok: "19:00",
      youtube: "19:15",
      whatsapp_status: "07:00"
    }
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor<T>(fn: () => Promise<T>, predicate: (value: T) => boolean, timeoutMs = 3000): Promise<T> {
  const started = Date.now();
  let latest = await fn();
  while (!predicate(latest)) {
    if (Date.now() - started > timeoutMs) return latest;
    await sleep(25);
    latest = await fn();
  }
  return latest;
}

async function stagingCounts(runId: string) {
  const result = await pool!.query(
    `SELECT
       (SELECT COUNT(*)::int FROM campaign_plan_draft_items WHERE run_id = $1) AS items,
       (SELECT COUNT(*)::int
        FROM campaign_plan_draft_publications p
        JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id
        WHERE i.run_id = $1) AS publications,
       (SELECT COUNT(*)::int FROM campaign_plan_generation_batches WHERE run_id = $1 AND provider_output IS NOT NULL) AS outputs`,
    [runId]
  );
  return result.rows[0];
}

async function processUntilRunStatus(runId: string, status: string, config: ReturnType<typeof loadWorkerConfig>) {
  const started = Date.now();
  while (Date.now() - started < 5000) {
    const processed = await processNextRun(pool!, config);
    const row = await pool!.query(`SELECT status FROM campaign_plan_runs WHERE id = $1`, [runId]);
    if (row.rows[0]?.status === status) return row.rows[0];
    if (!processed.processed) await sleep(25);
  }
  return (await pool!.query(`SELECT status FROM campaign_plan_runs WHERE id = $1`, [runId])).rows[0];
}

function validProvider(delayMs = 0, calls: number[] = []) {
  return {
    providerName: "test-valid-provider",
    async generateBatch(input: any) {
      calls.push(input.batch_index);
      if (delayMs) await sleep(delayMs);
      return new FakeCampaignPlannerProvider({ mode: "valid" }).generateBatch(input);
    }
  };
}

maybeTest("create run menyimpan snapshot dan batch tanpa operational write", async () => {
  const campaignId = await createCampaign("CREATE");
  const beforeContent = await pool!.query(`SELECT COUNT(*)::int AS count FROM content_items WHERE campaign_id = $1`, [campaignId]);
  const run = await createCampaignPlanRun(campaignId, validRunInput());

  assert.equal(run.status, "queued");
  assert.equal(run.batch_progress.total, 6);
  assert.equal(run.draft_counts.items, 0);
  assert.equal(run.draft_counts.publications, 0);

  const rows = await pool!.query(
    `SELECT jsonb_array_length(strategy_snapshot) AS strategy_count,
            requested_content_count,
            selected_channels
     FROM campaign_plan_runs
     WHERE id = $1`,
    [run.id]
  );
  assert.equal(Number(rows.rows[0].strategy_count), 30);
  assert.equal(Number(rows.rows[0].requested_content_count), 30);
  assert.equal(rows.rows[0].selected_channels.length, 5);

  await assert.rejects(
    () => createCampaignPlanRun(campaignId, validRunInput()),
    /Campaign masih memiliki plan run aktif/
  );

  const afterContent = await pool!.query(`SELECT COUNT(*)::int AS count FROM content_items WHERE campaign_id = $1`, [campaignId]);
  assert.equal(afterContent.rows[0].count, beforeContent.rows[0].count);
});

maybeTest("worker valid menghasilkan 30 draft items dan 150 draft publications", async () => {
  const campaignId = await createCampaign("VALID");
  const run = await createCampaignPlanRun(campaignId, validRunInput());
  const result = await processNextRun(pool!, loadWorkerConfig({ workerId: "test-worker-valid", fakeMode: "valid", maxAttempts: 3 }));
  assert.equal(result.runId, run.id);

  const refreshed = await query<any>(`SELECT status FROM campaign_plan_runs WHERE id = $1`, [run.id]);
  assert.equal(refreshed[0].status, "ready_for_review");

  const counts = await pool!.query(
    `SELECT
       (SELECT COUNT(*)::int FROM campaign_plan_generation_batches WHERE run_id = $1 AND status = 'completed') AS completed_batches,
       (SELECT COUNT(*)::int FROM campaign_plan_draft_items WHERE run_id = $1 AND review_status = 'pending_review') AS draft_items,
       (SELECT COUNT(*)::int
        FROM campaign_plan_draft_publications p
        JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id
        WHERE i.run_id = $1) AS draft_publications,
       (SELECT COUNT(*)::int
        FROM campaign_plan_draft_publications p
        JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id
        WHERE i.run_id = $1 AND p.platform_caption IS NOT NULL) AS captions`,
    [run.id]
  );
  assert.equal(counts.rows[0].completed_batches, 6);
  assert.equal(counts.rows[0].draft_items, 30);
  assert.equal(counts.rows[0].draft_publications, 150);
  assert.equal(counts.rows[0].captions, 0);

  const operational = await pool!.query(
    `SELECT
       (SELECT COUNT(*)::int FROM content_items WHERE campaign_id = $1) AS content_items,
       (SELECT COUNT(*)::int
        FROM content_publications p
        JOIN content_items i ON i.id = p.content_item_id
        WHERE i.campaign_id = $1) AS publications`,
    [campaignId]
  );
  assert.equal(operational.rows[0].content_items, 0);
  assert.equal(operational.rows[0].publications, 0);

  const identity = await pool!.query(
    `SELECT i.draft_sequence,
            i.planned_content_date::text,
            i.content_pillar,
            i.audience_segment,
            i.product_code,
            (r.strategy_snapshot -> (i.draft_sequence - 1) ->> 'planned_content_date') AS strategy_date,
            (r.strategy_snapshot -> (i.draft_sequence - 1) ->> 'content_pillar') AS strategy_pillar
     FROM campaign_plan_draft_items i
     JOIN campaign_plan_runs r ON r.id = i.run_id
     WHERE i.run_id = $1
     ORDER BY i.draft_sequence`,
    [run.id]
  );
  assert.equal(identity.rows.length, 30);
  assert.equal(identity.rows[0].draft_sequence, 1);
  assert.equal(identity.rows[29].draft_sequence, 30);
  assert.ok(identity.rows.every((row) => row.planned_content_date === row.strategy_date));
  assert.ok(identity.rows.every((row) => row.content_pillar === row.strategy_pillar));

  const youtube = await pool!.query(
    `SELECT COUNT(*)::int AS count
     FROM campaign_plan_draft_publications p
     JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id
     WHERE i.run_id = $1 AND p.channel = 'youtube' AND NULLIF(p.platform_title, '') IS NOT NULL`,
    [run.id]
  );
  assert.equal(youtube.rows[0].count, 30);
});

maybeTest("failure fixtures tidak membuat draft setengah jadi", async () => {
  for (const mode of ["refusal", "malformed", "partial_output", "forbidden_claim", "duplicate_hook", "missing_youtube_title"] as const) {
    const campaignId = await createCampaign(`FAIL-${mode}`);
    const run = await createCampaignPlanRun(campaignId, { ...validRunInput(), requested_content_count: 5 });
    const result = await processNextRun(pool!, loadWorkerConfig({ workerId: `test-${mode}`, fakeMode: mode, maxAttempts: 1 }));
    assert.equal(result.runId, run.id);
    const rows = await pool!.query(
      `SELECT r.status,
              (SELECT COUNT(*)::int FROM campaign_plan_draft_items WHERE run_id = r.id) AS drafts
       FROM campaign_plan_runs r
       WHERE r.id = $1`,
      [run.id]
    );
    assert.ok(["validation_failed", "failed"].includes(rows.rows[0].status));
    assert.equal(rows.rows[0].drafts, 0);
  }
});

maybeTest("timeout retry terbatas lalu manual retry valid memakai run id yang sama", async () => {
  const campaignId = await createCampaign("TIMEOUT");
  const run = await createCampaignPlanRun(campaignId, { ...validRunInput(), requested_content_count: 5 });
  const timeoutConfig = loadWorkerConfig({ workerId: "test-timeout", fakeMode: "timeout", maxAttempts: 2 });

  await processNextRun(pool!, timeoutConfig);
  let row = await pool!.query(`SELECT status FROM campaign_plan_runs WHERE id = $1`, [run.id]);
  assert.equal(row.rows[0].status, "queued");
  await pool!.query(`UPDATE campaign_plan_runs SET next_attempt_at = now() WHERE id = $1`, [run.id]);
  await pool!.query(`UPDATE campaign_plan_generation_batches SET next_attempt_at = now() WHERE run_id = $1`, [run.id]);

  await processNextRun(pool!, timeoutConfig);
  row = await pool!.query(`SELECT status FROM campaign_plan_runs WHERE id = $1`, [run.id]);
  assert.equal(row.rows[0].status, "failed");

  const before = await pool!.query(`SELECT input_snapshot, strategy_snapshot FROM campaign_plan_runs WHERE id = $1`, [run.id]);
  const retried = await retryCampaignPlanRun(run.id);
  assert.equal(retried.id, run.id);
  const after = await pool!.query(`SELECT input_snapshot, strategy_snapshot FROM campaign_plan_runs WHERE id = $1`, [run.id]);
  assert.deepEqual(after.rows[0].input_snapshot, before.rows[0].input_snapshot);
  assert.deepEqual(after.rows[0].strategy_snapshot, before.rows[0].strategy_snapshot);

  const ready = await processUntilRunStatus(run.id, "ready_for_review", loadWorkerConfig({ workerId: "test-timeout-valid", fakeMode: "valid", maxAttempts: 2 }));
  assert.equal(ready.status, "ready_for_review");
});

maybeTest("cancel queued dan generating menghentikan worker", async () => {
  const queuedCampaign = await createCampaign("CANCEL-Q");
  const queuedRun = await createCampaignPlanRun(queuedCampaign, { ...validRunInput(), requested_content_count: 5 });
  const cancelled = await cancelCampaignPlanRun(queuedRun.id);
  assert.equal(cancelled.status, "cancelled");

  const generatingCampaign = await createCampaign("CANCEL-G");
  const generatingRun = await createCampaignPlanRun(generatingCampaign, { ...validRunInput(), requested_content_count: 5 });
  const claimed = await claimNextRun(pool!, loadWorkerConfig({ workerId: "test-cancel-claim" }));
  assert.equal(claimed.id, generatingRun.id);
  const cancelledGenerating = await cancelCampaignPlanRun(generatingRun.id);
  assert.equal(cancelledGenerating.status, "cancelled");
  await processNextRun(pool!, loadWorkerConfig({ workerId: "test-cancel-worker", fakeMode: "valid" }));
  const draftCount = await pool!.query(`SELECT COUNT(*)::int AS count FROM campaign_plan_draft_items WHERE run_id = $1`, [generatingRun.id]);
  assert.equal(draftCount.rows[0].count, 0);
});

maybeTest("lease recovery dan concurrency claim aman", async () => {
  const singleCampaign = await createCampaign("CLAIM-SAME");
  const singleRun = await createCampaignPlanRun(singleCampaign, { ...validRunInput(), requested_content_count: 5 });
  const [sameA, sameB] = await Promise.all([
    claimNextRun(pool!, loadWorkerConfig({ workerId: "claim-same-a" })),
    claimNextRun(pool!, loadWorkerConfig({ workerId: "claim-same-b" }))
  ]);
  assert.equal([sameA?.id, sameB?.id].filter((id) => id === singleRun.id).length, 1);
  await cancelCampaignPlanRun(singleRun.id);

  const firstCampaign = await createCampaign("CLAIM1");
  const secondCampaign = await createCampaign("CLAIM2");
  const firstRun = await createCampaignPlanRun(firstCampaign, { ...validRunInput(), requested_content_count: 5 });
  const secondRun = await createCampaignPlanRun(secondCampaign, { ...validRunInput(), requested_content_count: 5 });

  const [claimA, claimB] = await Promise.all([
    claimNextRun(pool!, loadWorkerConfig({ workerId: "claim-a" })),
    claimNextRun(pool!, loadWorkerConfig({ workerId: "claim-b" }))
  ]);
  assert.notEqual(claimA?.id, claimB?.id);
  assert.deepEqual(new Set([claimA?.id, claimB?.id]), new Set([firstRun.id, secondRun.id]));

  await pool!.query(
    `UPDATE campaign_plan_runs
     SET status = 'generating', attempt_count = 1, lease_expires_at = now() - interval '1 second'
     WHERE id = $1`,
    [firstRun.id]
  );
  await recoverStaleJobs(pool!, loadWorkerConfig({ maxAttempts: 3 }));
  let row = await pool!.query(`SELECT status FROM campaign_plan_runs WHERE id = $1`, [firstRun.id]);
  assert.equal(row.rows[0].status, "queued");

  await pool!.query(
    `UPDATE campaign_plan_runs
     SET status = 'generating', attempt_count = 3, lease_expires_at = now() - interval '1 second'
     WHERE id = $1`,
    [secondRun.id]
  );
  await recoverStaleJobs(pool!, loadWorkerConfig({ maxAttempts: 3 }));
  row = await pool!.query(`SELECT status, error_code FROM campaign_plan_runs WHERE id = $1`, [secondRun.id]);
  assert.equal(row.rows[0].status, "failed");
  assert.equal(row.rows[0].error_code, "stale_worker_lease_exhausted");
});

maybeTest("lease fencing menolak write stale worker pada run dan batch", async () => {
  const campaignId = await createCampaign("FENCE");
  const run = await createCampaignPlanRun(campaignId, { ...validRunInput(), requested_content_count: 5 });
  const workerA = loadWorkerConfig({ workerId: "fence-a", fakeMode: "valid", leaseSeconds: 1, heartbeatIntervalMs: 100 });
  const claimedA = await claimNextRun(pool!, workerA);
  assert.equal(claimedA.id, run.id);

  await pool!.query(
    `UPDATE campaign_plan_runs
     SET lease_expires_at = now() - interval '1 second',
         heartbeat_at = now() - interval '2 seconds'
     WHERE id = $1`,
    [run.id]
  );
  await recoverStaleJobs(pool!, loadWorkerConfig({ maxAttempts: 3 }));
  const workerB = loadWorkerConfig({ workerId: "fence-b", fakeMode: "valid", leaseSeconds: 30 });
  const claimedB = await claimNextRun(pool!, workerB);
  assert.equal(claimedB.id, run.id);
  assert.equal(claimedB.claimed_by, "fence-b");
  assert.notEqual(claimedB.attempt_count, claimedA.attempt_count);

  const client = await pool!.connect();
  try {
    const result = await processClaimedRun(client, claimedA, workerA);
    assert.equal(result, "lost_lease");
  } finally {
    client.release();
  }

  const row = await pool!.query(
    `SELECT status, claimed_by,
            (SELECT COUNT(*)::int FROM campaign_plan_generation_batches WHERE run_id = $1 AND provider_output IS NOT NULL) AS outputs,
            (SELECT COUNT(*)::int FROM campaign_plan_draft_items WHERE run_id = $1) AS drafts
     FROM campaign_plan_runs
     WHERE id = $1`,
    [run.id]
  );
  assert.equal(row.rows[0].status, "generating");
  assert.equal(row.rows[0].claimed_by, "fence-b");
  assert.equal(row.rows[0].outputs, 0);
  assert.equal(row.rows[0].drafts, 0);
});

maybeTest("heartbeat selama slow provider mencegah stale recovery mengambil job aktif", async () => {
  const campaignId = await createCampaign("HEARTBEAT");
  const run = await createCampaignPlanRun(campaignId, { ...validRunInput(), requested_content_count: 5 });
  const calls: number[] = [];
  const config = loadWorkerConfig({
    workerId: "heartbeat-worker",
    leaseSeconds: 1,
    heartbeatIntervalMs: 100,
    maxAttempts: 3,
    providerFactory: () => validProvider(1200, calls)
  });

  const processing = processNextRun(pool!, config);
  const generating = await waitFor(
    () =>
      pool!.query(
        `SELECT status, lease_expires_at, heartbeat_at, claimed_at
         FROM campaign_plan_runs
         WHERE id = $1`,
        [run.id]
      ),
    (result) =>
      result.rows[0]?.status === "generating" &&
      result.rows[0]?.heartbeat_at &&
      result.rows[0].heartbeat_at > result.rows[0].claimed_at
  );
  assert.equal(generating.rows[0].status, "generating");
  await recoverStaleJobs(pool!, loadWorkerConfig({ maxAttempts: 3 }));
  const during = await pool!.query(`SELECT status, claimed_by FROM campaign_plan_runs WHERE id = $1`, [run.id]);
  assert.equal(during.rows[0].status, "generating");
  assert.equal(during.rows[0].claimed_by, "heartbeat-worker");

  const result = await processing;
  assert.equal(result.result, "finalized");
  assert.deepEqual(calls, [1]);
});

maybeTest("final consolidation atomic dan idempotent tanpa duplicate draft", async () => {
  const campaignId = await createCampaign("ATOMIC");
  const run = await createCampaignPlanRun(campaignId, validRunInput());
  const failConfig = loadWorkerConfig({
    workerId: "atomic-fail",
    fakeMode: "valid",
    finalizeFailAfterDraftItems: 3
  });
  const failed = await processUntilRunStatus(run.id, "failed", failConfig);
  assert.equal(failed.status, "failed");
  let row = await pool!.query(`SELECT status FROM campaign_plan_runs WHERE id = $1`, [run.id]);
  assert.equal(row.rows[0].status, "failed");
  let counts = await stagingCounts(run.id);
  assert.equal(counts.items, 0);
  assert.equal(counts.publications, 0);

  await retryCampaignPlanRun(run.id);
  const valid = await processUntilRunStatus(
    run.id,
    "ready_for_review",
    loadWorkerConfig({ workerId: "atomic-valid", fakeMode: "valid" })
  );
  assert.equal(valid.status, "ready_for_review");
  counts = await stagingCounts(run.id);
  assert.equal(counts.items, 30);
  assert.equal(counts.publications, 150);

  const again = await processNextRun(pool!, loadWorkerConfig({ workerId: "atomic-again", fakeMode: "valid" }));
  assert.equal(again.processed, false);
  counts = await stagingCounts(run.id);
  assert.equal(counts.items, 30);
  assert.equal(counts.publications, 150);
});

maybeTest("partial batch resume tidak mengulang completed batch", async () => {
  const campaignId = await createCampaign("RESUME");
  const run = await createCampaignPlanRun(campaignId, validRunInput());
  const calls: number[] = [];
  const failedOnce = new Set<number>();
  const providerFactory = () => ({
    providerName: "resume-provider",
    async generateBatch(input: any) {
      calls.push(input.batch_index);
      if (input.batch_index === 3 && !failedOnce.has(3)) {
        failedOnce.add(3);
        throw new CampaignPlannerProviderError("provider_timeout", "Provider timeout.", { retryable: true });
      }
      return new FakeCampaignPlannerProvider({ mode: "valid" }).generateBatch(input);
    }
  });

  const config = loadWorkerConfig({ workerId: "resume-worker", maxAttempts: 3, providerFactory });
  const first = await processNextRun(pool!, config);
  assert.equal(first.result, "retry");
  let batches = await pool!.query(
    `SELECT batch_number, status, provider_output IS NOT NULL AS has_output
     FROM campaign_plan_generation_batches
     WHERE run_id = $1
     ORDER BY batch_number`,
    [run.id]
  );
  assert.deepEqual(batches.rows.slice(0, 3).map((row) => [row.batch_number, row.status, row.has_output]), [
    [1, "completed", true],
    [2, "completed", true],
    [3, "queued", false]
  ]);
  await pool!.query(`UPDATE campaign_plan_runs SET next_attempt_at = now() WHERE id = $1`, [run.id]);
  await pool!.query(`UPDATE campaign_plan_generation_batches SET next_attempt_at = now() WHERE run_id = $1`, [run.id]);

  const resumeConfig = loadWorkerConfig({ workerId: "resume-worker-2", maxAttempts: 3, providerFactory });
  const second = await waitFor(
    () => processNextRun(pool!, resumeConfig),
    (result) => result.runId === run.id && result.result !== "none"
  );
  assert.equal(second.result, "finalized");
  assert.deepEqual(calls, [1, 2, 3, 3, 4, 5, 6]);
  batches = await pool!.query(
    `SELECT COUNT(*)::int AS completed
     FROM campaign_plan_generation_batches
     WHERE run_id = $1 AND status = 'completed'`,
    [run.id]
  );
  assert.equal(batches.rows[0].completed, 6);
  const sequence = await pool!.query(
    `SELECT array_agg(draft_sequence ORDER BY draft_sequence) AS seq
     FROM campaign_plan_draft_items
     WHERE run_id = $1`,
    [run.id]
  );
  assert.deepEqual(sequence.rows[0].seq, Array.from({ length: 30 }, (_, index) => index + 1));
});

maybeTest("cancel race tidak menyimpan output setelah provider selesai", async () => {
  const campaignId = await createCampaign("CANCEL-RACE");
  const run = await createCampaignPlanRun(campaignId, { ...validRunInput(), requested_content_count: 5 });
  const config = loadWorkerConfig({
    workerId: "cancel-race-worker",
    leaseSeconds: 2,
    heartbeatIntervalMs: 100,
    providerFactory: () => validProvider(500)
  });
  const claimed = await claimNextRun(pool!, config);
  assert.equal(claimed.id, run.id);
  const client = await pool!.connect();
  const processing = processClaimedRun(client, claimed, config).finally(() => client.release());
  await waitFor(
    () => pool!.query(`SELECT status FROM campaign_plan_generation_batches WHERE run_id = $1 ORDER BY batch_number LIMIT 1`, [run.id]),
    (result) => result.rows[0]?.status === "generating"
  );
  const cancelled = await cancelCampaignPlanRun(run.id);
  assert.equal(cancelled.status, "cancelled");
  const result = await processing;
  assert.ok(["lost_lease", "cancelled"].includes(result));

  const row = await pool!.query(
    `SELECT r.status,
            (SELECT COUNT(*)::int FROM campaign_plan_generation_batches WHERE run_id = $1 AND provider_output IS NOT NULL) AS outputs,
            (SELECT COUNT(*)::int FROM campaign_plan_draft_items WHERE run_id = $1) AS drafts,
            (SELECT COUNT(*)::int FROM campaign_plan_generation_batches WHERE run_id = $1 AND status IN ('queued','generating')) AS active_batches
     FROM campaign_plan_runs r
     WHERE r.id = $1`,
    [run.id]
  );
  assert.equal(row.rows[0].status, "cancelled");
  assert.equal(row.rows[0].outputs, 0);
  assert.equal(row.rows[0].drafts, 0);
  assert.equal(row.rows[0].active_batches, 0);
});

maybeTest("unresolved run memblokir create baru sampai cancelled", async () => {
  const validationCampaign = await createCampaign("UNRESOLVED-V");
  const validationRun = await createCampaignPlanRun(validationCampaign, { ...validRunInput(), requested_content_count: 5 });
  await processNextRun(pool!, loadWorkerConfig({ workerId: "unresolved-validation", fakeMode: "missing_youtube_title" }));
  await assert.rejects(() => createCampaignPlanRun(validationCampaign, validRunInput()), /Campaign masih memiliki plan run aktif/);
  await cancelCampaignPlanRun(validationRun.id);
  const replacement = await createCampaignPlanRun(validationCampaign, { ...validRunInput(), requested_content_count: 5 });
  assert.equal(replacement.status, "queued");
  await cancelCampaignPlanRun(replacement.id);

  const readyCampaign = await createCampaign("UNRESOLVED-R");
  await createCampaignPlanRun(readyCampaign, { ...validRunInput(), requested_content_count: 5 });
  await processNextRun(pool!, loadWorkerConfig({ workerId: "unresolved-ready", fakeMode: "valid" }));
  await assert.rejects(() => createCampaignPlanRun(readyCampaign, validRunInput()), /Campaign masih memiliki plan run aktif/);
});

maybeTest("snapshot immutable dan config drift batch size tidak membagi ulang run existing", async () => {
  const campaignId = await createCampaign("DRIFT");
  const run = await createCampaignPlanRun(campaignId, validRunInput());
  const before = await pool!.query(
    `SELECT input_snapshot, strategy_snapshot,
            (SELECT COUNT(*)::int FROM campaign_plan_generation_batches WHERE run_id = campaign_plan_runs.id) AS batches
     FROM campaign_plan_runs
     WHERE id = $1`,
    [run.id]
  );
  assert.equal(before.rows[0].batches, 6);

  await processNextRun(pool!, loadWorkerConfig({ workerId: "drift-worker", fakeMode: "timeout", maxAttempts: 1, batchSize: 10 }));
  await retryCampaignPlanRun(run.id);
  await cancelCampaignPlanRun(run.id);
  const after = await pool!.query(
    `SELECT input_snapshot, strategy_snapshot,
            (SELECT COUNT(*)::int FROM campaign_plan_generation_batches WHERE run_id = campaign_plan_runs.id) AS batches,
            (SELECT COUNT(*)::int FROM campaign_plan_generation_batches WHERE run_id = campaign_plan_runs.id GROUP BY run_id HAVING COUNT(*) = COUNT(DISTINCT batch_number)) AS unique_batches
     FROM campaign_plan_runs
     WHERE id = $1`,
    [run.id]
  );
  assert.deepEqual(after.rows[0].input_snapshot, before.rows[0].input_snapshot);
  assert.deepEqual(after.rows[0].strategy_snapshot, before.rows[0].strategy_snapshot);
  assert.equal(after.rows[0].batches, 6);
  assert.equal(after.rows[0].unique_batches, 6);
});

maybeTest("manual retry reset state konsisten tanpa membuat run atau batch baru", async () => {
  const campaignId = await createCampaign("RETRY-STATE");
  const run = await createCampaignPlanRun(campaignId, { ...validRunInput(), requested_content_count: 5 });
  await processUntilRunStatus(run.id, "validation_failed", loadWorkerConfig({ workerId: "retry-state-fail", fakeMode: "missing_youtube_title" }));
  const before = await pool!.query(
    `SELECT id, campaign_id, input_snapshot, strategy_snapshot,
            (SELECT COUNT(*)::int FROM campaign_plan_generation_batches WHERE run_id = campaign_plan_runs.id) AS batches
     FROM campaign_plan_runs
     WHERE id = $1`,
    [run.id]
  );
  await retryCampaignPlanRun(run.id);
  const after = await pool!.query(
    `SELECT id, campaign_id, status, attempt_count, input_snapshot, strategy_snapshot,
            (SELECT COUNT(*)::int FROM campaign_plan_generation_batches WHERE run_id = campaign_plan_runs.id) AS batches,
            (SELECT COUNT(*)::int FROM campaign_plan_generation_batches WHERE run_id = campaign_plan_runs.id AND provider_output IS NULL AND attempt_count = 0 AND status = 'queued') AS reset_batches,
            (SELECT COUNT(*)::int FROM campaign_plan_generation_batches WHERE run_id = campaign_plan_runs.id GROUP BY run_id HAVING COUNT(*) = COUNT(DISTINCT (sequence_start, sequence_end))) AS unique_ranges
     FROM campaign_plan_runs
     WHERE id = $1`,
    [run.id]
  );
  assert.equal(after.rows[0].id, before.rows[0].id);
  assert.equal(after.rows[0].campaign_id, before.rows[0].campaign_id);
  assert.equal(after.rows[0].status, "queued");
  assert.equal(after.rows[0].attempt_count, 0);
  assert.deepEqual(after.rows[0].input_snapshot, before.rows[0].input_snapshot);
  assert.deepEqual(after.rows[0].strategy_snapshot, before.rows[0].strategy_snapshot);
  assert.equal(after.rows[0].batches, before.rows[0].batches);
  assert.equal(after.rows[0].reset_batches, before.rows[0].batches);
  assert.equal(after.rows[0].unique_ranges, before.rows[0].batches);
});

maybeTest("database constraints menolak data staging invalid", async () => {
  const client = await pool!.connect();
  try {
    await client.query("BEGIN");
    const campaign = await client.query<{ id: string }>(
      `INSERT INTO campaigns (code, name, start_date, end_date, target_audience, status)
       VALUES ('PLANRUN-CONSTRAINT-' || floor(extract(epoch from clock_timestamp()) * 1000)::text, 'Constraint Audit', '2026-07-01', '2026-07-30', 'TU Sekolah', 'active')
       RETURNING id`
    );
    const campaignId = campaign.rows[0].id;

    async function expectReject(sql: string, params: unknown[] = []) {
      await client.query("SAVEPOINT audit_case");
      await assert.rejects(() => client.query(sql, params));
      await client.query("ROLLBACK TO SAVEPOINT audit_case");
      await client.query("RELEASE SAVEPOINT audit_case");
    }

    const run = await client.query<{ id: string }>(
      `INSERT INTO campaign_plan_runs
         (campaign_id, status, provider, model, prompt_version, requested_content_count, selected_channels, input_snapshot, strategy_snapshot)
       VALUES ($1, 'queued', 'fake', 'fake', 'test', 1, ARRAY['instagram'], '{}', '[]')
       RETURNING id`,
      [campaignId]
    );
    const runId = run.rows[0].id;
    await expectReject(
      `INSERT INTO campaign_plan_runs
         (campaign_id, status, provider, model, prompt_version, requested_content_count, selected_channels, input_snapshot, strategy_snapshot)
       VALUES ($1, 'queued', 'fake', 'fake', 'test', 1, ARRAY['instagram'], '{}', '[]')`,
      [campaignId]
    );
    await expectReject(
      `INSERT INTO campaign_plan_runs (campaign_id, status, provider, model, prompt_version, requested_content_count, selected_channels, input_snapshot, strategy_snapshot)
       VALUES ($1, 'queued', 'fake', 'fake', 'test', 0, ARRAY['instagram'], '{}', '[]')`,
      [campaignId]
    );
    await expectReject(
      `INSERT INTO campaign_plan_runs (campaign_id, status, provider, model, prompt_version, requested_content_count, selected_channels, input_snapshot, strategy_snapshot)
       VALUES ($1, 'queued', 'fake', 'fake', 'test', 31, ARRAY['instagram'], '{}', '[]')`,
      [campaignId]
    );
    await expectReject(
      `INSERT INTO campaign_plan_runs (campaign_id, status, provider, model, prompt_version, requested_content_count, selected_channels, input_snapshot, strategy_snapshot)
       VALUES ($1, 'queued', 'fake', 'fake', 'test', 1, ARRAY[]::text[], '{}', '[]')`,
      [campaignId]
    );
    await expectReject(
      `INSERT INTO campaign_plan_runs (campaign_id, status, provider, model, prompt_version, requested_content_count, selected_channels, input_snapshot, strategy_snapshot)
       VALUES ($1, 'queued', 'fake', 'fake', 'test', 1, ARRAY['instagram'], '[]', '[]')`,
      [campaignId]
    );
    await expectReject(
      `INSERT INTO campaign_plan_runs (campaign_id, status, provider, model, prompt_version, requested_content_count, selected_channels, input_snapshot, strategy_snapshot)
       VALUES ($1, 'queued', 'fake', 'fake', 'test', 1, ARRAY['instagram'], '{}', '{}')`,
      [campaignId]
    );
    await expectReject(`UPDATE campaign_plan_runs SET status = 'bogus' WHERE id = $1`, [runId]);

    const batch = await client.query<{ id: string }>(
      `INSERT INTO campaign_plan_generation_batches
         (run_id, batch_number, sequence_start, sequence_end, strategy_slots, provider, model)
       VALUES ($1, 1, 1, 1, '[]', 'fake', 'fake')
       RETURNING id`,
      [runId]
    );
    await expectReject(
      `INSERT INTO campaign_plan_generation_batches (run_id, batch_number, sequence_start, sequence_end, strategy_slots, provider, model)
       VALUES ($1, 0, 1, 1, '[]', 'fake', 'fake')`,
      [runId]
    );
    await expectReject(
      `INSERT INTO campaign_plan_generation_batches (run_id, batch_number, sequence_start, sequence_end, strategy_slots, provider, model)
       VALUES ($1, 2, 0, 1, '[]', 'fake', 'fake')`,
      [runId]
    );
    await expectReject(
      `INSERT INTO campaign_plan_generation_batches (run_id, batch_number, sequence_start, sequence_end, strategy_slots, provider, model)
       VALUES ($1, 2, 2, 1, '[]', 'fake', 'fake')`,
      [runId]
    );
    await expectReject(
      `INSERT INTO campaign_plan_generation_batches (run_id, batch_number, sequence_start, sequence_end, strategy_slots, provider, model)
       VALUES ($1, 2, 2, 2, '{}', 'fake', 'fake')`,
      [runId]
    );
    await expectReject(`UPDATE campaign_plan_generation_batches SET status = 'bogus' WHERE id = $1`, [batch.rows[0].id]);
    await expectReject(
      `INSERT INTO campaign_plan_generation_batches (run_id, batch_number, sequence_start, sequence_end, strategy_slots, provider, model)
       VALUES ($1, 1, 2, 2, '[]', 'fake', 'fake')`,
      [runId]
    );
    await expectReject(
      `INSERT INTO campaign_plan_generation_batches (run_id, batch_number, sequence_start, sequence_end, strategy_slots, provider, model)
       VALUES ($1, 2, 1, 1, '[]', 'fake', 'fake')`,
      [runId]
    );

    const item = await client.query<{ id: string }>(
      `INSERT INTO campaign_plan_draft_items
         (run_id, draft_sequence, planned_content_date, title, audience_segment, target_audience, content_pillar, hook, angle, cta_text, planning_reason)
       VALUES ($1, 1, '2026-07-01', 'Title', 'end_user_school', 'TU', 'offer', 'Hook', 'Angle', 'CTA', 'Reason')
       RETURNING id`,
      [runId]
    );
    await expectReject(
      `INSERT INTO campaign_plan_draft_items
         (run_id, draft_sequence, planned_content_date, title, audience_segment, target_audience, content_pillar, hook, angle, cta_text, planning_reason)
       VALUES ($1, 1, '2026-07-01', 'Title', 'end_user_school', 'TU', 'offer', 'Hook', 'Angle', 'CTA', 'Reason')`,
      [runId]
    );
    await expectReject(`UPDATE campaign_plan_draft_items SET review_status = 'edited' WHERE id = $1`, [item.rows[0].id]);
    await expectReject(`UPDATE campaign_plan_draft_items SET validation_errors = '{}' WHERE id = $1`, [item.rows[0].id]);
    await expectReject(`UPDATE campaign_plan_draft_items SET validation_warnings = '{}' WHERE id = $1`, [item.rows[0].id]);
    await expectReject(`UPDATE campaign_plan_draft_items SET audience_segment = 'bogus' WHERE id = $1`, [item.rows[0].id]);
    await expectReject(`UPDATE campaign_plan_draft_items SET content_pillar = 'bogus' WHERE id = $1`, [item.rows[0].id]);
    await expectReject(`UPDATE campaign_plan_draft_items SET school_level = 'kuliah' WHERE id = $1`, [item.rows[0].id]);

    await client.query(
      `INSERT INTO campaign_plan_draft_publications (draft_item_id, channel, publication_format)
       VALUES ($1, 'instagram', 'reel')`,
      [item.rows[0].id]
    );
    await expectReject(
      `INSERT INTO campaign_plan_draft_publications (draft_item_id, channel, publication_format, platform_caption)
       VALUES ($1, 'facebook', 'reel', 'caption')`,
      [item.rows[0].id]
    );
    await expectReject(
      `INSERT INTO campaign_plan_draft_publications (draft_item_id, channel, publication_format)
       VALUES ($1, 'instagram', 'reel')`,
      [item.rows[0].id]
    );
    await expectReject(
      `INSERT INTO campaign_plan_draft_publications (draft_item_id, channel, publication_format)
       VALUES ($1, 'instagram', 'short_video')`,
      [item.rows[0].id]
    );

    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
});

maybeTest("API detail aman dan environment validation ketat", async () => {
  const campaignId = await createCampaign("SAFE-API");
  const run = await createCampaignPlanRun(campaignId, { ...validRunInput(), requested_content_count: 5 });
  const detail = await getCampaignPlanRun(run.id);
  const payload = JSON.stringify(detail);
  assert.equal(Object.hasOwn(detail, "input_snapshot"), false);
  assert.equal(Object.hasOwn(detail, "strategy_snapshot"), false);
  assert.equal(Object.hasOwn(detail, "owner_brief"), false);
  assert.equal(Object.hasOwn(detail, "default_posting_times"), false);
  assert.equal(payload.includes("provider_output"), false);
  assert.equal(payload.includes("claimed_by"), false);
  assert.equal(payload.includes("lease_expires_at"), false);
  assert.equal(/DATABASE_URL|password|stack/i.test(payload), false);
  await assert.rejects(
    () => getCampaignPlanRun("not-a-uuid"),
    (error: any) => error?.code === "invalid_uuid" && /ID tidak valid/.test(error.message)
  );

  const originalEnv = { ...process.env };
  try {
    for (const [name, value] of [
      ["CAMPAIGN_PLANNER_POLL_MS", "0"],
      ["CAMPAIGN_PLANNER_LEASE_SECONDS", "-1"],
      ["CAMPAIGN_PLANNER_MAX_ATTEMPTS", "1.5"],
      ["CAMPAIGN_PLANNER_BATCH_SIZE", "11"],
      ["CAMPAIGN_PLANNER_BATCH_SIZE", "abc"]
    ] as const) {
      process.env = { ...originalEnv, [name]: value };
      assert.throws(() => loadWorkerConfig(), /invalid_campaign_planner_/i);
    }
    process.env = { ...originalEnv, CAMPAIGN_PLANNER_PROVIDER: "openai" };
    assert.throws(() => loadWorkerConfig(), /campaign_planner_provider_unavailable/);
    process.env = { ...originalEnv, CAMPAIGN_PLANNER_FAKE_MODE: "unknown" };
    assert.throws(() => loadWorkerConfig(), /invalid_campaign_planner_fake_mode/);
  } finally {
    process.env = originalEnv;
  }
});

maybeTest("graceful shutdown menghentikan polling tanpa mengambil job baru setelah abort", async () => {
  const controller = new AbortController();
  const loop = runPollingLoop(
    pool!,
    loadWorkerConfig({ workerId: "shutdown-worker", pollMs: 20 }),
    controller.signal
  );
  await sleep(50);
  controller.abort();
  await loop;
  assert.equal(controller.signal.aborted, true);
});
