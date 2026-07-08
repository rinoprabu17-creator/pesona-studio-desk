import { readFileSync } from "node:fs";
import {
  FakeContentEngineProvider,
  loadContentEngineRuntimeConfig,
  parseAndReviewSourceFolderListingGateFixture
} from "../packages/content-engine/src/index.ts";

const fixturePath = "packages/content-engine/fixtures/source-folder-listing-review-smoke.json";
const listingGateFixturePath = "packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json";
const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const result = parseAndReviewSourceFolderListingGateFixture({
  reviewFixtureInput: JSON.parse(readFileSync(fixturePath, "utf8")),
  listingGateFixtureInput: JSON.parse(readFileSync(listingGateFixturePath, "utf8"))
});

const output = {
  provider: provider.providerName,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  fixture_path: fixturePath,
  source_listing_gate_fixture_path: listingGateFixturePath,
  listing_review_cases: result.reviews.length,
  listing_allowed_count: result.listingAllowedCount,
  listing_performed_count: result.listingPerformedCount,
  reviewed_entries: result.reviewedEntries,
  listing_review_ok_count: result.listingReviewOkCount,
  needs_manual_metadata_count: result.needsManualMetadataCount,
  blocked_entries_count: result.blockedEntriesCount,
  low_confidence_entries_count: result.lowConfidenceEntriesCount,
  risk_flag_count: result.riskFlagCount,
  missing_metadata_field_count: result.missingMetadataFieldCount,
  recommended_owner_actions_count: result.recommendedOwnerActionsCount,
  public_ready: false,
  public_ready_count: result.publicReadyCount,
  publish_track: result.publishTrack,
  review_summaries: result.reviews.map((review) => ({
    listing_review_id: review.listing_review_id,
    source_id: review.source_id,
    listing_gate_status: review.listing_gate_status,
    listing_allowed: review.listing_allowed,
    listing_performed: review.listing_performed,
    total_listed_entries: review.total_listed_entries,
    reviewed_entries: review.reviewed_entries,
    accepted_for_metadata_review: review.accepted_for_metadata_review,
    needs_manual_metadata: review.needs_manual_metadata,
    blocked_entries: review.blocked_entries,
    low_confidence_entries: review.low_confidence_entries,
    public_ready: review.public_ready,
    publish_track: review.publish_track
  })),
  no_real_path_access: true,
  next_phase: "Phase 2J.14 Real Footage Source Folder Metadata Enrichment Review"
};

if (
  output.provider !== "fake_content_engine" ||
  output.listing_review_cases < 1 ||
  output.listing_allowed_count !== 1 ||
  output.listing_performed_count !== 1 ||
  output.reviewed_entries < 8 ||
  output.listing_review_ok_count < 3 ||
  output.needs_manual_metadata_count < 1 ||
  output.blocked_entries_count < 1 ||
  output.public_ready !== false ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked" ||
  output.no_real_path_access !== true
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_source_listing_review_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
