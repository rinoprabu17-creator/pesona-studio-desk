import pg from "pg";
import { loadWorkerConfig } from "./lease.ts";
import type { CampaignPlannerWorkerConfig } from "./lease.ts";
import { LostWorkerLeaseError, processClaimedRun } from "./run-processor.ts";

const { Pool } = pg;

export function createWorkerPool(): pg.Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL belum diset.");
  }
  return new Pool({ connectionString: databaseUrl, max: 5 });
}

async function recoverStaleRuns(client: pg.PoolClient, config: CampaignPlannerWorkerConfig): Promise<void> {
  await client.query(
    `UPDATE campaign_plan_generation_batches
     SET status = CASE WHEN attempt_count < $1 THEN 'queued' ELSE 'failed' END,
         next_attempt_at = CASE WHEN attempt_count < $1 THEN now() ELSE next_attempt_at END,
         error_code = CASE WHEN attempt_count < $1 THEN error_code ELSE 'stale_batch_lease_exhausted' END,
         error_message = CASE WHEN attempt_count < $1 THEN error_message ELSE 'Batch lease expired terlalu sering.' END,
         claimed_at = NULL,
         claimed_by = NULL,
         heartbeat_at = NULL,
         lease_expires_at = NULL,
         updated_at = now()
     WHERE status = 'generating' AND lease_expires_at < now()`,
    [config.maxAttempts]
  );

  await client.query(
    `UPDATE campaign_plan_runs
     SET status = CASE WHEN attempt_count < $1 THEN 'queued' ELSE 'failed' END,
         next_attempt_at = CASE WHEN attempt_count < $1 THEN now() ELSE next_attempt_at END,
         error_code = CASE WHEN attempt_count < $1 THEN error_code ELSE 'stale_worker_lease_exhausted' END,
         error_message = CASE WHEN attempt_count < $1 THEN error_message ELSE 'Worker lease expired terlalu sering.' END,
         claimed_at = NULL,
         claimed_by = NULL,
         heartbeat_at = NULL,
         lease_expires_at = NULL,
         completed_at = CASE WHEN attempt_count < $1 THEN completed_at ELSE COALESCE(completed_at, now()) END,
         updated_at = now()
     WHERE status = 'generating' AND lease_expires_at < now()`,
    [config.maxAttempts]
  );
}

export async function recoverStaleJobs(pool: pg.Pool, config = loadWorkerConfig()): Promise<void> {
  const client = await pool.connect();
  try {
    await recoverStaleRuns(client, config);
  } finally {
    client.release();
  }
}

export async function claimNextRun(pool: pg.Pool, config = loadWorkerConfig()): Promise<any | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const candidate = await client.query(
      `SELECT *
       FROM campaign_plan_runs
       WHERE status = 'queued'
         AND (next_attempt_at IS NULL OR next_attempt_at <= now())
       ORDER BY created_at
       FOR UPDATE SKIP LOCKED
       LIMIT 1`
    );
    const run = candidate.rows[0];
    if (!run) {
      await client.query("COMMIT");
      return null;
    }

    const claimed = await client.query(
      `UPDATE campaign_plan_runs
       SET status = 'generating',
           attempt_count = attempt_count + 1,
           claimed_at = now(),
           claimed_by = $2,
           heartbeat_at = now(),
           lease_expires_at = now() + ($3::text || ' seconds')::interval,
           started_at = COALESCE(started_at, now()),
           updated_at = now()
       WHERE id = $1 AND status = 'queued'
       RETURNING *`,
      [run.id, config.workerId, config.leaseSeconds]
    );
    await client.query("COMMIT");
    return claimed.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function processNextRun(pool: pg.Pool, config = loadWorkerConfig()): Promise<{ processed: boolean; runId: string | null; result: string }> {
  await recoverStaleJobs(pool, config);
  const run = await claimNextRun(pool, config);
  if (!run) {
    return { processed: false, runId: null, result: "none" };
  }

  const client = await pool.connect();
  try {
    const result = await processClaimedRun(client, run, config);
    return { processed: true, runId: run.id, result };
  } catch (error: any) {
    if (error instanceof LostWorkerLeaseError) {
      return { processed: true, runId: run.id, result: "lost_lease" };
    }
    const failed = await client.query(
      `UPDATE campaign_plan_runs
       SET status = 'failed',
           error_code = 'campaign_plan_worker_failed',
           error_message = $2,
           claimed_at = NULL,
           claimed_by = NULL,
           heartbeat_at = NULL,
           lease_expires_at = NULL,
           completed_at = now(),
           updated_at = now()
       WHERE id = $1
         AND status = 'generating'
         AND claimed_by = $3
         AND attempt_count = $4`,
      [
        run.id,
        String(error?.message || "Worker gagal.").replace(/postgresql:\/\/\S+/gi, "[database-url]").slice(0, 500),
        run.claimed_by,
        Number(run.attempt_count)
      ]
    );
    return { processed: true, runId: run.id, result: failed.rowCount === 1 ? "failed" : "lost_lease" };
  } finally {
    client.release();
  }
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      resolve();
    }, { once: true });
  });
}

export async function runPollingLoop(pool = createWorkerPool(), config = loadWorkerConfig(), signal?: AbortSignal): Promise<void> {
  console.log(JSON.stringify({
    level: "info",
    service: "campaign-planner-worker",
    event: "started",
    workerId: config.workerId,
    pollMs: config.pollMs
  }));

  while (!signal?.aborted) {
    try {
      await processNextRun(pool, config);
    } catch (error: any) {
      console.error(JSON.stringify({
        level: "error",
        service: "campaign-planner-worker",
        event: "poll_failed",
        message: String(error?.message || "Worker poll gagal.").slice(0, 500)
      }));
    }
    await wait(config.pollMs, signal);
  }
}
