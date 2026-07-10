import { closeDatabase } from "../../../apps/web/src/db.ts";
import { processOneOperationalVideoJob } from "../../../apps/web/src/operational-mvp-service.ts";

const config = {
  name: "video-worker",
  queueName: "ops:video-render",
  storageDir: process.env.APP_STORAGE_DIR || "/app/storage",
  redisUrl: process.env.REDIS_URL || "redis://redis:6379",
  databaseUrl: process.env.DATABASE_URL || "postgresql://pesona:pesona_dev_password@postgres:5432/pesona_studio",
  intervalMs: Number(process.env.VIDEO_WORKER_POLL_INTERVAL_MS || "5000"),
  once: process.env.VIDEO_WORKER_ONCE === "true"
};

function log(event: string, details: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ level: "info", service: config.name, event, queue: config.queueName, ...details }));
}

async function processJob(): Promise<void> {
  const result = await processOneOperationalVideoJob();
  log("poll", result);
  if (config.once) {
    clearInterval(heartbeat);
    await closeDatabase();
    process.exit(result.processed && result.status === "failed" ? 1 : 0);
  }
}

log("started", {
  storageDir: config.storageDir,
  redisConfigured: Boolean(config.redisUrl),
  databaseConfigured: Boolean(config.databaseUrl)
});

const heartbeat = setInterval(() => {
  processJob().catch((error) => log("job_error", { error: error instanceof Error ? error.message : String(error) }));
}, config.intervalMs);

await processJob();

async function shutdown(signal: string): Promise<void> {
  log("shutdown", { signal });
  clearInterval(heartbeat);
  await closeDatabase();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
