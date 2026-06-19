import { createWorkerPool, processNextRun, runPollingLoop } from "./worker.ts";
import { loadWorkerConfig } from "./lease.ts";

const pool = createWorkerPool();
const config = loadWorkerConfig();
const abortController = new AbortController();

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  abortController.abort();
  console.log(JSON.stringify({
    level: "info",
    service: "campaign-planner-worker",
    event: "shutdown",
    signal
  }));
  await pool.end();
}

process.once("SIGTERM", () => {
  shutdown("SIGTERM").catch(() => process.exit(1));
});

process.once("SIGINT", () => {
  shutdown("SIGINT").catch(() => process.exit(1));
});

async function main(): Promise<void> {
  if (process.env.CAMPAIGN_PLANNER_ONCE === "true") {
    const result = await processNextRun(pool, config);
    console.log(JSON.stringify({
      level: "info",
      service: "campaign-planner-worker",
      event: "once_complete",
      processed: result.processed,
      runId: result.runId,
      result: result.result
    }));
    await pool.end();
    return;
  }

  await runPollingLoop(pool, config, abortController.signal);
  if (!shuttingDown) {
    await pool.end();
  }
}

main().catch(async (error) => {
  console.error(JSON.stringify({
    level: "error",
    service: "campaign-planner-worker",
    event: "fatal",
    message: error instanceof Error ? error.message : "Worker fatal."
  }));
  await pool.end();
  process.exit(1);
});
