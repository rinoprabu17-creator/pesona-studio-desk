export {};

type WorkerConfig = {
  name: string;
  queueName: string;
  storageDir: string;
  redisUrl: string;
  databaseUrl: string;
  intervalMs: number;
};

const config: WorkerConfig = {
  name: "video-worker",
  queueName: "video-render",
  storageDir: process.env.APP_STORAGE_DIR || "/app/storage",
  redisUrl: process.env.REDIS_URL || "redis://redis:6379",
  databaseUrl: process.env.DATABASE_URL || "postgresql://pesona:pesona_dev_password@postgres:5432/pesona_studio",
  intervalMs: Number(process.env.VIDEO_WORKER_POLL_INTERVAL_MS || "15000")
};

function log(event: string, details: Record<string, unknown> = {}): void {
  console.log(
    JSON.stringify({
      level: "info",
      service: config.name,
      event,
      queue: config.queueName,
      ...details
    })
  );
}

log("started", {
  storageDir: config.storageDir,
  redisConfigured: Boolean(config.redisUrl),
  databaseConfigured: Boolean(config.databaseUrl)
});

const heartbeat = setInterval(() => {
  log("heartbeat", {
    message: "Placeholder aktif. Render video belum diimplementasikan."
  });
}, config.intervalMs);

function shutdown(signal: string): void {
  log("shutdown", { signal });
  clearInterval(heartbeat);
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
