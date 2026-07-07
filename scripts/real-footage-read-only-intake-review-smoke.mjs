import {
  FakeContentEngineProvider,
  getReadOnlyIntakeSafeFixtureRoot,
  loadContentEngineRuntimeConfig,
  runReadOnlyIntakeReview
} from "../packages/content-engine/src/index.ts";

const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const fixtureRoot = getReadOnlyIntakeSafeFixtureRoot();
const result = runReadOnlyIntakeReview({ sourceRoot: fixtureRoot, projectRoot: process.cwd() });
const riskFlagCount = result.candidate_reviews.reduce((sum, review) => sum + review.risk_flags_guess.length, 0);
const missingMetadataFieldCount = result.candidate_reviews.reduce((sum, review) => sum + review.missing_fields.length, 0);

const output = {
  provider: provider.providerName,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  fixture_path: fixtureRoot,
  dry_run: result.dry_run,
  read_only: result.read_only,
  total_candidates: result.total_candidates,
  reviewed_candidates: result.reviewed_candidates,
  accepted_for_metadata_review: result.accepted_for_metadata_review,
  needs_manual_metadata: result.needs_manual_metadata,
  blocked_candidates: result.blocked_candidates,
  low_confidence_candidates: result.low_confidence_candidates,
  risk_flag_count: riskFlagCount,
  risk_summary: result.risk_summary,
  missing_metadata_field_count: missingMetadataFieldCount,
  missing_metadata_summary: result.missing_metadata_summary,
  recommended_manual_action_count: result.recommended_manual_actions.length,
  filename_signal_summary: result.filename_signal_summary,
  review_status_breakdown: {
    metadata_review_ok: result.accepted_for_metadata_review,
    needs_manual_metadata: result.needs_manual_metadata,
    blocked_candidate: result.blocked_candidates,
    low_confidence: result.low_confidence_candidates
  },
  public_ready: result.public_ready,
  public_ready_count: Number(result.public_ready),
  publish_track: result.publish_track,
  next_phase: "Phase 2J.10 Real Footage Owner-Approved Source Folder Gate"
};

if (
  output.provider !== "fake_content_engine" ||
  output.dry_run !== true ||
  output.read_only !== true ||
  output.total_candidates < 8 ||
  output.reviewed_candidates < 8 ||
  output.accepted_for_metadata_review < 3 ||
  output.needs_manual_metadata < 1 ||
  output.blocked_candidates < 1 ||
  output.public_ready !== false ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked"
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_read_only_intake_review_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
