import { readFileSync } from "node:fs";
import {
  FakeContentEngineProvider,
  loadContentEngineRuntimeConfig,
  parseAndReviewSourceFolderDraftManifestFixture
} from "../packages/content-engine/src/index.ts";

const fixturePath = "packages/content-engine/fixtures/source-folder-draft-manifest-review-smoke.json";
const approvalGateFixturePath = "packages/content-engine/fixtures/source-folder-metadata-enrichment-approval-gate-smoke.json";
const enrichmentFixturePath = "packages/content-engine/fixtures/source-folder-metadata-enrichment-review-smoke.json";
const listingReviewFixturePath = "packages/content-engine/fixtures/source-folder-listing-review-smoke.json";
const listingGateFixturePath = "packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json";
const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const result = parseAndReviewSourceFolderDraftManifestFixture({
  draftManifestReviewFixtureInput: JSON.parse(readFileSync(fixturePath, "utf8")),
  approvalGateFixtureInput: JSON.parse(readFileSync(approvalGateFixturePath, "utf8")),
  enrichmentFixtureInput: JSON.parse(readFileSync(enrichmentFixturePath, "utf8")),
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
  source_metadata_enrichment_approval_gate_fixture_path: approvalGateFixturePath,
  source_metadata_enrichment_fixture_path: enrichmentFixturePath,
  source_listing_review_fixture_path: listingReviewFixturePath,
  source_listing_gate_fixture_path: listingGateFixturePath,
  draft_manifest_review_cases: result.reviews.length,
  reviewed_approval_items: result.reviewedApprovalItems,
  manifest_preview_items: result.manifestPreviewItems,
  manifest_preview_ok_count: result.manifestPreviewOkCount,
  needs_owner_review_count: result.needsOwnerReviewCount,
  incomplete_manifest_count: result.incompleteManifestCount,
  blocked_manifest_count: result.blockedManifestCount,
  duplicate_id_count: result.duplicateIdCount,
  missing_required_field_count: result.missingRequiredFieldCount,
  metadata_write_allowed_count: result.metadataWriteAllowedCount,
  manifest_write_allowed_count: result.manifestWriteAllowedCount,
  manifest_file_created_count: result.manifestFileCreatedCount,
  recommended_owner_actions_count: result.recommendedOwnerActionsCount,
  manifest_preview_count_note: "manifest_preview_items can exceed reviewed_approval_items when the controlled fixture intentionally duplicates a suggested_footage_id to exercise duplicate-ID blocking.",
  public_ready: false,
  public_ready_count: result.publicReadyCount,
  publish_track: result.publishTrack,
  review_summaries: result.reviews.map((review) => ({
    draft_manifest_review_id: review.draft_manifest_review_id,
    source_id: review.source_id,
    approval_gate_status: review.approval_gate_status,
    reviewed_approval_items: review.reviewed_approval_items,
    manifest_preview_items: review.manifest_preview_items,
    manifest_ready_count: review.manifest_ready_count,
    needs_owner_review_count: review.needs_owner_review_count,
    incomplete_manifest_count: review.incomplete_manifest_count,
    blocked_manifest_count: review.blocked_manifest_count,
    duplicate_id_count: review.duplicate_id_count,
    missing_required_field_count: review.missing_required_field_count,
    metadata_write_allowed: review.metadata_write_allowed,
    manifest_write_allowed: review.manifest_write_allowed,
    manifest_file_created: review.manifest_file_created,
    public_ready: review.public_ready,
    publish_track: review.publish_track
  })),
  no_manifest_file_creation: true,
  no_manifest_import_export_or_write: true,
  no_metadata_import_or_write: true,
  next_phase: "Phase 2J.17 Real Footage Source Folder Draft Manifest Approval Gate"
};

if (
  output.provider !== "fake_content_engine" ||
  output.draft_manifest_review_cases < 1 ||
  output.reviewed_approval_items < 5 ||
  output.manifest_preview_items < 1 ||
  output.manifest_preview_ok_count < 1 ||
  (output.needs_owner_review_count < 1 && output.incomplete_manifest_count < 1) ||
  output.blocked_manifest_count < 1 ||
  output.metadata_write_allowed_count !== 0 ||
  output.manifest_write_allowed_count !== 0 ||
  output.manifest_file_created_count !== 0 ||
  output.public_ready !== false ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked" ||
  output.no_manifest_file_creation !== true ||
  output.no_manifest_import_export_or_write !== true ||
  output.no_metadata_import_or_write !== true
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_source_draft_manifest_review_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
