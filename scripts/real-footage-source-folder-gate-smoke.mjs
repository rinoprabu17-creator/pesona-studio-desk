import { readFileSync } from "node:fs";
import {
  FakeContentEngineProvider,
  evaluateSourceFolderGateFixture,
  loadContentEngineRuntimeConfig,
  parseSourceFolderGateFixture
} from "../packages/content-engine/src/index.ts";

const fixturePath = "packages/content-engine/fixtures/source-folder-gate-smoke.json";
const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const fixture = parseSourceFolderGateFixture(JSON.parse(readFileSync(fixturePath, "utf8")));
const result = evaluateSourceFolderGateFixture(fixture);

const output = {
  provider: provider.providerName,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  fixture_path: fixturePath,
  gate_cases: result.gates.length,
  owner_approved_dry_run_count: result.ownerApprovedDryRunCount,
  manual_review_required_count: result.manualReviewRequiredCount,
  blocked_count: result.blockedCount,
  owner_approved_count: result.ownerApprovedCount,
  approval_record_found_count: result.approvalRecordFoundCount,
  allowlisted_source_count: result.allowlistedSourceCount,
  unsafe_source_count: result.unsafeSourceCount,
  scan_allowed_count: result.scanAllowedCount,
  file_open_allowed_count: result.fileOpenAllowedCount,
  decode_allowed_count: result.decodeAllowedCount,
  render_allowed_count: result.renderAllowedCount,
  upload_allowed_count: result.uploadAllowedCount,
  publish_allowed_count: result.publishAllowedCount,
  public_ready: false,
  public_ready_count: result.publicReadyCount,
  publish_track: result.publishTrack,
  gate_status_breakdown: {
    owner_approved_dry_run: result.ownerApprovedDryRunCount,
    manual_review_required: result.manualReviewRequiredCount,
    blocked: result.blockedCount
  },
  gate_summaries: result.gates.map((gate) => ({
    gate_id: gate.gate_id,
    source_root_allowlisted: gate.source_root_allowlisted,
    source_root_safe: gate.source_root_safe,
    owner_approved: gate.owner_approved,
    approval_record_found: gate.approval_record_found,
    gate_status: gate.gate_status,
    failed_checks: gate.failed_checks,
    blocking_reasons: gate.blocking_reasons,
    public_ready: gate.public_ready,
    publish_track: gate.publish_track
  })),
  no_real_path_access: true,
  next_phase: "Phase 2J.11 Real Footage Source Folder Approval Review"
};

if (
  output.provider !== "fake_content_engine" ||
  output.gate_cases < 5 ||
  output.owner_approved_dry_run_count < 1 ||
  output.blocked_count < 3 ||
  output.manual_review_required_count < 1 ||
  output.scan_allowed_count !== 0 ||
  output.file_open_allowed_count !== 0 ||
  output.decode_allowed_count !== 0 ||
  output.render_allowed_count !== 0 ||
  output.upload_allowed_count !== 0 ||
  output.publish_allowed_count !== 0 ||
  output.public_ready !== false ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked" ||
  output.no_real_path_access !== true
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_source_folder_gate_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
