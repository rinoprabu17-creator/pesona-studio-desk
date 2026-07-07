import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, relative, resolve } from "node:path";
import {
  evaluateIntakeDryRunGateFixture,
  FakeContentEngineProvider,
  loadContentEngineRuntimeConfig,
  parseIntakeDryRunGateFixture
} from "../packages/content-engine/src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(__dirname, "../packages/content-engine/fixtures/real-footage-intake-dry-run-gate-smoke.json");
const fixtureRelativePath = relative(process.cwd(), fixturePath);
const fixture = parseIntakeDryRunGateFixture(JSON.parse(readFileSync(fixturePath, "utf8")));
const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const result = evaluateIntakeDryRunGateFixture(fixture);

const output = {
  provider: provider.providerName,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  fixture_path: fixtureRelativePath,
  gate_cases: result.gates.length,
  dry_run_allowed_count: result.dryRunAllowedCount,
  blocked_count: result.blockedCount,
  manual_review_required_count: result.manualReviewRequiredCount,
  failed_check_count: result.failedCheckCount,
  blocking_reason_count: result.blockingReasonCount,
  media_scan_allowed_count: result.mediaScanAllowedCount,
  media_open_allowed_count: result.mediaOpenAllowedCount,
  render_allowed_count: result.renderAllowedCount,
  upload_allowed_count: result.uploadAllowedCount,
  publish_allowed_count: result.publishAllowedCount,
  public_ready_count: result.publicReadyCount,
  publish_track: result.publishTrack,
  gate_status_breakdown: {
    dry_run_allowed: result.dryRunAllowedCount,
    blocked: result.blockedCount,
    manual_review_required: result.manualReviewRequiredCount
  },
  gate_summaries: result.gates.map((gate) => ({
    gate_id: gate.gate_id,
    source_mode: gate.source_mode,
    gate_status: gate.gate_status,
    gate_score: gate.gate_score,
    failed_checks: gate.failed_checks,
    blocking_reasons: gate.blocking_reasons,
    public_ready: gate.public_ready,
    publish_track: gate.publish_track
  })),
  next_phase: "Phase 2J.8 Real Footage Read-Only Intake Dry-Run"
};

if (
  output.provider !== "fake_content_engine" ||
  output.gate_cases < 4 ||
  output.dry_run_allowed_count < 1 ||
  output.blocked_count < 2 ||
  output.manual_review_required_count < 1 ||
  output.media_scan_allowed_count !== 0 ||
  output.media_open_allowed_count !== 0 ||
  output.render_allowed_count !== 0 ||
  output.upload_allowed_count !== 0 ||
  output.publish_allowed_count !== 0 ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked"
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_intake_dry_run_gate_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
