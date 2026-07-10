import { readFileSync } from "node:fs";
import {
  FakeContentEngineProvider,
  loadContentEngineRuntimeConfig,
  parseAndReviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFollowUpReviewApprovalGateFixture
} from "../packages/content-engine/src/index.ts";

const fixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-approval-review-follow-up-review-approval-gate-smoke.json";
const followUpReviewFixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-approval-review-follow-up-review-smoke.json";
const executionGateApprovalReviewApprovalGateFixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-approval-review-approval-gate-smoke.json";
const executionGateApprovalReviewFixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-approval-review-smoke.json";
const executionGateReviewApprovalGateFixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-review-approval-gate-smoke.json";
const executionGateReviewFixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-review-smoke.json";
const executionReviewApprovalGateFixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-review-approval-gate-smoke.json";
const executionReviewFixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-review-smoke.json";
const executionGateFixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-smoke.json";
const fileCreationDryRunApprovalGateFixturePath =
  "packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-approval-gate-smoke.json";
const fileCreationDryRunReviewFixturePath =
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
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const result =
  parseAndReviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFollowUpReviewApprovalGateFixture({
    approvalGateFixtureInput: readJson(fixturePath),
    followUpReviewFixtureInput: readJson(followUpReviewFixturePath),
    executionGateApprovalReviewApprovalGateFixtureInput: readJson(executionGateApprovalReviewApprovalGateFixturePath),
    executionGateApprovalReviewFixtureInput: readJson(executionGateApprovalReviewFixturePath),
    executionGateReviewApprovalGateFixtureInput: readJson(executionGateReviewApprovalGateFixturePath),
    executionGateReviewFixtureInput: readJson(executionGateReviewFixturePath),
    executionReviewApprovalGateFixtureInput: readJson(executionReviewApprovalGateFixturePath),
    executionReviewFixtureInput: readJson(executionReviewFixturePath),
    executionGateFixtureInput: readJson(executionGateFixturePath),
    fileCreationDryRunApprovalGateFixtureInput: readJson(fileCreationDryRunApprovalGateFixturePath),
    fileCreationDryRunReviewFixtureInput: readJson(fileCreationDryRunReviewFixturePath),
    fileCreationGateFixtureInput: readJson(fileCreationGateFixturePath),
    fileCreationApprovalGateFixtureInput: readJson(fileCreationApprovalGateFixturePath),
    writeDryRunReviewFixtureInput: readJson(writeDryRunReviewFixturePath),
    writeGateFixtureInput: readJson(writeGateFixturePath),
    creationApprovalGateFixtureInput: readJson(creationApprovalGateFixturePath),
    creationReviewFixtureInput: readJson(creationReviewFixturePath),
    creationGateFixtureInput: readJson(creationGateFixturePath),
    draftManifestApprovalGateFixtureInput: readJson(draftManifestApprovalGateFixturePath),
    draftManifestReviewFixtureInput: readJson(draftManifestReviewFixturePath),
    metadataEnrichmentApprovalGateFixtureInput: readJson(metadataApprovalGateFixturePath),
    enrichmentFixtureInput: readJson(enrichmentFixturePath),
    listingReviewFixtureInput: readJson(listingReviewFixturePath),
    listingGateFixtureInput: readJson(listingGateFixturePath)
  });

const output = {
  provider: provider.providerName,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  fixture_path: fixturePath,
  source_follow_up_review_fixture_path: followUpReviewFixturePath,
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_approval_gate_cases:
    result.gates.length,
  reviewed_execution_gate_approval_review_follow_up_review_items:
    result.reviewedExecutionGateApprovalReviewFollowUpReviewItems,
  approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_approval_count:
    result.approvedForFutureFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFollowUpReviewApprovalCount,
  needs_owner_review_count: result.needsOwnerReviewCount,
  incomplete_approval_count: result.incompleteApprovalCount,
  blocked_approval_count: result.blockedApprovalCount,
  duplicate_id_findings_count: result.duplicateIdFindingsCount,
  missing_approval_fields_count: result.missingApprovalFieldsCount,
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
  fixture_manifest_file_creation_execution_gate_allowed:
    result.fixtureManifestFileCreationExecutionGateAllowed,
  fixture_manifest_file_creation_execution_gate_allowed_count:
    result.fixtureManifestFileCreationExecutionGateAllowedCount,
  fixture_manifest_file_creation_dry_run_execution_review_allowed:
    result.fixtureManifestFileCreationDryRunExecutionReviewAllowed,
  fixture_manifest_file_creation_dry_run_execution_review_allowed_count:
    result.fixtureManifestFileCreationDryRunExecutionReviewAllowedCount,
  fixture_manifest_file_creation_dry_run_execution_gate_allowed:
    result.fixtureManifestFileCreationDryRunExecutionGateAllowed,
  fixture_manifest_file_creation_dry_run_execution_gate_allowed_count:
    result.fixtureManifestFileCreationDryRunExecutionGateAllowedCount,
  fixture_manifest_file_creation_dry_run_execution_gate_review_allowed:
    result.fixtureManifestFileCreationDryRunExecutionGateReviewAllowed,
  fixture_manifest_file_creation_dry_run_execution_gate_review_allowed_count:
    result.fixtureManifestFileCreationDryRunExecutionGateReviewAllowedCount,
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_allowed:
    result.fixtureManifestFileCreationDryRunExecutionGateApprovalReviewAllowed,
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_allowed_count:
    result.fixtureManifestFileCreationDryRunExecutionGateApprovalReviewAllowedCount,
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_allowed:
    result.fixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalAllowed,
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_allowed_count:
    result.fixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalAllowedCount,
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_allowed:
    result.fixtureManifestFileCreationDryRunExecutionGateApprovalReviewFollowUpReviewAllowed,
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_allowed_count:
    result.fixtureManifestFileCreationDryRunExecutionGateApprovalReviewFollowUpReviewAllowedCount,
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_approval_allowed:
    result.fixtureManifestFileCreationDryRunExecutionGateApprovalReviewFollowUpReviewApprovalAllowed,
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_approval_allowed_count:
    result.fixtureManifestFileCreationDryRunExecutionGateApprovalReviewFollowUpReviewApprovalAllowedCount,
  fixture_manifest_file_created_count: result.fixtureManifestFileCreatedCount,
  fixture_manifest_write_performed_count: result.fixtureManifestWritePerformedCount,
  fixture_manifest_file_creation_performed_count: result.fixtureManifestFileCreationPerformedCount,
  fixture_manifest_file_creation_execution_performed_count:
    result.fixtureManifestFileCreationExecutionPerformedCount,
  fixture_manifest_execution_review_persisted_count:
    result.fixtureManifestExecutionReviewPersistedCount,
  fixture_manifest_execution_gate_review_persisted_count:
    result.fixtureManifestExecutionGateReviewPersistedCount,
  fixture_manifest_execution_gate_review_approval_persisted_count:
    result.fixtureManifestExecutionGateReviewApprovalPersistedCount,
  fixture_manifest_execution_gate_approval_review_persisted_count:
    result.fixtureManifestExecutionGateApprovalReviewPersistedCount,
  fixture_manifest_execution_gate_approval_review_approval_persisted_count:
    result.fixtureManifestExecutionGateApprovalReviewApprovalPersistedCount,
  fixture_manifest_execution_gate_approval_review_follow_up_review_persisted_count:
    result.fixtureManifestExecutionGateApprovalReviewFollowUpReviewPersistedCount,
  fixture_manifest_execution_gate_approval_review_follow_up_review_approval_persisted_count:
    result.fixtureManifestExecutionGateApprovalReviewFollowUpReviewApprovalPersistedCount,
  production_manifest_write_allowed_count: result.productionManifestWriteAllowedCount,
  manifest_export_allowed_count: result.manifestExportAllowedCount,
  recommended_owner_actions_count: result.recommendedOwnerActionsCount,
  public_ready: false,
  public_ready_count: result.publicReadyCount,
  publish_track: result.publishTrack,
  gate_summaries: result.gates.map((gate) => ({
    fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_approval_gate_id:
      gate.fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_approval_gate_id,
    source_id: gate.source_id,
    source_execution_gate_approval_review_follow_up_review_status:
      gate.source_execution_gate_approval_review_follow_up_review_status,
    reviewed_execution_gate_approval_review_follow_up_review_items:
      gate.reviewed_execution_gate_approval_review_follow_up_review_items,
    approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_approval:
      gate.approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_approval,
    needs_owner_review: gate.needs_owner_review,
    incomplete_approval: gate.incomplete_approval,
    blocked_approval: gate.blocked_approval,
    duplicate_id_findings: gate.duplicate_id_findings.length,
    missing_approval_fields: gate.missing_approval_fields.length,
    metadata_write_allowed: gate.metadata_write_allowed,
    manifest_write_allowed: gate.manifest_write_allowed,
    fixture_manifest_file_created: gate.fixture_manifest_file_created,
    fixture_manifest_write_performed: gate.fixture_manifest_write_performed,
    fixture_manifest_file_creation_performed: gate.fixture_manifest_file_creation_performed,
    fixture_manifest_file_creation_execution_performed:
      gate.fixture_manifest_file_creation_execution_performed,
    fixture_manifest_execution_review_persisted: gate.fixture_manifest_execution_review_persisted,
    fixture_manifest_execution_gate_review_persisted:
      gate.fixture_manifest_execution_gate_review_persisted,
    fixture_manifest_execution_gate_review_approval_persisted:
      gate.fixture_manifest_execution_gate_review_approval_persisted,
    fixture_manifest_execution_gate_approval_review_persisted:
      gate.fixture_manifest_execution_gate_approval_review_persisted,
    fixture_manifest_execution_gate_approval_review_approval_persisted:
      gate.fixture_manifest_execution_gate_approval_review_approval_persisted,
    fixture_manifest_execution_gate_approval_review_follow_up_review_persisted:
      gate.fixture_manifest_execution_gate_approval_review_follow_up_review_persisted,
    fixture_manifest_execution_gate_approval_review_follow_up_review_approval_persisted:
      gate.fixture_manifest_execution_gate_approval_review_follow_up_review_approval_persisted,
    production_manifest_write_allowed: gate.production_manifest_write_allowed,
    manifest_export_allowed: gate.manifest_export_allowed,
    public_ready: gate.public_ready,
    publish_track: gate.publish_track
  })),
  no_fixture_manifest_file_creation: true,
  no_fixture_manifest_write_performed: true,
  no_fixture_manifest_file_creation_performed: true,
  no_fixture_manifest_file_creation_gate_execution: true,
  no_fixture_manifest_file_creation_execution_gate_execution: true,
  no_fixture_manifest_file_creation_execution_performed: true,
  no_fixture_manifest_execution_review_persisted: true,
  no_fixture_manifest_execution_gate_review_persisted: true,
  no_fixture_manifest_execution_gate_review_approval_persisted: true,
  no_fixture_manifest_execution_gate_approval_review_persisted: true,
  no_fixture_manifest_execution_gate_approval_review_approval_persisted: true,
  no_fixture_manifest_execution_gate_approval_review_follow_up_review_persisted: true,
  no_fixture_manifest_execution_gate_approval_review_follow_up_review_approval_persisted: true,
  no_draft_manifest_file_creation: true,
  no_production_manifest_file_creation_or_write: true,
  no_manifest_import_export_or_write: true,
  no_metadata_import_or_write: true,
  next_phase: "Future owner-approved fixture-only follow-up review approval continuation"
};

if (
  output.provider !== "fake_content_engine" ||
  output.fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_approval_gate_cases < 1 ||
  output.reviewed_execution_gate_approval_review_follow_up_review_items < 5 ||
  output.approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_approval_count < 1 ||
  output.needs_owner_review_count < 1 ||
  output.incomplete_approval_count < 1 ||
  output.blocked_approval_count < 1 ||
  output.duplicate_id_findings_count < 1 ||
  output.metadata_write_allowed_count !== 0 ||
  output.manifest_write_allowed_count !== 0 ||
  output.fixture_manifest_file_created_count !== 0 ||
  output.fixture_manifest_write_performed_count !== 0 ||
  output.fixture_manifest_file_creation_performed_count !== 0 ||
  output.fixture_manifest_file_creation_execution_performed_count !== 0 ||
  output.fixture_manifest_execution_review_persisted_count !== 0 ||
  output.fixture_manifest_execution_gate_review_persisted_count !== 0 ||
  output.fixture_manifest_execution_gate_review_approval_persisted_count !== 0 ||
  output.fixture_manifest_execution_gate_approval_review_persisted_count !== 0 ||
  output.fixture_manifest_execution_gate_approval_review_approval_persisted_count !== 0 ||
  output.fixture_manifest_execution_gate_approval_review_follow_up_review_persisted_count !== 0 ||
  output.fixture_manifest_execution_gate_approval_review_follow_up_review_approval_persisted_count !== 0 ||
  output.production_manifest_write_allowed_count !== 0 ||
  output.manifest_export_allowed_count !== 0 ||
  output.public_ready !== false ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked" ||
  output.no_fixture_manifest_file_creation !== true ||
  output.no_fixture_manifest_write_performed !== true ||
  output.no_fixture_manifest_file_creation_performed !== true ||
  output.no_fixture_manifest_file_creation_gate_execution !== true ||
  output.no_fixture_manifest_file_creation_execution_gate_execution !== true ||
  output.no_fixture_manifest_file_creation_execution_performed !== true ||
  output.no_fixture_manifest_execution_review_persisted !== true ||
  output.no_fixture_manifest_execution_gate_review_persisted !== true ||
  output.no_fixture_manifest_execution_gate_review_approval_persisted !== true ||
  output.no_fixture_manifest_execution_gate_approval_review_persisted !== true ||
  output.no_fixture_manifest_execution_gate_approval_review_approval_persisted !== true ||
  output.no_fixture_manifest_execution_gate_approval_review_follow_up_review_persisted !== true ||
  output.no_fixture_manifest_execution_gate_approval_review_follow_up_review_approval_persisted !== true ||
  output.no_draft_manifest_file_creation !== true ||
  output.no_production_manifest_file_creation_or_write !== true ||
  output.no_manifest_import_export_or_write !== true ||
  output.no_metadata_import_or_write !== true
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_source_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_follow_up_review_approval_gate_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
