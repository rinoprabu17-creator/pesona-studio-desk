import { z } from "zod";
import {
  parseAndReviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFixture,
  type FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItem,
  type SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewOutput
} from "./source-folder-fixture-manifest-file-creation-dry-run-execution-gate-approval-review.ts";

const EXECUTION_GATE_APPROVAL_REVIEW_APPROVAL_GATE_ID =
  "phase-2j33-source-folder-fixture-manifest-file-creation-dry-run-execution-gate-approval-review-approval-gate";
const FUTURE_FIXTURE_MANIFEST_FILE_CREATION_DRY_RUN_EXECUTION_GATE_APPROVAL_REVIEW_SCOPE =
  "future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_only";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const ExecutionGateApprovalReviewApprovalActionSchema = z.enum([
  "metadata_write_requested",
  "metadata_import_requested",
  "manifest_write_requested",
  "manifest_import_requested",
  "manifest_export_requested",
  "fixture_manifest_write_requested",
  "fixture_manifest_file_create_requested",
  "fixture_manifest_file_creation_gate_execute_requested",
  "fixture_manifest_file_creation_execution_gate_execute_requested",
  "fixture_manifest_file_creation_execution_requested",
  "fixture_manifest_execution_review_persist_requested",
  "fixture_manifest_execution_gate_review_persist_requested",
  "fixture_manifest_execution_gate_review_approval_persist_requested",
  "fixture_manifest_execution_gate_approval_review_persist_requested",
  "fixture_manifest_execution_gate_approval_review_approval_persist_requested",
  "draft_manifest_file_create_requested",
  "production_manifest_write_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

const ExecutionGateApprovalReviewApprovalStatusSchema = z.enum([
  "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval",
  "needs_owner_review",
  "incomplete_approval",
  "blocked_approval"
]);

export const SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalRecordSchema = z.object({
  execution_gate_approval_review_item_id: z.string().min(1),
  approval_record_found: z.boolean(),
  owner_approved: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  requested_actions: z.array(ExecutionGateApprovalReviewApprovalActionSchema).default([])
}).strict();

export const SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateFixtureSchema = z.object({
  fixture_version: z.literal(
    "source-folder-fixture-manifest-file-creation-dry-run-execution-gate-approval-review-approval-gate-smoke-v1"
  ),
  mode: z.literal("controlled_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_gate"),
  source_execution_gate_approval_review_fixture: z.string().min(1),
  source_execution_gate_review_approval_gate_fixture: z.string().min(1),
  source_execution_gate_review_fixture: z.string().min(1),
  source_execution_review_approval_gate_fixture: z.string().min(1),
  source_execution_review_fixture: z.string().min(1),
  source_execution_gate_fixture: z.string().min(1),
  source_file_creation_dry_run_approval_gate_fixture: z.string().min(1),
  source_file_creation_dry_run_review_fixture: z.string().min(1),
  source_file_creation_gate_fixture: z.string().min(1),
  source_file_creation_approval_gate_fixture: z.string().min(1),
  source_write_dry_run_review_fixture: z.string().min(1),
  source_write_gate_fixture: z.string().min(1),
  source_creation_approval_gate_fixture: z.string().min(1),
  source_creation_review_fixture: z.string().min(1),
  source_creation_gate_fixture: z.string().min(1),
  source_draft_manifest_approval_gate_fixture: z.string().min(1),
  source_draft_manifest_review_fixture: z.string().min(1),
  source_metadata_enrichment_approval_gate_fixture: z.string().min(1),
  source_metadata_enrichment_fixture: z.string().min(1),
  source_listing_review_fixture: z.string().min(1),
  source_listing_gate_fixture: z.string().min(1),
  execution_gate_approval_review_approval_records: z.array(
    SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalRecordSchema
  ).min(1),
  notes: z.string().min(1)
}).strict();

export const FixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalItemSchema = z.object({
  execution_gate_approval_review_item_id: z.string().min(1),
  execution_gate_review_item_id: z.string().min(1),
  execution_review_item_id: z.string().min(1),
  file_creation_plan_item_id: z.string().min(1),
  write_plan_item_id: z.string().min(1),
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_execution_gate_approval_review_status: z.enum([
    "execution_gate_approval_review_ok",
    "needs_owner_review",
    "incomplete_execution_gate_approval_review",
    "blocked_execution_gate_approval_review"
  ]),
  product_family: z.string().min(1).nullable(),
  visual_type: z.string().min(1).nullable(),
  process_stage: z.string().min(1).nullable(),
  orientation: z.enum(["vertical", "horizontal", "square", "unknown"]).nullable(),
  school_level: z.string().min(1).nullable(),
  color_variant: z.string().min(1).nullable(),
  content_tags: z.array(z.string().min(1)),
  risk_flags: z.array(z.string().min(1)),
  target_fixture_manifest_path: z.string().min(1).nullable(),
  owner_approved: z.boolean(),
  approval_record_found: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  approval_status: ExecutionGateApprovalReviewApprovalStatusSchema,
  missing_approval_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateOutputSchema = z.object({
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_gate_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  source_execution_gate_approval_review_status: z.enum(["execution_gate_approval_review_ok", "execution_gate_approval_review_denied"]),
  reviewed_execution_gate_approval_review_items: z.number().int().min(0),
  approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval:
    z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_approval: z.number().int().min(0),
  blocked_approval: z.number().int().min(0),
  approval_items: z.array(FixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalItemSchema),
  approval_policy_findings: z.array(z.string().min(1)),
  duplicate_id_findings: z.array(z.string().min(1)),
  missing_approval_fields: z.record(z.string(), z.number().int().min(0)),
  blocked_reason_summary: z.record(z.string(), z.number().int().min(0)),
  denied_action_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  target_fixture_manifest_path: z.string().min(1).nullable(),
  metadata_write_allowed: z.literal(false),
  manifest_write_allowed: z.literal(false),
  fixture_manifest_write_allowed: z.boolean(),
  fixture_manifest_file_creation_gate_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_allowed: z.boolean(),
  fixture_manifest_file_creation_execution_gate_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_execution_review_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_execution_gate_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_execution_gate_review_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_allowed: z.boolean(),
  fixture_manifest_file_created: z.literal(false),
  fixture_manifest_write_performed: z.literal(false),
  fixture_manifest_file_creation_performed: z.literal(false),
  fixture_manifest_file_creation_execution_performed: z.literal(false),
  fixture_manifest_execution_review_persisted: z.literal(false),
  fixture_manifest_execution_gate_review_persisted: z.literal(false),
  fixture_manifest_execution_gate_review_approval_persisted: z.literal(false),
  fixture_manifest_execution_gate_approval_review_persisted: z.literal(false),
  fixture_manifest_execution_gate_approval_review_approval_persisted: z.literal(false),
  production_manifest_write_allowed: z.literal(false),
  manifest_export_allowed: z.literal(false),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalRecord = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalRecordSchema
>;
export type SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateFixture = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateFixtureSchema
>;
export type FixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalItem = z.infer<
  typeof FixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalItemSchema
>;
export type SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateOutput = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateOutputSchema
>;

export type SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateFixture;
  gates: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateOutput[];
  reviewedExecutionGateApprovalReviewItems: number;
  approvedForFutureFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalCount: number;
  needsOwnerReviewCount: number;
  incompleteApprovalCount: number;
  blockedApprovalCount: number;
  duplicateIdFindingsCount: number;
  missingApprovalFieldsCount: number;
  blockedReasonsCount: number;
  deniedActionCount: number;
  metadataWriteAllowedCount: number;
  manifestWriteAllowedCount: number;
  fixtureManifestWriteAllowedCount: number;
  fixtureManifestWriteAllowed: boolean;
  fixtureManifestFileCreationGateAllowedCount: number;
  fixtureManifestFileCreationGateAllowed: boolean;
  fixtureManifestFileCreationDryRunAllowedCount: number;
  fixtureManifestFileCreationDryRunAllowed: boolean;
  fixtureManifestFileCreationExecutionGateAllowedCount: number;
  fixtureManifestFileCreationExecutionGateAllowed: boolean;
  fixtureManifestFileCreationDryRunExecutionReviewAllowedCount: number;
  fixtureManifestFileCreationDryRunExecutionReviewAllowed: boolean;
  fixtureManifestFileCreationDryRunExecutionGateAllowedCount: number;
  fixtureManifestFileCreationDryRunExecutionGateAllowed: boolean;
  fixtureManifestFileCreationDryRunExecutionGateReviewAllowedCount: number;
  fixtureManifestFileCreationDryRunExecutionGateReviewAllowed: boolean;
  fixtureManifestFileCreationDryRunExecutionGateApprovalReviewAllowedCount: number;
  fixtureManifestFileCreationDryRunExecutionGateApprovalReviewAllowed: boolean;
  fixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalAllowedCount: number;
  fixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalAllowed: boolean;
  fixtureManifestFileCreatedCount: number;
  fixtureManifestWritePerformedCount: number;
  fixtureManifestFileCreationPerformedCount: number;
  fixtureManifestFileCreationExecutionPerformedCount: number;
  fixtureManifestExecutionReviewPersistedCount: number;
  fixtureManifestExecutionGateReviewPersistedCount: number;
  fixtureManifestExecutionGateReviewApprovalPersistedCount: number;
  fixtureManifestExecutionGateApprovalReviewPersistedCount: number;
  fixtureManifestExecutionGateApprovalReviewApprovalPersistedCount: number;
  productionManifestWriteAllowedCount: number;
  manifestExportAllowedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateFixture(
  input: unknown
): SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateFixture {
  return SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateFixtureSchema.parse(input);
}

export function parseAndReviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateFixture(input: {
  approvalGateFixtureInput: unknown;
  executionGateApprovalReviewFixtureInput: unknown;
  executionGateReviewApprovalGateFixtureInput: unknown;
  executionGateReviewFixtureInput: unknown;
  executionReviewApprovalGateFixtureInput: unknown;
  executionReviewFixtureInput: unknown;
  executionGateFixtureInput: unknown;
  fileCreationDryRunApprovalGateFixtureInput: unknown;
  fileCreationDryRunReviewFixtureInput: unknown;
  fileCreationGateFixtureInput: unknown;
  fileCreationApprovalGateFixtureInput: unknown;
  writeDryRunReviewFixtureInput: unknown;
  writeGateFixtureInput: unknown;
  creationApprovalGateFixtureInput: unknown;
  creationReviewFixtureInput: unknown;
  creationGateFixtureInput: unknown;
  draftManifestApprovalGateFixtureInput: unknown;
  draftManifestReviewFixtureInput: unknown;
  metadataEnrichmentApprovalGateFixtureInput: unknown;
  enrichmentFixtureInput: unknown;
  listingReviewFixtureInput: unknown;
  listingGateFixtureInput: unknown;
}): SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateBatchResult {
  const fixture = parseSourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateFixture(
    input.approvalGateFixtureInput
  );
  const executionGateApprovalReviewResult =
    parseAndReviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFixture({
      executionGateApprovalReviewFixtureInput: input.executionGateApprovalReviewFixtureInput,
      executionGateReviewApprovalGateFixtureInput: input.executionGateReviewApprovalGateFixtureInput,
      executionGateReviewFixtureInput: input.executionGateReviewFixtureInput,
      executionReviewApprovalGateFixtureInput: input.executionReviewApprovalGateFixtureInput,
      executionReviewFixtureInput: input.executionReviewFixtureInput,
      executionGateFixtureInput: input.executionGateFixtureInput,
      fileCreationDryRunApprovalGateFixtureInput: input.fileCreationDryRunApprovalGateFixtureInput,
      fileCreationDryRunReviewFixtureInput: input.fileCreationDryRunReviewFixtureInput,
      fileCreationGateFixtureInput: input.fileCreationGateFixtureInput,
      fileCreationApprovalGateFixtureInput: input.fileCreationApprovalGateFixtureInput,
      writeDryRunReviewFixtureInput: input.writeDryRunReviewFixtureInput,
      writeGateFixtureInput: input.writeGateFixtureInput,
      creationApprovalGateFixtureInput: input.creationApprovalGateFixtureInput,
      creationReviewFixtureInput: input.creationReviewFixtureInput,
      creationGateFixtureInput: input.creationGateFixtureInput,
      draftManifestApprovalGateFixtureInput: input.draftManifestApprovalGateFixtureInput,
      draftManifestReviewFixtureInput: input.draftManifestReviewFixtureInput,
      metadataEnrichmentApprovalGateFixtureInput: input.metadataEnrichmentApprovalGateFixtureInput,
      enrichmentFixtureInput: input.enrichmentFixtureInput,
      listingReviewFixtureInput: input.listingReviewFixtureInput,
      listingGateFixtureInput: input.listingGateFixtureInput
    });
  const gates = executionGateApprovalReviewResult.reviews.map((review) =>
    reviewExecutionGateApprovalReviewApprovalGate(review, fixture.execution_gate_approval_review_approval_records)
  );

  return {
    provider: "fake_content_engine",
    fixture,
    gates,
    reviewedExecutionGateApprovalReviewItems: sum(gates.map((gate) => gate.reviewed_execution_gate_approval_review_items)),
    approvedForFutureFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalCount: sum(
      gates.map((gate) =>
        gate.approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval
      )
    ),
    needsOwnerReviewCount: sum(gates.map((gate) => gate.needs_owner_review)),
    incompleteApprovalCount: sum(gates.map((gate) => gate.incomplete_approval)),
    blockedApprovalCount: sum(gates.map((gate) => gate.blocked_approval)),
    duplicateIdFindingsCount: sum(gates.map((gate) => gate.duplicate_id_findings.length)),
    missingApprovalFieldsCount: sum(gates.flatMap((gate) => Object.values(gate.missing_approval_fields))),
    blockedReasonsCount: sum(gates.flatMap((gate) => Object.values(gate.blocked_reason_summary))),
    deniedActionCount: sum(gates.flatMap((gate) => Object.values(gate.denied_action_summary))),
    metadataWriteAllowedCount: gates.filter((gate) => gate.metadata_write_allowed).length,
    manifestWriteAllowedCount: gates.filter((gate) => gate.manifest_write_allowed).length,
    fixtureManifestWriteAllowedCount: gates.filter((gate) => gate.fixture_manifest_write_allowed).length,
    fixtureManifestWriteAllowed: gates.some((gate) => gate.fixture_manifest_write_allowed),
    fixtureManifestFileCreationGateAllowedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_gate_allowed
    ).length,
    fixtureManifestFileCreationGateAllowed: gates.some((gate) => gate.fixture_manifest_file_creation_gate_allowed),
    fixtureManifestFileCreationDryRunAllowedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_dry_run_allowed
    ).length,
    fixtureManifestFileCreationDryRunAllowed: gates.some(
      (gate) => gate.fixture_manifest_file_creation_dry_run_allowed
    ),
    fixtureManifestFileCreationExecutionGateAllowedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_execution_gate_allowed
    ).length,
    fixtureManifestFileCreationExecutionGateAllowed: gates.some(
      (gate) => gate.fixture_manifest_file_creation_execution_gate_allowed
    ),
    fixtureManifestFileCreationDryRunExecutionReviewAllowedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_dry_run_execution_review_allowed
    ).length,
    fixtureManifestFileCreationDryRunExecutionReviewAllowed: gates.some(
      (gate) => gate.fixture_manifest_file_creation_dry_run_execution_review_allowed
    ),
    fixtureManifestFileCreationDryRunExecutionGateAllowedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_dry_run_execution_gate_allowed
    ).length,
    fixtureManifestFileCreationDryRunExecutionGateAllowed: gates.some(
      (gate) => gate.fixture_manifest_file_creation_dry_run_execution_gate_allowed
    ),
    fixtureManifestFileCreationDryRunExecutionGateReviewAllowedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_dry_run_execution_gate_review_allowed
    ).length,
    fixtureManifestFileCreationDryRunExecutionGateReviewAllowed: gates.some(
      (gate) => gate.fixture_manifest_file_creation_dry_run_execution_gate_review_allowed
    ),
    fixtureManifestFileCreationDryRunExecutionGateApprovalReviewAllowedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_dry_run_execution_gate_approval_review_allowed
    ).length,
    fixtureManifestFileCreationDryRunExecutionGateApprovalReviewAllowed: gates.some(
      (gate) => gate.fixture_manifest_file_creation_dry_run_execution_gate_approval_review_allowed
    ),
    fixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalAllowedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_allowed
    ).length,
    fixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalAllowed: gates.some(
      (gate) => gate.fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_allowed
    ),
    fixtureManifestFileCreatedCount: gates.filter((gate) => gate.fixture_manifest_file_created).length,
    fixtureManifestWritePerformedCount: gates.filter((gate) => gate.fixture_manifest_write_performed).length,
    fixtureManifestFileCreationPerformedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_performed
    ).length,
    fixtureManifestFileCreationExecutionPerformedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_execution_performed
    ).length,
    fixtureManifestExecutionReviewPersistedCount: gates.filter(
      (gate) => gate.fixture_manifest_execution_review_persisted
    ).length,
    fixtureManifestExecutionGateReviewPersistedCount: gates.filter(
      (gate) => gate.fixture_manifest_execution_gate_review_persisted
    ).length,
    fixtureManifestExecutionGateReviewApprovalPersistedCount: gates.filter(
      (gate) => gate.fixture_manifest_execution_gate_review_approval_persisted
    ).length,
    fixtureManifestExecutionGateApprovalReviewPersistedCount: gates.filter(
      (gate) => gate.fixture_manifest_execution_gate_approval_review_persisted
    ).length,
    fixtureManifestExecutionGateApprovalReviewApprovalPersistedCount: gates.filter(
      (gate) => gate.fixture_manifest_execution_gate_approval_review_approval_persisted
    ).length,
    productionManifestWriteAllowedCount: gates.filter((gate) => gate.production_manifest_write_allowed).length,
    manifestExportAllowedCount: gates.filter((gate) => gate.manifest_export_allowed).length,
    recommendedOwnerActionsCount: sum(gates.map((gate) => gate.recommended_owner_actions.length)),
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function reviewExecutionGateApprovalReviewApprovalGate(
  executionGateApprovalReview: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewOutput,
  approvalRecords: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalRecord[]
): SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateOutput {
  const sourceStatus = executionGateApprovalReview.execution_gate_approval_review_ok > 0
    ? "execution_gate_approval_review_ok"
    : "execution_gate_approval_review_denied";
  const duplicateIds = new Set(
    executionGateApprovalReview.execution_gate_approval_review_item_reviews
      .filter((item) => item.blocking_reasons.includes("duplicate_suggested_footage_id_blocked"))
      .map((item) => item.suggested_footage_id)
  );
  const approvalItems = sourceStatus === "execution_gate_approval_review_ok"
    ? executionGateApprovalReview.execution_gate_approval_review_item_reviews.map((item) =>
        approvalItemForExecutionGateApprovalReview(
          item,
          approvalRecords.find((record) => record.execution_gate_approval_review_item_id === item.execution_gate_approval_review_item_id),
          duplicateIds,
          executionGateApprovalReview
        )
      )
    : [];
  const approvedCount = countApprovalStatus(
    approvalItems,
    "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval"
  );

  return SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalGateOutputSchema.parse({
    fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_gate_id:
      `${EXECUTION_GATE_APPROVAL_REVIEW_APPROVAL_GATE_ID}-${executionGateApprovalReview.source_id}`,
    source_id: executionGateApprovalReview.source_id,
    source_label: executionGateApprovalReview.source_label,
    source_root: executionGateApprovalReview.source_root,
    dry_run: executionGateApprovalReview.dry_run,
    read_only: executionGateApprovalReview.read_only,
    source_execution_gate_approval_review_status: sourceStatus,
    reviewed_execution_gate_approval_review_items: sourceStatus === "execution_gate_approval_review_ok"
      ? executionGateApprovalReview.execution_gate_approval_review_item_reviews.length
      : 0,
    approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval: approvedCount,
    needs_owner_review: countApprovalStatus(approvalItems, "needs_owner_review"),
    incomplete_approval: countApprovalStatus(approvalItems, "incomplete_approval"),
    blocked_approval: countApprovalStatus(approvalItems, "blocked_approval"),
    approval_items: approvalItems,
    approval_policy_findings: approvalPolicyFindings(sourceStatus, executionGateApprovalReview),
    duplicate_id_findings: [...duplicateIds].map((id) => `duplicate_suggested_footage_id:${id}`),
    missing_approval_fields: summarizeValues(approvalItems.flatMap((item) => item.missing_approval_fields)),
    blocked_reason_summary: summarizeValues(approvalItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(approvalItems, approvalRecords),
    recommended_owner_actions: recommendedOwnerActions(sourceStatus, approvalItems, duplicateIds.size),
    next_safe_actions: nextSafeActions(sourceStatus, approvedCount),
    target_fixture_manifest_path:
      approvalItems.find(
        (item) =>
          item.approval_status ===
          "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval"
      )?.target_fixture_manifest_path ?? executionGateApprovalReview.target_fixture_manifest_path,
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    fixture_manifest_write_allowed: executionGateApprovalReview.fixture_manifest_write_allowed,
    fixture_manifest_file_creation_gate_allowed: executionGateApprovalReview.fixture_manifest_file_creation_gate_allowed,
    fixture_manifest_file_creation_dry_run_allowed: executionGateApprovalReview.fixture_manifest_file_creation_dry_run_allowed,
    fixture_manifest_file_creation_execution_gate_allowed:
      executionGateApprovalReview.fixture_manifest_file_creation_execution_gate_allowed,
    fixture_manifest_file_creation_dry_run_execution_review_allowed:
      executionGateApprovalReview.fixture_manifest_file_creation_dry_run_execution_review_allowed,
    fixture_manifest_file_creation_dry_run_execution_gate_allowed:
      executionGateApprovalReview.fixture_manifest_file_creation_dry_run_execution_gate_allowed,
    fixture_manifest_file_creation_dry_run_execution_gate_review_allowed:
      executionGateApprovalReview.fixture_manifest_file_creation_dry_run_execution_gate_review_allowed,
    fixture_manifest_file_creation_dry_run_execution_gate_approval_review_allowed:
      executionGateApprovalReview.fixture_manifest_file_creation_dry_run_execution_gate_approval_review_allowed,
    fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_allowed: approvedCount > 0,
    fixture_manifest_file_created: false,
    fixture_manifest_write_performed: false,
    fixture_manifest_file_creation_performed: false,
    fixture_manifest_file_creation_execution_performed: false,
    fixture_manifest_execution_review_persisted: false,
    fixture_manifest_execution_gate_review_persisted: false,
    fixture_manifest_execution_gate_review_approval_persisted: false,
    fixture_manifest_execution_gate_approval_review_persisted: false,
    fixture_manifest_execution_gate_approval_review_approval_persisted: false,
    production_manifest_write_allowed: false,
    manifest_export_allowed: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function approvalItemForExecutionGateApprovalReview(
  item: FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItem,
  record: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalRecord | undefined,
  duplicateIds: Set<string>,
  executionGateApprovalReview: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewOutput
): FixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalItem {
  const approvalRecord = record ?? defaultApprovalRecord(item.execution_gate_approval_review_item_id);
  const missingApprovalFields = missingApprovalFieldsFor(approvalRecord);
  const blockingReasons = blockingReasonsFor(item, approvalRecord, duplicateIds, executionGateApprovalReview);
  const status = approvalStatusFor(item, approvalRecord, missingApprovalFields, blockingReasons);

  return FixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalItemSchema.parse({
    execution_gate_approval_review_item_id: item.execution_gate_approval_review_item_id,
    execution_gate_review_item_id: item.execution_gate_review_item_id,
    execution_review_item_id: item.execution_review_item_id,
    file_creation_plan_item_id: item.file_creation_plan_item_id,
    write_plan_item_id: item.write_plan_item_id,
    manifest_item_id: item.manifest_item_id,
    suggested_footage_id: item.suggested_footage_id,
    filename: item.filename,
    relative_path: item.relative_path,
    source_execution_gate_approval_review_status: item.execution_gate_approval_review_status,
    product_family: item.product_family,
    visual_type: item.visual_type,
    process_stage: item.process_stage,
    orientation: item.orientation,
    school_level: item.school_level,
    color_variant: item.color_variant,
    content_tags: item.content_tags,
    risk_flags: item.risk_flags,
    target_fixture_manifest_path: item.target_fixture_manifest_path,
    owner_approved: approvalRecord.owner_approved,
    approval_record_found: approvalRecord.approval_record_found,
    approved_by: approvalRecord.approved_by,
    approved_at: approvalRecord.approved_at,
    approval_scope: approvalRecord.approval_scope,
    approval_status: status,
    missing_approval_fields: missingApprovalFields,
    blocking_reasons: blockingReasons,
    review_notes: [
      `Source execution gate review status: ${item.execution_gate_approval_review_status}.`,
      `Fixture manifest file creation dry-run execution gate approval review approval status: ${status}.`,
      "Approval is future approval/review eligibility only; no fixture manifest file is created, written, exported, imported, saved, persisted, or executed."
    ],
    recommended_action: recommendedAction(status)
  });
}

function defaultApprovalRecord(
  executionGateApprovalReviewItemId: string
): SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalRecord {
  return {
    execution_gate_approval_review_item_id: executionGateApprovalReviewItemId,
    approval_record_found: false,
    owner_approved: false,
    approved_by: null,
    approved_at: null,
    approval_scope: null,
    requested_actions: []
  };
}

function missingApprovalFieldsFor(
  record: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalRecord
): string[] {
  const missing: string[] = [];
  if (!record.approval_record_found) missing.push("approval_record_found");
  if (!record.owner_approved) missing.push("owner_approved");
  if (!record.approved_by) missing.push("approved_by");
  if (!record.approved_at) missing.push("approved_at");
  if (!record.approval_scope) missing.push("approval_scope");
  if (
    record.approval_scope &&
    record.approval_scope !==
      FUTURE_FIXTURE_MANIFEST_FILE_CREATION_DRY_RUN_EXECUTION_GATE_APPROVAL_REVIEW_SCOPE
  ) {
    missing.push("approval_scope_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_only");
  }
  return missing;
}

function blockingReasonsFor(
  item: FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItem,
  record: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalRecord,
  duplicateIds: Set<string>,
  executionGateApprovalReview: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewOutput
): string[] {
  const reasons: string[] = [];
  if (executionGateApprovalReview.source_root !== SAFE_FIXTURE_ROOT) reasons.push("source_root_not_safe_fixture");
  if (!executionGateApprovalReview.dry_run) reasons.push("dry_run_false_blocked");
  if (!executionGateApprovalReview.read_only) reasons.push("read_only_false_blocked");
  if (executionGateApprovalReview.in_memory_execution_gate_approval_review_preview.persisted) {
    reasons.push("in_memory_execution_gate_approval_review_preview_persisted_blocked");
  }
  if (item.execution_gate_approval_review_status === "blocked_execution_gate_approval_review") {
    reasons.push("source_execution_gate_approval_review_blocked_cannot_be_upgraded");
  }
  if (item.execution_gate_approval_review_status === "incomplete_execution_gate_approval_review") {
    reasons.push("source_execution_gate_approval_review_incomplete_cannot_be_upgraded");
  }
  if (duplicateIds.has(item.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of item.blocking_reasons) reasons.push(`source_execution_gate_approval_review_${reason}`);
  for (const riskFlag of item.risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const action of record.requested_actions) reasons.push(`denied_action_${action}`);
  if (item.relative_path.includes("..")) reasons.push("unsafe_relative_path_blocked");
  if (!item.relative_path.startsWith(SAFE_FIXTURE_ROOT)) reasons.push("relative_path_not_safe_fixture");
  if (!item.target_fixture_manifest_path) reasons.push("target_fixture_manifest_path_missing");
  if (item.target_fixture_manifest_path && containsBlockedPathToken(item.target_fixture_manifest_path)) {
    reasons.push("target_fixture_manifest_path_blocked_metadata_only");
  }
  if (item.target_fixture_manifest_path && !item.target_fixture_manifest_path.startsWith("packages/content-engine/fixtures/")) {
    reasons.push("target_fixture_manifest_path_not_safe_repo_fixture");
  }
  if (!item.product_family || !item.visual_type || !item.process_stage || !item.orientation || !item.filename || !item.relative_path) {
    reasons.push("required_manifest_fields_missing");
  }
  return reasons;
}

function approvalStatusFor(
  item: FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItem,
  record: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalRecord,
  missingApprovalFields: string[],
  blockingReasons: string[]
): z.infer<typeof ExecutionGateApprovalReviewApprovalStatusSchema> {
  if (item.execution_gate_approval_review_status === "incomplete_execution_gate_approval_review") return "incomplete_approval";
  if (blockingReasons.length > 0) return "blocked_approval";
  if (item.execution_gate_approval_review_status === "needs_owner_review") return "needs_owner_review";
  if (missingApprovalFields.length > 0) {
    if (item.execution_gate_approval_review_status === "execution_gate_approval_review_ok" && !record.approval_record_found) {
      return "needs_owner_review";
    }
    return "incomplete_approval";
  }
  if (item.execution_gate_approval_review_status !== "execution_gate_approval_review_ok") return "blocked_approval";
  return "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval";
}

function approvalPolicyFindings(
  sourceStatus: "execution_gate_approval_review_ok" | "execution_gate_approval_review_denied",
  review: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewOutput
): string[] {
  const findings = [
    "Phase 2J.33 is approval-gate only; it must not execute a gate, create, write, import, export, persist, save, or execute manifests.",
    "fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_allowed is future approval-review follow-up eligibility only."
  ];
  if (sourceStatus !== "execution_gate_approval_review_ok") {
    findings.push("Denied execution gate review cases produce zero approval items.");
  }
  if (review.source_root !== SAFE_FIXTURE_ROOT) findings.push("source_root_not_safe_fixture");
  if (review.in_memory_execution_gate_approval_review_preview.persisted) {
    findings.push("in_memory_execution_gate_approval_review_preview_persisted_blocked");
  }
  return findings;
}

function summarizeDeniedActions(
  items: FixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalItem[],
  records: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.execution_gate_approval_review_item_id));
  return summarizeValues(
    records.filter((record) => itemIds.has(record.execution_gate_approval_review_item_id)).flatMap((record) => record.requested_actions)
  );
}

function recommendedOwnerActions(
  sourceStatus: "execution_gate_approval_review_ok" | "execution_gate_approval_review_denied",
  items: FixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalItem[],
  duplicateIdCount: number
): string[] {
  if (sourceStatus !== "execution_gate_approval_review_ok") {
    return ["Keep denied execution gate review cases blocked; do not create approval items."];
  }
  const actions = [
    "Review approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval rows before any later approval/review phase.",
    "Do not execute a gate or create, write, export, import, save, persist, or execute any manifest in Phase 2J.33."
  ];
  if (items.some((item) => item.approval_status === "needs_owner_review")) {
    actions.push("Collect explicit owner approval before any later fixture-manifest file creation dry-run execution gate approval/review.");
  }
  if (items.some((item) => item.approval_status === "incomplete_approval")) {
    actions.push("Complete approval metadata before any later fixture-manifest file creation dry-run execution gate approval/review.");
  }
  if (items.some((item) => item.approval_status === "blocked_approval") || duplicateIdCount > 0) {
    actions.push("Keep duplicate IDs, blocked upstream rows, risky flags, unsafe paths, and denied write/import/export/render/upload/publish requests blocked.");
  }
  return actions;
}

function nextSafeActions(
  sourceStatus: "execution_gate_approval_review_ok" | "execution_gate_approval_review_denied",
  approvedCount: number
): string[] {
  if (sourceStatus !== "execution_gate_approval_review_ok") {
    return [
      "Return to Phase 2J.32 fixture manifest file creation dry-run execution gate review before approval gating.",
      "Do not create, export, import, write, save, persist, or execute any manifest."
    ];
  }
  if (approvedCount > 0) {
    return [
      "Treat approved rows as future fixture-manifest file creation dry-run execution gate approval/review eligibility only.",
      "Keep fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval_allowed as future eligibility only.",
      "Do not write production manifests, fixture manifest files, draft manifest files, or real metadata stores."
    ];
  }
  return [
    "Keep all rows in approval review until owner approval is explicit and complete.",
    "Do not create, export, import, write, save, persist, or execute any manifest."
  ];
}

function recommendedAction(status: z.infer<typeof ExecutionGateApprovalReviewApprovalStatusSchema>): string {
  if (status === "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review_approval") {
    return "Keep as future execution gate approval/review eligibility only; do not create or write a fixture manifest now.";
  }
  if (status === "needs_owner_review") return "Collect explicit owner approval before a later approval/review phase.";
  if (status === "incomplete_approval") return "Complete approval metadata before any later approval/review phase.";
  return "Keep blocked and remove duplicate IDs, risky flags, denied actions, unsafe target paths, or blocked upstream rows.";
}

function containsBlockedPathToken(pathValue: string): boolean {
  const lower = pathValue.toLowerCase();
  return ["ssd", "google drive", "gdrive", "storage", "production", "backup", "upload", "render", "publish"].some((token) =>
    lower.includes(token)
  );
}

function countApprovalStatus(
  items: FixtureManifestFileCreationDryRunExecutionGateApprovalReviewApprovalItem[],
  status: z.infer<typeof ExecutionGateApprovalReviewApprovalStatusSchema>
): number {
  return items.filter((item) => item.approval_status === status).length;
}

function summarizeValues(values: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const value of values) summary[value] = (summary[value] || 0) + valueCountIncrement(value);
  return summary;
}

function valueCountIncrement(_value: string): number {
  return 1;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
