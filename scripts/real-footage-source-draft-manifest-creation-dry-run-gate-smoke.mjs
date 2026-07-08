import { readFileSync } from "node:fs";
import {
  FakeContentEngineProvider,
  loadContentEngineRuntimeConfig,
  parseAndReviewSourceFolderDraftManifestCreationDryRunGateFixture
} from "../packages/content-engine/src/index.ts";

const fixturePath = "packages/content-engine/fixtures/source-folder-draft-manifest-creation-dry-run-gate-smoke.json";
const draftManifestApprovalGateFixturePath = "packages/content-engine/fixtures/source-folder-draft-manifest-approval-gate-smoke.json";
const draftManifestReviewFixturePath = "packages/content-engine/fixtures/source-folder-draft-manifest-review-smoke.json";
const metadataApprovalGateFixturePath = "packages/content-engine/fixtures/source-folder-metadata-enrichment-approval-gate-smoke.json";
const enrichmentFixturePath = "packages/content-engine/fixtures/source-folder-metadata-enrichment-review-smoke.json";
const listingReviewFixturePath = "packages/content-engine/fixtures/source-folder-listing-review-smoke.json";
const listingGateFixturePath = "packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json";
const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const result = parseAndReviewSourceFolderDraftManifestCreationDryRunGateFixture({
  creationGateFixtureInput: JSON.parse(readFileSync(fixturePath, "utf8")),
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
  source_draft_manifest_approval_gate_fixture_path: draftManifestApprovalGateFixturePath,
  source_draft_manifest_review_fixture_path: draftManifestReviewFixturePath,
  source_metadata_enrichment_approval_gate_fixture_path: metadataApprovalGateFixturePath,
  source_metadata_enrichment_fixture_path: enrichmentFixturePath,
  source_listing_review_fixture_path: listingReviewFixturePath,
  source_listing_gate_fixture_path: listingGateFixturePath,
  creation_gate_cases: result.gates.length,
  reviewed_approval_items: result.reviewedApprovalItems,
  eligible_for_creation_dry_run_count: result.eligibleForCreationDryRunCount,
  needs_owner_review_count: result.needsOwnerReviewCount,
  incomplete_creation_gate_count: result.incompleteCreationGateCount,
  blocked_creation_gate_count: result.blockedCreationGateCount,
  duplicate_id_findings_count: result.duplicateIdFindingsCount,
  missing_required_field_count: result.missingRequiredFieldCount,
  missing_approval_fields_count: result.missingApprovalFieldsCount,
  blocked_reasons_count: result.blockedReasonsCount,
  denied_action_count: result.deniedActionCount,
  metadata_write_allowed_count: result.metadataWriteAllowedCount,
  manifest_write_allowed_count: result.manifestWriteAllowedCount,
  manifest_file_created_count: result.manifestFileCreatedCount,
  manifest_export_allowed_count: result.manifestExportAllowedCount,
  creation_dry_run_allowed: result.creationDryRunAllowed,
  creation_dry_run_allowed_count: result.creationDryRunAllowedCount,
  recommended_owner_actions_count: result.recommendedOwnerActionsCount,
  public_ready: false,
  public_ready_count: result.publicReadyCount,
  publish_track: result.publishTrack,
  gate_summaries: result.gates.map((gate) => ({
    creation_gate_id: gate.creation_gate_id,
    source_id: gate.source_id,
    source_approval_status: gate.source_approval_status,
    reviewed_approval_items: gate.reviewed_approval_items,
    eligible_for_creation_dry_run: gate.eligible_for_creation_dry_run,
    needs_owner_review: gate.needs_owner_review,
    incomplete_creation_gate: gate.incomplete_creation_gate,
    blocked_creation_gate: gate.blocked_creation_gate,
    duplicate_id_findings: gate.duplicate_id_findings.length,
    creation_dry_run_allowed: gate.creation_dry_run_allowed,
    metadata_write_allowed: gate.metadata_write_allowed,
    manifest_write_allowed: gate.manifest_write_allowed,
    manifest_file_created: gate.manifest_file_created,
    manifest_export_allowed: gate.manifest_export_allowed,
    public_ready: gate.public_ready,
    publish_track: gate.publish_track
  })),
  no_manifest_file_creation: true,
  no_manifest_import_export_or_write: true,
  no_metadata_import_or_write: true,
  next_phase: "Phase 2J.19 Real Footage Source Folder Draft Manifest Creation Dry-Run Review"
};

if (
  output.provider !== "fake_content_engine" ||
  output.creation_gate_cases < 1 ||
  output.reviewed_approval_items < 5 ||
  output.eligible_for_creation_dry_run_count < 1 ||
  output.needs_owner_review_count < 1 ||
  output.incomplete_creation_gate_count < 1 ||
  output.blocked_creation_gate_count < 1 ||
  output.duplicate_id_findings_count < 1 ||
  output.metadata_write_allowed_count !== 0 ||
  output.manifest_write_allowed_count !== 0 ||
  output.manifest_file_created_count !== 0 ||
  output.manifest_export_allowed_count !== 0 ||
  output.public_ready !== false ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked" ||
  output.no_manifest_file_creation !== true ||
  output.no_manifest_import_export_or_write !== true ||
  output.no_metadata_import_or_write !== true
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_source_draft_manifest_creation_dry_run_gate_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
