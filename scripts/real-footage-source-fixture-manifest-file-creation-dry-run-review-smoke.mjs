import { readFileSync } from "node:fs";
import {
  FakeContentEngineProvider,
  loadContentEngineRuntimeConfig,
  parseAndReviewSourceFolderFixtureManifestFileCreationDryRunReviewFixture
} from "../packages/content-engine/src/index.ts";

const fixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-review-smoke.json";
const fileCreationGateFixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-gate-smoke.json";
const fileCreationApprovalGateFixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-write-dry-run-approval-gate-smoke.json";
const writeDryRunReviewFixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-write-dry-run-review-smoke.json";
const writeGateFixturePath = "packages/content-engine/fixtures/source-folder-fixture-manifest-write-gate-smoke.json";
const creationApprovalGateFixturePath =
  "packages/content-engine/fixtures/source-folder-draft-manifest-creation-dry-run-approval-gate-smoke.json";
const creationReviewFixturePath =
  "packages/content-engine/fixtures/source-folder-draft-manifest-creation-dry-run-review-smoke.json";
const creationGateFixturePath =
  "packages/content-engine/fixtures/source-folder-draft-manifest-creation-dry-run-gate-smoke.json";
const draftManifestApprovalGateFixturePath =
  "packages/content-engine/fixtures/source-folder-draft-manifest-approval-gate-smoke.json";
const draftManifestReviewFixturePath = "packages/content-engine/fixtures/source-folder-draft-manifest-review-smoke.json";
const metadataApprovalGateFixturePath =
  "packages/content-engine/fixtures/source-folder-metadata-enrichment-approval-gate-smoke.json";
const enrichmentFixturePath = "packages/content-engine/fixtures/source-folder-metadata-enrichment-review-smoke.json";
const listingReviewFixturePath = "packages/content-engine/fixtures/source-folder-listing-review-smoke.json";
const listingGateFixturePath = "packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json";

const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const result = parseAndReviewSourceFolderFixtureManifestFileCreationDryRunReviewFixture({
  fileCreationDryRunReviewFixtureInput: JSON.parse(readFileSync(fixturePath, "utf8")),
  fileCreationGateFixtureInput: JSON.parse(readFileSync(fileCreationGateFixturePath, "utf8")),
  fileCreationApprovalGateFixtureInput: JSON.parse(readFileSync(fileCreationApprovalGateFixturePath, "utf8")),
  writeDryRunReviewFixtureInput: JSON.parse(readFileSync(writeDryRunReviewFixturePath, "utf8")),
  writeGateFixtureInput: JSON.parse(readFileSync(writeGateFixturePath, "utf8")),
  creationApprovalGateFixtureInput: JSON.parse(readFileSync(creationApprovalGateFixturePath, "utf8")),
  creationReviewFixtureInput: JSON.parse(readFileSync(creationReviewFixturePath, "utf8")),
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
  source_file_creation_gate_fixture_path: fileCreationGateFixturePath,
  source_file_creation_approval_gate_fixture_path: fileCreationApprovalGateFixturePath,
  source_write_dry_run_review_fixture_path: writeDryRunReviewFixturePath,
  source_write_gate_fixture_path: writeGateFixturePath,
  source_creation_approval_gate_fixture_path: creationApprovalGateFixturePath,
  source_creation_review_fixture_path: creationReviewFixturePath,
  source_creation_gate_fixture_path: creationGateFixturePath,
  source_draft_manifest_approval_gate_fixture_path: draftManifestApprovalGateFixturePath,
  source_draft_manifest_review_fixture_path: draftManifestReviewFixturePath,
  source_metadata_enrichment_approval_gate_fixture_path: metadataApprovalGateFixturePath,
  source_metadata_enrichment_fixture_path: enrichmentFixturePath,
  source_listing_review_fixture_path: listingReviewFixturePath,
  source_listing_gate_fixture_path: listingGateFixturePath,
  fixture_manifest_file_creation_dry_run_review_cases: result.reviews.length,
  reviewed_file_creation_gate_items: result.reviewedFileCreationGateItems,
  file_creation_plan_items: result.fileCreationPlanItems,
  file_creation_plan_ok_count: result.fileCreationPlanOkCount,
  needs_owner_review_count: result.needsOwnerReviewCount,
  incomplete_file_creation_plan_count: result.incompleteFileCreationPlanCount,
  blocked_file_creation_plan_count: result.blockedFileCreationPlanCount,
  duplicate_id_count: result.duplicateIdCount,
  missing_required_field_count: result.missingRequiredFieldCount,
  blocked_reasons_count: result.blockedReasonsCount,
  denied_action_count: result.deniedActionCount,
  metadata_write_allowed_count: result.metadataWriteAllowedCount,
  manifest_write_allowed_count: result.manifestWriteAllowedCount,
  fixture_manifest_write_allowed: result.fixtureManifestWriteAllowed,
  fixture_manifest_write_allowed_count: result.fixtureManifestWriteAllowedCount,
  fixture_manifest_file_creation_gate_allowed: result.fixtureManifestFileCreationGateAllowed,
  fixture_manifest_file_creation_gate_allowed_count: result.fixtureManifestFileCreationGateAllowedCount,
  fixture_manifest_file_creation_dry_run_allowed: result.fixtureManifestFileCreationDryRunAllowed,
  fixture_manifest_file_creation_dry_run_allowed_count: result.fixtureManifestFileCreationDryRunAllowedCount,
  fixture_manifest_file_created_count: result.fixtureManifestFileCreatedCount,
  fixture_manifest_write_performed_count: result.fixtureManifestWritePerformedCount,
  fixture_manifest_file_creation_performed_count: result.fixtureManifestFileCreationPerformedCount,
  production_manifest_write_allowed_count: result.productionManifestWriteAllowedCount,
  manifest_export_allowed_count: result.manifestExportAllowedCount,
  recommended_owner_actions_count: result.recommendedOwnerActionsCount,
  in_memory_manifest_preview_count: result.reviews.filter((review) => review.in_memory_manifest_preview.preview_only).length,
  in_memory_manifest_preview_persisted_count: result.reviews.filter(
    (review) => review.in_memory_manifest_preview.persisted
  ).length,
  in_memory_manifest_preview_item_count: result.reviews.reduce(
    (total, review) => total + review.in_memory_manifest_preview.item_count,
    0
  ),
  public_ready: false,
  public_ready_count: result.publicReadyCount,
  publish_track: result.publishTrack,
  review_summaries: result.reviews.map((review) => ({
    fixture_manifest_file_creation_dry_run_review_id:
      review.fixture_manifest_file_creation_dry_run_review_id,
    source_id: review.source_id,
    source_file_creation_gate_status: review.source_file_creation_gate_status,
    reviewed_file_creation_gate_items: review.reviewed_file_creation_gate_items,
    file_creation_plan_items: review.file_creation_plan_items,
    file_creation_plan_ok: review.file_creation_plan_ok,
    needs_owner_review: review.needs_owner_review,
    incomplete_file_creation_plan: review.incomplete_file_creation_plan,
    blocked_file_creation_plan: review.blocked_file_creation_plan,
    duplicate_id_count: review.duplicate_id_count,
    missing_required_field_count: review.missing_required_field_count,
    in_memory_manifest_preview_persisted: review.in_memory_manifest_preview.persisted,
    in_memory_manifest_preview_items: review.in_memory_manifest_preview.item_count,
    fixture_manifest_write_allowed: review.fixture_manifest_write_allowed,
    fixture_manifest_file_creation_gate_allowed: review.fixture_manifest_file_creation_gate_allowed,
    fixture_manifest_file_creation_dry_run_allowed: review.fixture_manifest_file_creation_dry_run_allowed,
    metadata_write_allowed: review.metadata_write_allowed,
    manifest_write_allowed: review.manifest_write_allowed,
    fixture_manifest_file_created: review.fixture_manifest_file_created,
    fixture_manifest_write_performed: review.fixture_manifest_write_performed,
    fixture_manifest_file_creation_performed: review.fixture_manifest_file_creation_performed,
    production_manifest_write_allowed: review.production_manifest_write_allowed,
    manifest_export_allowed: review.manifest_export_allowed,
    public_ready: review.public_ready,
    publish_track: review.publish_track
  })),
  no_fixture_manifest_file_creation: true,
  no_fixture_manifest_write_performed: true,
  no_fixture_manifest_file_creation_performed: true,
  no_fixture_manifest_file_creation_gate_execution: true,
  no_draft_manifest_file_creation: true,
  no_production_manifest_file_creation_or_write: true,
  no_manifest_import_export_or_write: true,
  no_metadata_import_or_write: true,
  next_phase: "Phase 2J.26 Real Footage Source Folder Fixture Manifest File Creation Dry-Run Approval Gate"
};

if (
  output.provider !== "fake_content_engine" ||
  output.fixture_manifest_file_creation_dry_run_review_cases < 1 ||
  output.reviewed_file_creation_gate_items < 5 ||
  output.file_creation_plan_items < 1 ||
  output.file_creation_plan_ok_count < 1 ||
  output.needs_owner_review_count < 1 ||
  output.incomplete_file_creation_plan_count < 1 ||
  output.blocked_file_creation_plan_count < 1 ||
  output.duplicate_id_count < 1 ||
  output.metadata_write_allowed_count !== 0 ||
  output.manifest_write_allowed_count !== 0 ||
  output.fixture_manifest_file_creation_dry_run_allowed_count < 1 ||
  output.fixture_manifest_file_created_count !== 0 ||
  output.fixture_manifest_write_performed_count !== 0 ||
  output.fixture_manifest_file_creation_performed_count !== 0 ||
  output.production_manifest_write_allowed_count !== 0 ||
  output.manifest_export_allowed_count !== 0 ||
  output.in_memory_manifest_preview_count < 1 ||
  output.in_memory_manifest_preview_persisted_count !== 0 ||
  output.in_memory_manifest_preview_item_count < 1 ||
  output.public_ready !== false ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked" ||
  output.no_fixture_manifest_file_creation !== true ||
  output.no_fixture_manifest_write_performed !== true ||
  output.no_fixture_manifest_file_creation_performed !== true ||
  output.no_fixture_manifest_file_creation_gate_execution !== true ||
  output.no_draft_manifest_file_creation !== true ||
  output.no_production_manifest_file_creation_or_write !== true ||
  output.no_manifest_import_export_or_write !== true ||
  output.no_metadata_import_or_write !== true
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_source_fixture_manifest_file_creation_dry_run_review_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
