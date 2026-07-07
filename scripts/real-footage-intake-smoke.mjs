import { fileURLToPath } from "node:url";
import { dirname, resolve, relative } from "node:path";
import {
  FakeContentEngineProvider,
  buildSmokeInputFromFootageRows,
  loadContentEngineRuntimeConfig,
  loadFootageIntakeManifest
} from "../packages/content-engine/src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(__dirname, "../packages/content-engine/fixtures/real-footage-intake-smoke.json");
const intake = loadFootageIntakeManifest(fixturePath);
const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const smokeInput = buildSmokeInputFromFootageRows(intake.usableRows);
const result = await provider.generateSmoke(smokeInput);

const output = {
  provider: result.provider_name,
  model: result.model_name,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  source_fixture_path: relative(process.cwd(), fixturePath),
  total_footage_rows: intake.summary.total_rows,
  usable_footage_rows: intake.summary.usable_rows,
  blocked_footage_rows: intake.summary.blocked_rows,
  missing_required_fields: intake.summary.missing_required_fields,
  orientation_breakdown: intake.summary.orientation_breakdown,
  product_family_breakdown: intake.summary.product_family_breakdown,
  risk_flag_breakdown: intake.summary.risk_flag_breakdown,
  metadata_rows_produced: result.footage_metadata.length,
  selections_produced: result.footage_selection.length,
  draft_plan_scenes_produced: result.video_draft_plan.scenes.length,
  public_ready: result.review.public_ready,
  publish_track: "blocked",
  next_phase: "Phase 2J.3 Real Footage Script-To-Draft Plan Batch Review"
};

if (
  output.total_footage_rows < 10 ||
  output.usable_footage_rows < 5 ||
  output.selections_produced < 3 ||
  output.draft_plan_scenes_produced < 3 ||
  output.public_ready !== false ||
  output.publish_track !== "blocked"
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_intake_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
