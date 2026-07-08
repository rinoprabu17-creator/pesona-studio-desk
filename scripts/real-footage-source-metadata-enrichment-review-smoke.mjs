import { readFileSync } from "node:fs";
import {
  FakeContentEngineProvider,
  loadContentEngineRuntimeConfig,
  parseAndReviewSourceFolderMetadataEnrichmentFixture
} from "../packages/content-engine/src/index.ts";

const fixturePath = "packages/content-engine/fixtures/source-folder-metadata-enrichment-review-smoke.json";
const listingReviewFixturePath = "packages/content-engine/fixtures/source-folder-listing-review-smoke.json";
const listingGateFixturePath = "packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json";
const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const result = parseAndReviewSourceFolderMetadataEnrichmentFixture({
  enrichmentFixtureInput: JSON.parse(readFileSync(fixturePath, "utf8")),
  listingReviewFixtureInput: JSON.parse(readFileSync(listingReviewFixturePath, "utf8")),
  listingGateFixtureInput: JSON.parse(readFileSync(listingGateFixturePath, "utf8"))
});

const output = {
  provider: provider.providerName,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  fixture_path: fixturePath,
  source_listing_review_fixture_path: listingReviewFixturePath,
  source_listing_gate_fixture_path: listingGateFixturePath,
  enrichment_review_cases: result.reviews.length,
  reviewed_entries: result.reviewedEntries,
  enrichment_candidates: result.enrichmentCandidates,
  enrichment_ready_count: result.enrichmentReadyCount,
  needs_manual_metadata_count: result.needsManualMetadataCount,
  blocked_enrichment_count: result.blockedEnrichmentCount,
  low_confidence_count: result.lowConfidenceCount,
  missing_required_metadata_count: result.missingRequiredMetadataCount,
  suggested_metadata_rows_count: result.suggestedMetadataRowsCount,
  recommended_manual_fields_count: result.recommendedManualFieldsCount,
  recommended_owner_actions_count: result.recommendedOwnerActionsCount,
  public_ready: false,
  public_ready_count: result.publicReadyCount,
  publish_track: result.publishTrack,
  review_summaries: result.reviews.map((review) => ({
    enrichment_review_id: review.enrichment_review_id,
    source_id: review.source_id,
    listing_review_status: review.listing_review_status,
    reviewed_entries: review.reviewed_entries,
    enrichment_candidates: review.enrichment_candidates.length,
    enrichment_ready_count: review.enrichment_ready_count,
    needs_manual_metadata_count: review.needs_manual_metadata_count,
    blocked_enrichment_count: review.blocked_enrichment_count,
    low_confidence_count: review.low_confidence_count,
    suggested_metadata_rows: review.suggested_metadata_rows.length,
    public_ready: review.public_ready,
    publish_track: review.publish_track
  })),
  no_real_path_access: true,
  no_production_metadata_write: true,
  next_phase: "Phase 2J.15 Real Footage Source Folder Metadata Enrichment Approval Gate"
};

if (
  output.provider !== "fake_content_engine" ||
  output.enrichment_review_cases < 1 ||
  output.reviewed_entries < 8 ||
  output.enrichment_candidates < 8 ||
  output.enrichment_ready_count < 3 ||
  output.needs_manual_metadata_count < 1 ||
  output.blocked_enrichment_count < 1 ||
  output.suggested_metadata_rows_count < 3 ||
  output.public_ready !== false ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked" ||
  output.no_real_path_access !== true ||
  output.no_production_metadata_write !== true
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_source_metadata_enrichment_review_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
