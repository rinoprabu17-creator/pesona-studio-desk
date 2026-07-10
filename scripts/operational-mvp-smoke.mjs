import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();

let closeDatabase = async () => {};

try {
  process.env.REAL_FOOTAGE_CONTENT_DIRECTOR_PROVIDER = process.env.REAL_FOOTAGE_CONTENT_DIRECTOR_PROVIDER || "mock";
  process.env.OPERATIONAL_FOOTAGE_SOURCE_DIR = process.env.OPERATIONAL_FOOTAGE_SOURCE_DIR || "packages/content-engine/fixtures/read-only-intake-sample";

  const db = await import("../apps/web/src/db.ts");
  closeDatabase = db.closeDatabase;
  const { runOperationalSmoke } = await import("../apps/web/src/operational-mvp-service.ts");
  const result = await runOperationalSmoke();
  console.log(JSON.stringify({
    status: "passed",
    campaign_items: result.campaign.content_items_created,
    footage_scanned: result.footage.scanned,
    video_job_status: result.video_result.status,
    video_job_id: result.video_job.id,
    mockup_status: result.mockup_result.status,
    mockup_output_path: result.mockup_result.output_path,
    lead_status: result.lead.status,
    summary: result.summary
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    status: "failed",
    error: error instanceof Error ? error.message : String(error)
  }, null, 2));
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
