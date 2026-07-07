import {
  FakeContentEngineProvider,
  getReadOnlyIntakeSafeFixtureRoot,
  loadContentEngineRuntimeConfig,
  runReadOnlyIntakeDryRun
} from "../packages/content-engine/src/index.ts";

const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const fixtureRoot = getReadOnlyIntakeSafeFixtureRoot();
const result = runReadOnlyIntakeDryRun({ sourceRoot: fixtureRoot, projectRoot: process.cwd() });
const rejectedOrSkipped = result.rejected_entries + result.skipped_entries;

const output = {
  provider: provider.providerName,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  fixture_path: fixtureRoot,
  source_mode: result.source_mode,
  dry_run: result.dry_run,
  read_only: result.read_only,
  allowlisted_root: result.allowlisted_root,
  scanned_entries: result.scanned_entries,
  accepted_media_candidates: result.accepted_media_candidates,
  rejected_entries: result.rejected_entries,
  skipped_entries: result.skipped_entries,
  rejected_or_skipped_entries: rejectedOrSkipped,
  extension_breakdown: result.extension_breakdown,
  orientation_hint_breakdown: result.orientation_hint_breakdown,
  candidate_manifest_rows: result.candidate_manifest_rows.length,
  candidate_manifest_preview: result.candidate_manifest_rows.map((row) => ({
    footage_id: row.footage_id,
    filename: row.filename,
    extension: row.extension,
    product_family_guess: row.product_family_guess,
    process_stage_guess: row.process_stage_guess,
    orientation_hint: row.orientation_hint,
    risk_flags_guess: row.risk_flags_guess,
    usable_guess: row.usable_guess,
    duration_sec: row.duration_sec
  })),
  validation_error_count: result.validation_errors.length,
  safety_warning_count: result.safety_warnings.length,
  safety_warnings: result.safety_warnings,
  gate_status: result.gate_status,
  public_ready: result.public_ready,
  public_ready_count: Number(result.public_ready),
  publish_track: result.publish_track,
  no_media_decode: true,
  no_render_upload_publish: true,
  next_phase: "Phase 2J.9 Real Footage Read-Only Intake Review"
};

if (
  output.provider !== "fake_content_engine" ||
  output.dry_run !== true ||
  output.read_only !== true ||
  output.allowlisted_root !== true ||
  output.scanned_entries < 10 ||
  output.accepted_media_candidates < 8 ||
  output.rejected_or_skipped_entries < 3 ||
  output.candidate_manifest_rows < 8 ||
  output.public_ready !== false ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked" ||
  output.no_media_decode !== true ||
  output.no_render_upload_publish !== true
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_read_only_intake_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
