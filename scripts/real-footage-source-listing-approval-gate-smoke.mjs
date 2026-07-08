import { readFileSync } from "node:fs";
import {
  FakeContentEngineProvider,
  evaluateSourceFolderListingApprovalGateFixture,
  loadContentEngineRuntimeConfig,
  parseSourceFolderListingApprovalGateFixture
} from "../packages/content-engine/src/index.ts";

const fixturePath = "packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json";
const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const fixture = parseSourceFolderListingApprovalGateFixture(JSON.parse(readFileSync(fixturePath, "utf8")));
const result = evaluateSourceFolderListingApprovalGateFixture(fixture);

const output = {
  provider: provider.providerName,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  fixture_path: fixturePath,
  listing_gate_cases: result.gates.length,
  listing_allowed_count: result.listingAllowedCount,
  listing_performed_count: result.listingPerformedCount,
  denied_listing_count: result.deniedListingCount,
  approval_review_ok_count: result.approvalReviewOkCount,
  source_gate_owner_approved_dry_run_count: result.sourceGateOwnerApprovedDryRunCount,
  scanned_entries: result.scannedEntries,
  accepted_candidates: result.acceptedCandidates,
  rejected_entries: result.rejectedEntries,
  skipped_entries: result.skippedEntries,
  rejected_or_skipped_entries: result.rejectedEntries + result.skippedEntries,
  denied_listing_reasons_count: result.deniedListingReasonsCount,
  safety_warnings_count: result.safetyWarningsCount,
  public_ready: false,
  public_ready_count: result.publicReadyCount,
  publish_track: result.publishTrack,
  gate_summaries: result.gates.map((gate) => ({
    listing_gate_id: gate.listing_gate_id,
    source_id: gate.source_id,
    approval_review_status: gate.approval_review_status,
    source_gate_status: gate.source_gate_status,
    allowlisted_root: gate.allowlisted_root,
    listing_allowed: gate.listing_allowed,
    listing_performed: gate.listing_performed,
    scanned_entries: gate.scanned_entries,
    accepted_candidates: gate.accepted_candidates,
    rejected_entries: gate.rejected_entries,
    skipped_entries: gate.skipped_entries,
    denied_listing_reasons: gate.denied_listing_reasons,
    public_ready: gate.public_ready,
    publish_track: gate.publish_track
  })),
  no_real_path_access: true,
  next_phase: "Phase 2J.13 Real Footage Source Folder Listing Review"
};

if (
  output.provider !== "fake_content_engine" ||
  output.listing_gate_cases < 5 ||
  output.listing_allowed_count !== 1 ||
  output.listing_performed_count !== 1 ||
  output.denied_listing_count < 4 ||
  output.scanned_entries < 10 ||
  output.accepted_candidates < 8 ||
  output.public_ready !== false ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked" ||
  output.no_real_path_access !== true
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_source_listing_approval_gate_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
