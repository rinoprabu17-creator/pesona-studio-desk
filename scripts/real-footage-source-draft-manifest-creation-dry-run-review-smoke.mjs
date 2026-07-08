import { readFileSync } from "node:fs";
import {
  FakeContentEngineProvider,
  loadContentEngineRuntimeConfig,
  parseAndReviewSourceFolderDraftManifestCreationDryRunReviewFixture
} from "../packages/content-engine/src/index.ts";

const fixturePath = "packages/content-engine/fixtures/source-folder-draft-manifest-creation-dry-run-review-smoke.json";
const creationGateFixturePath = "packages/content-engine/fixtures/source-folder-draft-manifest-creation-dry-run-gate-smoke.json";
const draftManifestApprovalGateFixturePath = "packages/content-engine/fixtures/source-folder-draft-manifest-approval-gate-smoke.json";
const draftManifestReviewFixturePath = "packages/content-engine/fixtures/source-folder-draft-manifest-review-smoke.json";
const metadataApprovalGateFixturePath = "packages/content-engine/fixtures/source-folder-metadata-enrichment-approval-gate-smoke.json";
const enrichmentFixturePath = "packages/content-engine/fixtures/source-folder-metadata-enrichment-review-smoke.json";
const listingReviewFixturePath = "packages/content-engine/fixtures/source-folder-listing-review-smoke.json";
const listingGateFixturePath = "packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json";
const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const result = parseAndReviewSourceFolderDraftManifestCreationDryRunReviewFixture({
  creationReviewFixtureInput: JSON.parse(readFileSync(fixturePath, "utf8")),
  creationGateFixtureInput: JSON.parse(readFileSync(creationGateFixturePath, "utf8")),
  draftManifestApprovalGateFixtureInput: JSON.parse(readFileSync(draftManifestApprovalGateFixturePath, "utf8")),
  draftManifestReviewFixtureInput: JSON.parse(readFileSync(draftManifestReviewFixturePath, "utf8")),
  metadataEnrichmentApprovalGateFixtureInput: JSON.parse(readFileSync(metadataApprovalGateFixturePath, "utf8")),
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
  source_creation_gate_fixture_path: creationGateFixturePath,
  source_draft_manifest_approval_gate_fixture_path: draftManifestApprovalGateFixturePath,
  source_draft_manifest_review_fixture_path: draftManifestReviewFixturePath,
  source_metadata_enrichment_approval_gate_fixture_path: metadataApprovalGateFixturePath,
  source_metadata_enrichment_fixture_path: enrichmentFixturePath,
  source_listing_review_fixture_path: listingReviewFixturePath,
  source_listing_gate_fixture_path: listingGateFixturePath,
  creation_review_cases: result.reviews.length,
  reviewed_gate_items: result.reviewedGateItems,
  dry_run_manifest_preview_items: result.dryRunManifestPreviewItems,
  dry_run_preview_ok_count: result.dryRunPreviewOkCount,
  needs_owner_review_count: result.needsOwnerReviewCount,
  incomplete_dry_run_count: result.incompleteDryRunCount,
  blocked_dry_run_count: result.blockedDryRunCount,
  duplicate_id_count: result.duplicateIdCount,
  missing_required_field_count: result.missingRequiredFieldCount,
  blocked_reasons_count: result.blockedReasonsCount,
  metadata_write_allowed_count: result.metadataWriteAllowedCount,
  manifest_write_allowed_count: result.manifestWriteAllowedCount,
  manifest_file_created_count: result.manifestFileCreatedCount,
  manifest_export_allowed_count: result.manifestExportAllowedCount,
  creation_dry_run_performed_count: result.creationDryRunPerformedCount,
  recommended_owner_actions_count: result.recommendedOwnerActionsCount,
  public_ready: false,
  public_ready_count: result.publicReadyCount,
  publish_track: result.publishTrack,
  review_summaries: result.reviews.map((review) => ({
    creation_review_id: review.creation_review_id,
    source_id: review.source_id,
    creation_gate_status: review.creation_gate_status,
    reviewed_gate_items: review.reviewed_gate_items,
    dry_run_manifest_preview_items: review.dry_run_manifest_preview_items,
    dry_run_preview_ok: review.dry_run_preview_ok,
    needs_owner_review: review.needs_owner_review,
    incomplete_dry_run: review.incomplete_dry_run,
    blocked_dry_run: review.blocked_dry_run,
    duplicate_id_count: review.duplicate_id_count,
    creation_dry_run_performed: review.creation_dry_run_performed,
    metadata_write_allowed: review.metadata_write_allowed,
    manifest_write_allowed: review.manifest_write_allowed,
    manifest_file_created: review.manifest_file_created,
    manifest_export_allowed: review.manifest_export_allowed,
    public_ready: review.public_ready,
    publish_track: review.publish_track
  })),
  no_manifest_file_creation: true,
  no_fixture_manifest_file_creation: true,
  no_manifest_import_export_or_write: true,
  no_metadata_import_or_write: true,
  next_phase: "Phase 2J.20 Real Footage Source Folder Draft Manifest Creation Dry-Run Approval Gate"
};

if (
  output.provider !== "fake_content_engine" ||
  output.reviewed_gate_items < 5 ||
  output.dry_run_manifest_preview_items < 1 ||
  output.dry_run_preview_ok_count < 1 ||
  output.needs_owner_review_count < 1 ||
  output.incomplete_dry_run_count < 1 ||
  output.blocked_dry_run_count < 1 ||
  output.duplicate_id_count < 1 ||
  output.metadata_write_allowed_count !== 0 ||
  output.manifest_write_allowed_count !== 0 ||
  output.manifest_file_created_count !== 0 ||
  output.manifest_export_allowed_count !== 0 ||
  output.public_ready !== false ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked" ||
  output.no_manifest_file_creation !== true ||
  output.no_fixture_manifest_file_creation !== true ||
  output.no_manifest_import_export_or_write !== true ||
  output.no_metadata_import_or_write !== true
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_source_draft_manifest_creation_dry_run_review_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
