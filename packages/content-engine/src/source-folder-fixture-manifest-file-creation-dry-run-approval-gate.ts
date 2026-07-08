import { z } from "zod";
import {
  parseSourceFolderFixtureManifestFileCreationDryRunReviewFixture,
  reviewSourceFolderFixtureManifestFileCreationDryRunReviewFixture,
  type FixtureManifestFileCreationPlanItem,
  type SourceFolderFixtureManifestFileCreationDryRunReviewFixture,
  type SourceFolderFixtureManifestFileCreationDryRunReviewOutput
} from "./source-folder-fixture-manifest-file-creation-dry-run-review.ts";
import {
  parseSourceFolderFixtureManifestFileCreationGateFixture,
  type SourceFolderFixtureManifestFileCreationGateFixture
} from "./source-folder-fixture-manifest-file-creation-gate.ts";
import {
  parseSourceFolderFixtureManifestWriteDryRunApprovalGateFixture,
  type SourceFolderFixtureManifestWriteDryRunApprovalGateFixture
} from "./source-folder-fixture-manifest-write-dry-run-approval-gate.ts";
import {
  parseSourceFolderFixtureManifestWriteDryRunReviewFixture,
  type SourceFolderFixtureManifestWriteDryRunReviewFixture
} from "./source-folder-fixture-manifest-write-dry-run-review.ts";
import {
  parseSourceFolderFixtureManifestWriteGateFixture,
  type SourceFolderFixtureManifestWriteGateFixture
} from "./source-folder-fixture-manifest-write-gate.ts";
import {
  parseSourceFolderDraftManifestCreationDryRunApprovalGateFixture,
  type SourceFolderDraftManifestCreationDryRunApprovalGateFixture
} from "./source-folder-draft-manifest-creation-dry-run-approval-gate.ts";
import {
  parseSourceFolderDraftManifestCreationDryRunReviewFixture,
  type SourceFolderDraftManifestCreationDryRunReviewFixture
} from "./source-folder-draft-manifest-creation-dry-run-review.ts";
import {
  parseSourceFolderDraftManifestCreationDryRunGateFixture,
  type SourceFolderDraftManifestCreationDryRunGateFixture
} from "./source-folder-draft-manifest-creation-dry-run-gate.ts";
import {
  parseSourceFolderDraftManifestApprovalGateFixture,
  type SourceFolderDraftManifestApprovalGateFixture
} from "./source-folder-draft-manifest-approval-gate.ts";
import {
  parseSourceFolderDraftManifestReviewFixture,
  type SourceFolderDraftManifestReviewFixture
} from "./source-folder-draft-manifest-review.ts";
import {
  parseSourceFolderMetadataEnrichmentApprovalGateFixture,
  type SourceFolderMetadataEnrichmentApprovalGateFixture
} from "./source-folder-metadata-enrichment-approval-gate.ts";
import {
  parseSourceFolderMetadataEnrichmentReviewFixture,
  type SourceFolderMetadataEnrichmentReviewFixture
} from "./source-folder-metadata-enrichment-review.ts";
import {
  parseSourceFolderListingReviewFixture,
  type SourceFolderListingReviewFixture
} from "./source-folder-listing-review.ts";
import {
  parseSourceFolderListingApprovalGateFixture,
  type SourceFolderListingApprovalGateFixture
} from "./source-folder-listing-approval-gate.ts";

const FIXTURE_MANIFEST_FILE_CREATION_DRY_RUN_APPROVAL_GATE_ID =
  "phase-2j26-source-folder-fixture-manifest-file-creation-dry-run-approval-gate";
const FUTURE_FIXTURE_MANIFEST_FILE_CREATION_DRY_RUN_EXECUTION_GATE_SCOPE =
  "future_fixture_manifest_file_creation_dry_run_execution_gate_review_only";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const FixtureManifestFileCreationDryRunApprovalActionSchema = z.enum([
  "metadata_write_requested",
  "metadata_import_requested",
  "manifest_write_requested",
  "manifest_import_requested",
  "manifest_export_requested",
  "fixture_manifest_write_requested",
  "fixture_manifest_file_create_requested",
  "fixture_manifest_file_creation_gate_execute_requested",
  "fixture_manifest_file_creation_execution_gate_execute_requested",
  "draft_manifest_file_create_requested",
  "production_manifest_write_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

const FixtureManifestFileCreationDryRunApprovalStatusSchema = z.enum([
  "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate",
  "needs_owner_review",
  "incomplete_approval",
  "blocked_approval"
]);

export const SourceFolderFixtureManifestFileCreationDryRunApprovalRecordSchema = z.object({
  file_creation_plan_item_id: z.string().min(1),
  approval_record_found: z.boolean(),
  owner_approved: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  requested_actions: z.array(FixtureManifestFileCreationDryRunApprovalActionSchema).default([])
}).strict();

export const SourceFolderFixtureManifestFileCreationDryRunApprovalGateFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-fixture-manifest-file-creation-dry-run-approval-gate-smoke-v1"),
  mode: z.literal("controlled_fixture_manifest_file_creation_dry_run_approval_gate"),
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
  file_creation_dry_run_approval_records: z.array(SourceFolderFixtureManifestFileCreationDryRunApprovalRecordSchema).min(1),
  notes: z.string().min(1)
}).strict();

export const FixtureManifestFileCreationDryRunApprovalItemSchema = z.object({
  file_creation_plan_item_id: z.string().min(1),
  write_plan_item_id: z.string().min(1),
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_file_creation_plan_status: z.enum([
    "file_creation_plan_ok",
    "needs_owner_review",
    "incomplete_file_creation_plan",
    "blocked_file_creation_plan"
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
  approval_status: FixtureManifestFileCreationDryRunApprovalStatusSchema,
  missing_approval_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderFixtureManifestFileCreationDryRunApprovalGateOutputSchema = z.object({
  fixture_manifest_file_creation_dry_run_approval_gate_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  source_file_creation_plan_status: z.enum(["file_creation_plan_reviewable", "file_creation_plan_denied"]),
  reviewed_file_creation_plan_items: z.number().int().min(0),
  approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_approval: z.number().int().min(0),
  blocked_approval: z.number().int().min(0),
  approval_items: z.array(FixtureManifestFileCreationDryRunApprovalItemSchema),
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
  fixture_manifest_file_created: z.literal(false),
  fixture_manifest_write_performed: z.literal(false),
  fixture_manifest_file_creation_performed: z.literal(false),
  production_manifest_write_allowed: z.literal(false),
  manifest_export_allowed: z.literal(false),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderFixtureManifestFileCreationDryRunApprovalRecord = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunApprovalRecordSchema
>;
export type SourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunApprovalGateFixtureSchema
>;
export type FixtureManifestFileCreationDryRunApprovalItem = z.infer<
  typeof FixtureManifestFileCreationDryRunApprovalItemSchema
>;
export type SourceFolderFixtureManifestFileCreationDryRunApprovalGateOutput = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunApprovalGateOutputSchema
>;

export type SourceFolderFixtureManifestFileCreationDryRunApprovalGateBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture;
  gates: SourceFolderFixtureManifestFileCreationDryRunApprovalGateOutput[];
  reviewedFileCreationPlanItems: number;
  approvedForFutureFixtureManifestFileCreationDryRunExecutionGateCount: number;
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
  fixtureManifestFileCreatedCount: number;
  fixtureManifestWritePerformedCount: number;
  fixtureManifestFileCreationPerformedCount: number;
  productionManifestWriteAllowedCount: number;
  manifestExportAllowedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture(
  input: unknown
): SourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture {
  return SourceFolderFixtureManifestFileCreationDryRunApprovalGateFixtureSchema.parse(input);
}

export function reviewSourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture(input: {
  approvalGateFixture: SourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture;
  fileCreationDryRunReviewFixture: SourceFolderFixtureManifestFileCreationDryRunReviewFixture;
  fileCreationGateFixture: SourceFolderFixtureManifestFileCreationGateFixture;
  fileCreationApprovalGateFixture: SourceFolderFixtureManifestWriteDryRunApprovalGateFixture;
  writeDryRunReviewFixture: SourceFolderFixtureManifestWriteDryRunReviewFixture;
  writeGateFixture: SourceFolderFixtureManifestWriteGateFixture;
  creationApprovalGateFixture: SourceFolderDraftManifestCreationDryRunApprovalGateFixture;
  creationReviewFixture: SourceFolderDraftManifestCreationDryRunReviewFixture;
  creationGateFixture: SourceFolderDraftManifestCreationDryRunGateFixture;
  draftManifestApprovalGateFixture: SourceFolderDraftManifestApprovalGateFixture;
  draftManifestReviewFixture: SourceFolderDraftManifestReviewFixture;
  metadataEnrichmentApprovalGateFixture: SourceFolderMetadataEnrichmentApprovalGateFixture;
  enrichmentFixture: SourceFolderMetadataEnrichmentReviewFixture;
  listingReviewFixture: SourceFolderListingReviewFixture;
  listingGateFixture: SourceFolderListingApprovalGateFixture;
}): SourceFolderFixtureManifestFileCreationDryRunApprovalGateBatchResult {
  const fileCreationDryRunReviewResult = reviewSourceFolderFixtureManifestFileCreationDryRunReviewFixture({
    fileCreationDryRunReviewFixture: input.fileCreationDryRunReviewFixture,
    fileCreationGateFixture: input.fileCreationGateFixture,
    fileCreationApprovalGateFixture: input.fileCreationApprovalGateFixture,
    writeDryRunReviewFixture: input.writeDryRunReviewFixture,
    writeGateFixture: input.writeGateFixture,
    creationApprovalGateFixture: input.creationApprovalGateFixture,
    creationReviewFixture: input.creationReviewFixture,
    creationGateFixture: input.creationGateFixture,
    draftManifestApprovalGateFixture: input.draftManifestApprovalGateFixture,
    draftManifestReviewFixture: input.draftManifestReviewFixture,
    metadataEnrichmentApprovalGateFixture: input.metadataEnrichmentApprovalGateFixture,
    enrichmentFixture: input.enrichmentFixture,
    listingReviewFixture: input.listingReviewFixture,
    listingGateFixture: input.listingGateFixture
  });
  const gates = fileCreationDryRunReviewResult.reviews.map((review) =>
    reviewFileCreationDryRunApprovalGate(review, input.approvalGateFixture.file_creation_dry_run_approval_records)
  );

  return {
    provider: "fake_content_engine",
    fixture: input.approvalGateFixture,
    gates,
    reviewedFileCreationPlanItems: sum(gates.map((gate) => gate.reviewed_file_creation_plan_items)),
    approvedForFutureFixtureManifestFileCreationDryRunExecutionGateCount: sum(
      gates.map((gate) => gate.approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate)
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
    fixtureManifestFileCreatedCount: gates.filter((gate) => gate.fixture_manifest_file_created).length,
    fixtureManifestWritePerformedCount: gates.filter((gate) => gate.fixture_manifest_write_performed).length,
    fixtureManifestFileCreationPerformedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_performed
    ).length,
    productionManifestWriteAllowedCount: gates.filter((gate) => gate.production_manifest_write_allowed).length,
    manifestExportAllowedCount: gates.filter((gate) => gate.manifest_export_allowed).length,
    recommendedOwnerActionsCount: sum(gates.map((gate) => gate.recommended_owner_actions.length)),
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture(input: {
  approvalGateFixtureInput: unknown;
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
}): SourceFolderFixtureManifestFileCreationDryRunApprovalGateBatchResult {
  return reviewSourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture({
    approvalGateFixture: parseSourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture(
      input.approvalGateFixtureInput
    ),
    fileCreationDryRunReviewFixture: parseSourceFolderFixtureManifestFileCreationDryRunReviewFixture(
      input.fileCreationDryRunReviewFixtureInput
    ),
    fileCreationGateFixture: parseSourceFolderFixtureManifestFileCreationGateFixture(
      input.fileCreationGateFixtureInput
    ),
    fileCreationApprovalGateFixture: parseSourceFolderFixtureManifestWriteDryRunApprovalGateFixture(
      input.fileCreationApprovalGateFixtureInput
    ),
    writeDryRunReviewFixture: parseSourceFolderFixtureManifestWriteDryRunReviewFixture(
      input.writeDryRunReviewFixtureInput
    ),
    writeGateFixture: parseSourceFolderFixtureManifestWriteGateFixture(input.writeGateFixtureInput),
    creationApprovalGateFixture: parseSourceFolderDraftManifestCreationDryRunApprovalGateFixture(
      input.creationApprovalGateFixtureInput
    ),
    creationReviewFixture: parseSourceFolderDraftManifestCreationDryRunReviewFixture(input.creationReviewFixtureInput),
    creationGateFixture: parseSourceFolderDraftManifestCreationDryRunGateFixture(input.creationGateFixtureInput),
    draftManifestApprovalGateFixture: parseSourceFolderDraftManifestApprovalGateFixture(
      input.draftManifestApprovalGateFixtureInput
    ),
    draftManifestReviewFixture: parseSourceFolderDraftManifestReviewFixture(input.draftManifestReviewFixtureInput),
    metadataEnrichmentApprovalGateFixture: parseSourceFolderMetadataEnrichmentApprovalGateFixture(
      input.metadataEnrichmentApprovalGateFixtureInput
    ),
    enrichmentFixture: parseSourceFolderMetadataEnrichmentReviewFixture(input.enrichmentFixtureInput),
    listingReviewFixture: parseSourceFolderListingReviewFixture(input.listingReviewFixtureInput),
    listingGateFixture: parseSourceFolderListingApprovalGateFixture(input.listingGateFixtureInput)
  });
}

export function reviewFileCreationDryRunApprovalGate(
  fileCreationReview: SourceFolderFixtureManifestFileCreationDryRunReviewOutput,
  approvalRecords: SourceFolderFixtureManifestFileCreationDryRunApprovalRecord[]
): SourceFolderFixtureManifestFileCreationDryRunApprovalGateOutput {
  const sourceStatus = fileCreationReview.fixture_manifest_file_creation_dry_run_allowed
    ? "file_creation_plan_reviewable"
    : "file_creation_plan_denied";
  const duplicateIds = duplicateSuggestedFootageIds(fileCreationReview.file_creation_plan_item_reviews);
  const approvalItems = sourceStatus === "file_creation_plan_reviewable"
    ? fileCreationReview.file_creation_plan_item_reviews.map((item) =>
        approvalItemForPlan(
          item,
          approvalRecords.find((record) => record.file_creation_plan_item_id === item.file_creation_plan_item_id),
          duplicateIds
        )
      )
    : [];

  return SourceFolderFixtureManifestFileCreationDryRunApprovalGateOutputSchema.parse({
    fixture_manifest_file_creation_dry_run_approval_gate_id:
      `${FIXTURE_MANIFEST_FILE_CREATION_DRY_RUN_APPROVAL_GATE_ID}-${fileCreationReview.source_id}`,
    source_id: fileCreationReview.source_id,
    source_label: fileCreationReview.source_label,
    source_root: fileCreationReview.source_root,
    dry_run: fileCreationReview.dry_run,
    read_only: fileCreationReview.read_only,
    source_file_creation_plan_status: sourceStatus,
    reviewed_file_creation_plan_items: sourceStatus === "file_creation_plan_reviewable"
      ? fileCreationReview.file_creation_plan_item_reviews.length
      : 0,
    approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate: countApprovalStatus(
      approvalItems,
      "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate"
    ),
    needs_owner_review: countApprovalStatus(approvalItems, "needs_owner_review"),
    incomplete_approval: countApprovalStatus(approvalItems, "incomplete_approval"),
    blocked_approval: countApprovalStatus(approvalItems, "blocked_approval"),
    approval_items: approvalItems,
    approval_policy_findings: approvalPolicyFindings(sourceStatus, fileCreationReview),
    duplicate_id_findings: [...duplicateIds].map((id) => `duplicate_suggested_footage_id:${id}`),
    missing_approval_fields: summarizeValues(approvalItems.flatMap((item) => item.missing_approval_fields)),
    blocked_reason_summary: summarizeValues(approvalItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(approvalItems, approvalRecords),
    recommended_owner_actions: recommendedOwnerActions(sourceStatus, approvalItems, duplicateIds.size),
    next_safe_actions: nextSafeActions(
      sourceStatus,
      countApprovalStatus(approvalItems, "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate")
    ),
    target_fixture_manifest_path:
      approvalItems.find(
        (item) => item.approval_status === "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate"
      )?.target_fixture_manifest_path ?? fileCreationReview.target_fixture_manifest_path,
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    fixture_manifest_write_allowed: fileCreationReview.fixture_manifest_write_allowed,
    fixture_manifest_file_creation_gate_allowed: fileCreationReview.fixture_manifest_file_creation_gate_allowed,
    fixture_manifest_file_creation_dry_run_allowed: fileCreationReview.fixture_manifest_file_creation_dry_run_allowed,
    fixture_manifest_file_creation_execution_gate_allowed: approvalItems.some(
      (item) => item.approval_status === "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate"
    ),
    fixture_manifest_file_created: false,
    fixture_manifest_write_performed: false,
    fixture_manifest_file_creation_performed: false,
    production_manifest_write_allowed: false,
    manifest_export_allowed: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function approvalItemForPlan(
  item: FixtureManifestFileCreationPlanItem,
  record: SourceFolderFixtureManifestFileCreationDryRunApprovalRecord | undefined,
  duplicateIds: Set<string>
): FixtureManifestFileCreationDryRunApprovalItem {
  const approvalRecord = record ?? defaultApprovalRecord(item.file_creation_plan_item_id);
  const missingApprovalFields = missingApprovalFieldsFor(approvalRecord);
  const blockingReasons = blockingReasonsFor(item, approvalRecord, duplicateIds);
  const status = approvalStatusFor(item, approvalRecord, missingApprovalFields, blockingReasons);

  return FixtureManifestFileCreationDryRunApprovalItemSchema.parse({
    file_creation_plan_item_id: item.file_creation_plan_item_id,
    write_plan_item_id: item.write_plan_item_id,
    manifest_item_id: item.manifest_item_id,
    suggested_footage_id: item.suggested_footage_id,
    filename: item.filename,
    relative_path: item.relative_path,
    source_file_creation_plan_status: item.file_creation_plan_status,
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
      `Source file creation plan status: ${item.file_creation_plan_status}.`,
      `Fixture manifest file creation dry-run approval gate status: ${status}.`,
      "Approval is future execution-gate eligibility only; no fixture manifest file is created, written, exported, imported, saved, or persisted."
    ],
    recommended_action: recommendedAction(status)
  });
}

function defaultApprovalRecord(
  fileCreationPlanItemId: string
): SourceFolderFixtureManifestFileCreationDryRunApprovalRecord {
  return {
    file_creation_plan_item_id: fileCreationPlanItemId,
    approval_record_found: false,
    owner_approved: false,
    approved_by: null,
    approved_at: null,
    approval_scope: null,
    requested_actions: []
  };
}

function missingApprovalFieldsFor(record: SourceFolderFixtureManifestFileCreationDryRunApprovalRecord): string[] {
  const missing: string[] = [];
  if (!record.approval_record_found) missing.push("approval_record_found");
  if (!record.owner_approved) missing.push("owner_approved");
  if (!record.approved_by) missing.push("approved_by");
  if (!record.approved_at) missing.push("approved_at");
  if (!record.approval_scope) missing.push("approval_scope");
  if (
    record.approval_scope &&
    record.approval_scope !== FUTURE_FIXTURE_MANIFEST_FILE_CREATION_DRY_RUN_EXECUTION_GATE_SCOPE
  ) {
    missing.push("approval_scope_future_fixture_manifest_file_creation_dry_run_execution_gate_review_only");
  }
  return missing;
}

function blockingReasonsFor(
  item: FixtureManifestFileCreationPlanItem,
  record: SourceFolderFixtureManifestFileCreationDryRunApprovalRecord,
  duplicateIds: Set<string>
): string[] {
  const reasons: string[] = [];
  if (item.file_creation_plan_status === "blocked_file_creation_plan") reasons.push("source_file_creation_plan_blocked_cannot_be_upgraded");
  if (item.file_creation_plan_status === "incomplete_file_creation_plan") reasons.push("source_file_creation_plan_incomplete_cannot_be_upgraded");
  if (duplicateIds.has(item.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of item.blocking_reasons) reasons.push(`file_creation_plan_${reason}`);
  for (const riskFlag of item.risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const action of record.requested_actions) reasons.push(`denied_action_${action}`);
  if (item.relative_path.includes("..")) reasons.push("unsafe_relative_path_blocked");
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
  item: FixtureManifestFileCreationPlanItem,
  record: SourceFolderFixtureManifestFileCreationDryRunApprovalRecord,
  missingApprovalFields: string[],
  blockingReasons: string[]
): z.infer<typeof FixtureManifestFileCreationDryRunApprovalStatusSchema> {
  if (item.file_creation_plan_status === "incomplete_file_creation_plan") return "incomplete_approval";
  if (blockingReasons.length > 0) return "blocked_approval";
  if (missingApprovalFields.length > 0) {
    if (item.file_creation_plan_status === "file_creation_plan_ok" && !record.approval_record_found) {
      return "needs_owner_review";
    }
    return "incomplete_approval";
  }
  if (item.file_creation_plan_status === "needs_owner_review") return "needs_owner_review";
  if (item.file_creation_plan_status !== "file_creation_plan_ok") return "blocked_approval";
  return "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate";
}

function duplicateSuggestedFootageIds(items: FixtureManifestFileCreationPlanItem[]): Set<string> {
  const duplicateIds = new Set<string>();
  for (const item of items) {
    if (item.blocking_reasons.includes("duplicate_suggested_footage_id_blocked")) {
      duplicateIds.add(item.suggested_footage_id);
    }
  }
  return duplicateIds;
}

function containsBlockedPathToken(pathValue: string): boolean {
  const lower = pathValue.toLowerCase();
  return ["ssd", "google drive", "gdrive", "storage", "production", "backup", "upload", "render", "publish"].some((token) =>
    lower.includes(token)
  );
}

function approvalPolicyFindings(
  sourceStatus: "file_creation_plan_reviewable" | "file_creation_plan_denied",
  review: SourceFolderFixtureManifestFileCreationDryRunReviewOutput
): string[] {
  const findings = [
    "Phase 2J.26 is approval-gate only; it must not create, write, import, export, persist, or save manifests.",
    "fixture_manifest_file_creation_execution_gate_allowed is future execution-gate eligibility only."
  ];
  if (sourceStatus !== "file_creation_plan_reviewable") {
    findings.push("Denied file creation dry-run review cases produce zero approval items.");
  }
  if (review.source_root !== SAFE_FIXTURE_ROOT) findings.push("source_root_not_safe_fixture");
  return findings;
}

function summarizeDeniedActions(
  items: FixtureManifestFileCreationDryRunApprovalItem[],
  records: SourceFolderFixtureManifestFileCreationDryRunApprovalRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.file_creation_plan_item_id));
  return summarizeValues(records.filter((record) => itemIds.has(record.file_creation_plan_item_id)).flatMap((record) => record.requested_actions));
}

function recommendedOwnerActions(
  sourceStatus: "file_creation_plan_reviewable" | "file_creation_plan_denied",
  items: FixtureManifestFileCreationDryRunApprovalItem[],
  duplicateIdCount: number
): string[] {
  if (sourceStatus !== "file_creation_plan_reviewable") {
    return ["Keep denied file creation dry-run review cases blocked; do not create approval items."];
  }
  const actions = [
    "Review approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate rows before any later execution gate.",
    "Do not create, write, export, import, save, or persist any manifest in Phase 2J.26."
  ];
  if (items.some((item) => item.approval_status === "needs_owner_review")) {
    actions.push("Collect explicit owner approval before a later fixture-manifest file creation dry-run execution gate.");
  }
  if (items.some((item) => item.approval_status === "incomplete_approval")) {
    actions.push("Complete approval metadata before any later fixture-manifest file creation dry-run execution gate.");
  }
  if (items.some((item) => item.approval_status === "blocked_approval") || duplicateIdCount > 0) {
    actions.push("Keep duplicate IDs, blocked upstream rows, risky flags, unsafe paths, and denied write/import/export/render/upload/publish requests blocked.");
  }
  return actions;
}

function nextSafeActions(
  sourceStatus: "file_creation_plan_reviewable" | "file_creation_plan_denied",
  approvedCount: number
): string[] {
  if (sourceStatus !== "file_creation_plan_reviewable") {
    return [
      "Return to Phase 2J.25 fixture manifest file creation dry-run review before approval gating.",
      "Do not create, export, import, write, save, or persist any manifest."
    ];
  }
  if (approvedCount > 0) {
    return [
      "Treat approved rows as future fixture-manifest file creation dry-run execution gate eligibility only.",
      "Keep fixture_manifest_file_creation_execution_gate_allowed as future eligibility only.",
      "Do not write production manifests, fixture manifest files, draft manifest files, or real metadata stores."
    ];
  }
  return [
    "Keep all rows in approval review until owner approval is explicit and complete.",
    "Do not create, export, import, write, save, or persist any manifest."
  ];
}

function recommendedAction(status: z.infer<typeof FixtureManifestFileCreationDryRunApprovalStatusSchema>): string {
  if (status === "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate") {
    return "Keep as future execution-gate eligibility only; do not create a fixture manifest now.";
  }
  if (status === "needs_owner_review") return "Collect explicit owner approval before a later execution gate.";
  if (status === "incomplete_approval") return "Complete approval metadata before any later execution gate.";
  return "Keep blocked and remove duplicate IDs, risky flags, denied actions, unsafe target paths, or blocked upstream rows.";
}

function countApprovalStatus(
  items: FixtureManifestFileCreationDryRunApprovalItem[],
  status: z.infer<typeof FixtureManifestFileCreationDryRunApprovalStatusSchema>
): number {
  return items.filter((item) => item.approval_status === status).length;
}

function summarizeValues(values: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const value of values) summary[value] = (summary[value] || 0) + 1;
  return summary;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
