import { z } from "zod";
import {
  parseSourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture,
  reviewSourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture,
  type FixtureManifestFileCreationDryRunApprovalItem,
  type SourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture,
  type SourceFolderFixtureManifestFileCreationDryRunApprovalGateOutput
} from "./source-folder-fixture-manifest-file-creation-dry-run-approval-gate.ts";
import {
  parseSourceFolderFixtureManifestFileCreationDryRunReviewFixture,
  type SourceFolderFixtureManifestFileCreationDryRunReviewFixture
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

const EXECUTION_GATE_ID =
  "phase-2j27-source-folder-fixture-manifest-file-creation-dry-run-execution-gate";
const EXECUTION_REVIEW_SCOPE =
  "future_fixture_manifest_file_creation_dry_run_execution_review_only";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const ExecutionGateActionSchema = z.enum([
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
  "draft_manifest_file_create_requested",
  "production_manifest_write_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

const ExecutionGateStatusSchema = z.enum([
  "eligible_for_fixture_manifest_file_creation_dry_run_execution_review",
  "needs_owner_review",
  "incomplete_execution_gate",
  "blocked_execution_gate"
]);

export const SourceFolderFixtureManifestFileCreationDryRunExecutionApprovalRecordSchema = z.object({
  file_creation_plan_item_id: z.string().min(1),
  approval_record_found: z.boolean(),
  owner_approved: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  requested_actions: z.array(ExecutionGateActionSchema).default([])
}).strict();

export const SourceFolderFixtureManifestFileCreationDryRunExecutionGateFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-fixture-manifest-file-creation-dry-run-execution-gate-smoke-v1"),
  mode: z.literal("controlled_fixture_manifest_file_creation_dry_run_execution_gate"),
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
  execution_approval_records: z.array(SourceFolderFixtureManifestFileCreationDryRunExecutionApprovalRecordSchema).min(1),
  notes: z.string().min(1)
}).strict();

export const FixtureManifestFileCreationDryRunExecutionGateItemSchema = z.object({
  file_creation_plan_item_id: z.string().min(1),
  write_plan_item_id: z.string().min(1),
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_file_creation_approval_status: z.string().min(1),
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
  execution_gate_status: ExecutionGateStatusSchema,
  missing_required_fields: z.array(z.string().min(1)),
  missing_approval_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderFixtureManifestFileCreationDryRunExecutionGateOutputSchema = z.object({
  fixture_manifest_file_creation_dry_run_execution_gate_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  source_file_creation_approval_status: z.enum([
    "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate",
    "not_approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate"
  ]),
  reviewed_execution_approval_items: z.number().int().min(0),
  eligible_for_fixture_manifest_file_creation_dry_run_execution_review: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_execution_gate: z.number().int().min(0),
  blocked_execution_gate: z.number().int().min(0),
  execution_gate_items: z.array(FixtureManifestFileCreationDryRunExecutionGateItemSchema),
  execution_policy_findings: z.array(z.string().min(1)),
  duplicate_id_findings: z.array(z.string().min(1)),
  missing_required_field_count: z.number().int().min(0),
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
  fixture_manifest_file_created: z.literal(false),
  fixture_manifest_write_performed: z.literal(false),
  fixture_manifest_file_creation_performed: z.literal(false),
  fixture_manifest_file_creation_execution_performed: z.literal(false),
  production_manifest_write_allowed: z.literal(false),
  manifest_export_allowed: z.literal(false),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderFixtureManifestFileCreationDryRunExecutionApprovalRecord = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunExecutionApprovalRecordSchema
>;
export type SourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunExecutionGateFixtureSchema
>;
export type FixtureManifestFileCreationDryRunExecutionGateItem = z.infer<
  typeof FixtureManifestFileCreationDryRunExecutionGateItemSchema
>;
export type SourceFolderFixtureManifestFileCreationDryRunExecutionGateOutput = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunExecutionGateOutputSchema
>;

export type SourceFolderFixtureManifestFileCreationDryRunExecutionGateBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture;
  gates: SourceFolderFixtureManifestFileCreationDryRunExecutionGateOutput[];
  reviewedExecutionApprovalItems: number;
  eligibleForFixtureManifestFileCreationDryRunExecutionReviewCount: number;
  needsOwnerReviewCount: number;
  incompleteExecutionGateCount: number;
  blockedExecutionGateCount: number;
  duplicateIdFindingsCount: number;
  missingRequiredFieldCount: number;
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
  fixtureManifestFileCreatedCount: number;
  fixtureManifestWritePerformedCount: number;
  fixtureManifestFileCreationPerformedCount: number;
  fixtureManifestFileCreationExecutionPerformedCount: number;
  productionManifestWriteAllowedCount: number;
  manifestExportAllowedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture(
  input: unknown
): SourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture {
  return SourceFolderFixtureManifestFileCreationDryRunExecutionGateFixtureSchema.parse(input);
}

export function reviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture(input: {
  executionGateFixture: SourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture;
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
}): SourceFolderFixtureManifestFileCreationDryRunExecutionGateBatchResult {
  const approvalGateResult = reviewSourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture({
    approvalGateFixture: input.approvalGateFixture,
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
  const gates = approvalGateResult.gates.map((gate) =>
    reviewExecutionGate(gate, input.executionGateFixture.execution_approval_records)
  );

  return {
    provider: "fake_content_engine",
    fixture: input.executionGateFixture,
    gates,
    reviewedExecutionApprovalItems: sum(gates.map((gate) => gate.reviewed_execution_approval_items)),
    eligibleForFixtureManifestFileCreationDryRunExecutionReviewCount: sum(
      gates.map((gate) => gate.eligible_for_fixture_manifest_file_creation_dry_run_execution_review)
    ),
    needsOwnerReviewCount: sum(gates.map((gate) => gate.needs_owner_review)),
    incompleteExecutionGateCount: sum(gates.map((gate) => gate.incomplete_execution_gate)),
    blockedExecutionGateCount: sum(gates.map((gate) => gate.blocked_execution_gate)),
    duplicateIdFindingsCount: sum(gates.map((gate) => gate.duplicate_id_findings.length)),
    missingRequiredFieldCount: sum(gates.map((gate) => gate.missing_required_field_count)),
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
    fixtureManifestFileCreatedCount: gates.filter((gate) => gate.fixture_manifest_file_created).length,
    fixtureManifestWritePerformedCount: gates.filter((gate) => gate.fixture_manifest_write_performed).length,
    fixtureManifestFileCreationPerformedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_performed
    ).length,
    fixtureManifestFileCreationExecutionPerformedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_execution_performed
    ).length,
    productionManifestWriteAllowedCount: gates.filter((gate) => gate.production_manifest_write_allowed).length,
    manifestExportAllowedCount: gates.filter((gate) => gate.manifest_export_allowed).length,
    recommendedOwnerActionsCount: sum(gates.map((gate) => gate.recommended_owner_actions.length)),
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture(input: {
  executionGateFixtureInput: unknown;
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
}): SourceFolderFixtureManifestFileCreationDryRunExecutionGateBatchResult {
  return reviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture({
    executionGateFixture: parseSourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture(
      input.executionGateFixtureInput
    ),
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

function reviewExecutionGate(
  approvalGate: SourceFolderFixtureManifestFileCreationDryRunApprovalGateOutput,
  records: SourceFolderFixtureManifestFileCreationDryRunExecutionApprovalRecord[]
): SourceFolderFixtureManifestFileCreationDryRunExecutionGateOutput {
  const duplicateIds = duplicateSuggestedFootageIds(approvalGate.approval_items);
  const sourceApproved = approvalGate.approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate > 0;
  const executionGateItems = approvalGate.approval_items.map((item) =>
    executionGateItemForApproval(
      item,
      records.find((record) => record.file_creation_plan_item_id === item.file_creation_plan_item_id),
      duplicateIds,
      approvalGate
    )
  );

  return SourceFolderFixtureManifestFileCreationDryRunExecutionGateOutputSchema.parse({
    fixture_manifest_file_creation_dry_run_execution_gate_id: `${EXECUTION_GATE_ID}-${approvalGate.source_id}`,
    source_id: approvalGate.source_id,
    source_label: approvalGate.source_label,
    source_root: approvalGate.source_root,
    dry_run: approvalGate.dry_run,
    read_only: approvalGate.read_only,
    source_file_creation_approval_status: sourceApproved
      ? "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate"
      : "not_approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate",
    reviewed_execution_approval_items: executionGateItems.length,
    eligible_for_fixture_manifest_file_creation_dry_run_execution_review: countExecutionStatus(
      executionGateItems,
      "eligible_for_fixture_manifest_file_creation_dry_run_execution_review"
    ),
    needs_owner_review: countExecutionStatus(executionGateItems, "needs_owner_review"),
    incomplete_execution_gate: countExecutionStatus(executionGateItems, "incomplete_execution_gate"),
    blocked_execution_gate: countExecutionStatus(executionGateItems, "blocked_execution_gate"),
    execution_gate_items: executionGateItems,
    execution_policy_findings: executionPolicyFindings(approvalGate, sourceApproved),
    duplicate_id_findings: [...duplicateIds].map((id) => `duplicate_suggested_footage_id:${id}`),
    missing_required_field_count: sum(executionGateItems.map((item) => item.missing_required_fields.length)),
    missing_approval_fields: summarizeValues(executionGateItems.flatMap((item) => item.missing_approval_fields)),
    blocked_reason_summary: summarizeValues(executionGateItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(executionGateItems, records),
    recommended_owner_actions: recommendedOwnerActions(executionGateItems, sourceApproved),
    next_safe_actions: nextSafeActions(executionGateItems),
    target_fixture_manifest_path:
      executionGateItems.find(
        (item) => item.execution_gate_status === "eligible_for_fixture_manifest_file_creation_dry_run_execution_review"
      )?.target_fixture_manifest_path ?? approvalGate.target_fixture_manifest_path,
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    fixture_manifest_write_allowed: approvalGate.fixture_manifest_write_allowed,
    fixture_manifest_file_creation_gate_allowed: approvalGate.fixture_manifest_file_creation_gate_allowed,
    fixture_manifest_file_creation_dry_run_allowed: approvalGate.fixture_manifest_file_creation_dry_run_allowed,
    fixture_manifest_file_creation_execution_gate_allowed:
      approvalGate.fixture_manifest_file_creation_execution_gate_allowed,
    fixture_manifest_file_creation_dry_run_execution_review_allowed: executionGateItems.some(
      (item) =>
        item.execution_gate_status === "eligible_for_fixture_manifest_file_creation_dry_run_execution_review"
    ),
    fixture_manifest_file_created: false,
    fixture_manifest_write_performed: false,
    fixture_manifest_file_creation_performed: false,
    fixture_manifest_file_creation_execution_performed: false,
    production_manifest_write_allowed: false,
    manifest_export_allowed: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function executionGateItemForApproval(
  item: FixtureManifestFileCreationDryRunApprovalItem,
  record: SourceFolderFixtureManifestFileCreationDryRunExecutionApprovalRecord | undefined,
  duplicateIds: Set<string>,
  approvalGate: SourceFolderFixtureManifestFileCreationDryRunApprovalGateOutput
): FixtureManifestFileCreationDryRunExecutionGateItem {
  const executionRecord = record ?? defaultExecutionApprovalRecord(item.file_creation_plan_item_id);
  const missingRequiredFields = missingRequiredFieldsFor(item);
  const missingApprovalFields = missingApprovalFieldsFor(executionRecord);
  const blockingReasons = blockingReasonsFor(item, executionRecord, duplicateIds, approvalGate);
  const status = executionGateStatusFor(item, missingRequiredFields, missingApprovalFields, blockingReasons);

  return FixtureManifestFileCreationDryRunExecutionGateItemSchema.parse({
    file_creation_plan_item_id: item.file_creation_plan_item_id,
    write_plan_item_id: item.write_plan_item_id,
    manifest_item_id: item.manifest_item_id,
    suggested_footage_id: item.suggested_footage_id,
    filename: item.filename,
    relative_path: item.relative_path,
    source_file_creation_approval_status: item.approval_status,
    product_family: item.product_family,
    visual_type: item.visual_type,
    process_stage: item.process_stage,
    orientation: item.orientation,
    school_level: item.school_level,
    color_variant: item.color_variant,
    content_tags: item.content_tags,
    risk_flags: item.risk_flags,
    target_fixture_manifest_path: item.target_fixture_manifest_path,
    owner_approved: executionRecord.owner_approved,
    approval_record_found: executionRecord.approval_record_found,
    approved_by: executionRecord.approved_by,
    approved_at: executionRecord.approved_at,
    approval_scope: executionRecord.approval_scope,
    execution_gate_status: status,
    missing_required_fields: missingRequiredFields,
    missing_approval_fields: missingApprovalFields,
    blocking_reasons: blockingReasons,
    review_notes: [
      `Source file creation approval status: ${item.approval_status}.`,
      `Fixture manifest file creation dry-run execution gate status: ${status}.`,
      "Eligibility is for a later dry-run execution review only; no fixture manifest file is created, written, exported, imported, saved, or persisted."
    ],
    recommended_action: recommendedAction(status)
  });
}

function defaultExecutionApprovalRecord(
  fileCreationPlanItemId: string
): SourceFolderFixtureManifestFileCreationDryRunExecutionApprovalRecord {
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

function missingRequiredFieldsFor(item: FixtureManifestFileCreationDryRunApprovalItem): string[] {
  const missing: string[] = [];
  if (!item.product_family) missing.push("product_family");
  if (!item.visual_type) missing.push("visual_type");
  if (!item.process_stage) missing.push("process_stage");
  if (!item.orientation) missing.push("orientation");
  if (!item.filename) missing.push("filename");
  if (!item.relative_path) missing.push("relative_path");
  if (!item.target_fixture_manifest_path) missing.push("target_fixture_manifest_path");
  return missing;
}

function missingApprovalFieldsFor(record: SourceFolderFixtureManifestFileCreationDryRunExecutionApprovalRecord): string[] {
  const missing: string[] = [];
  if (!record.approval_record_found) missing.push("approval_record_found");
  if (!record.owner_approved) missing.push("owner_approved");
  if (!record.approved_by) missing.push("approved_by");
  if (!record.approved_at) missing.push("approved_at");
  if (!record.approval_scope) missing.push("approval_scope");
  if (record.approval_scope && record.approval_scope !== EXECUTION_REVIEW_SCOPE) {
    missing.push("approval_scope_future_fixture_manifest_file_creation_dry_run_execution_review_only");
  }
  return missing;
}

function blockingReasonsFor(
  item: FixtureManifestFileCreationDryRunApprovalItem,
  record: SourceFolderFixtureManifestFileCreationDryRunExecutionApprovalRecord,
  duplicateIds: Set<string>,
  approvalGate: SourceFolderFixtureManifestFileCreationDryRunApprovalGateOutput
): string[] {
  const reasons: string[] = [];
  if (approvalGate.source_root !== SAFE_FIXTURE_ROOT) reasons.push("source_root_not_safe_fixture");
  if (!approvalGate.dry_run) reasons.push("dry_run_false_blocked");
  if (!approvalGate.read_only) reasons.push("read_only_false_blocked");
  if (item.approval_status === "blocked_approval") reasons.push("source_file_creation_approval_blocked_cannot_be_upgraded");
  if (item.approval_status === "incomplete_approval") reasons.push("source_file_creation_approval_incomplete_cannot_be_upgraded");
  if (duplicateIds.has(item.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of item.blocking_reasons) reasons.push(`source_approval_${reason}`);
  for (const riskFlag of item.risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const action of record.requested_actions) reasons.push(`denied_action_${action}`);
  if (item.relative_path.includes("..")) reasons.push("unsafe_relative_path_blocked");
  if (!item.relative_path.startsWith(SAFE_FIXTURE_ROOT)) reasons.push("relative_path_not_safe_fixture");
  if (item.target_fixture_manifest_path && containsBlockedPathToken(item.target_fixture_manifest_path)) {
    reasons.push("target_fixture_manifest_path_blocked_metadata_only");
  }
  if (item.target_fixture_manifest_path && !item.target_fixture_manifest_path.startsWith("packages/content-engine/fixtures/")) {
    reasons.push("target_fixture_manifest_path_not_safe_repo_fixture");
  }
  return reasons;
}

function executionGateStatusFor(
  item: FixtureManifestFileCreationDryRunApprovalItem,
  missingRequiredFields: string[],
  missingApprovalFields: string[],
  blockingReasons: string[]
): z.infer<typeof ExecutionGateStatusSchema> {
  if (item.approval_status === "incomplete_approval") return "incomplete_execution_gate";
  if (missingRequiredFields.length > 0) return "incomplete_execution_gate";
  if (blockingReasons.length > 0) return "blocked_execution_gate";
  if (item.approval_status === "needs_owner_review") return "needs_owner_review";
  if (missingApprovalFields.length > 0) {
    if (
      item.approval_status === "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate" &&
      missingApprovalFields.includes("owner_approved")
    ) {
      return "needs_owner_review";
    }
    return "incomplete_execution_gate";
  }
  if (item.approval_status !== "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate") {
    return "blocked_execution_gate";
  }
  return "eligible_for_fixture_manifest_file_creation_dry_run_execution_review";
}

function duplicateSuggestedFootageIds(items: FixtureManifestFileCreationDryRunApprovalItem[]): Set<string> {
  const duplicateIds = new Set<string>();
  for (const item of items) {
    if (item.blocking_reasons.includes("duplicate_suggested_footage_id_blocked")) {
      duplicateIds.add(item.suggested_footage_id);
    }
  }
  return duplicateIds;
}

function executionPolicyFindings(
  approvalGate: SourceFolderFixtureManifestFileCreationDryRunApprovalGateOutput,
  sourceApproved: boolean
): string[] {
  const findings = [
    "Phase 2J.27 is execution-gate only; it must not create, write, import, export, persist, save, or execute manifests.",
    "fixture_manifest_file_creation_dry_run_execution_review_allowed is future review eligibility only."
  ];
  if (!sourceApproved) {
    findings.push("Only Phase 2J.26 approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate rows may become eligible.");
  }
  if (approvalGate.source_root !== SAFE_FIXTURE_ROOT) findings.push("source_root_not_safe_fixture");
  return findings;
}

function recommendedOwnerActions(
  items: FixtureManifestFileCreationDryRunExecutionGateItem[],
  sourceApproved: boolean
): string[] {
  const actions = [
    "Review eligible_for_fixture_manifest_file_creation_dry_run_execution_review rows before any later review phase.",
    "Do not create, write, export, import, save, persist, or execute any manifest in Phase 2J.27."
  ];
  if (!sourceApproved) {
    actions.push("Keep non-approved Phase 2J.26 cases blocked until upstream approval is explicit and complete.");
  }
  if (items.some((item) => item.execution_gate_status === "needs_owner_review")) {
    actions.push("Collect explicit owner approval for future dry-run execution review before upgrading any item.");
  }
  if (items.some((item) => item.execution_gate_status === "incomplete_execution_gate")) {
    actions.push("Complete required fields, approval metadata, and safe fixture target path strings.");
  }
  if (items.some((item) => item.execution_gate_status === "blocked_execution_gate")) {
    actions.push("Keep duplicate IDs, blocked upstream approvals, risky flags, unsafe paths, and denied actions blocked.");
  }
  return actions;
}

function nextSafeActions(items: FixtureManifestFileCreationDryRunExecutionGateItem[]): string[] {
  if (
    items.some(
      (item) =>
        item.execution_gate_status === "eligible_for_fixture_manifest_file_creation_dry_run_execution_review"
    )
  ) {
    return [
      "Treat eligible rows as future dry-run execution review eligibility only.",
      "Keep all manifest creation, write, import, export, render, upload, and publish behavior disabled.",
      "Proceed only to a later review phase that evaluates in-memory fixture metadata."
    ];
  }
  return [
    "Return to Phase 2J.26 approval gate data before any later execution review.",
    "Do not create, export, import, write, save, persist, or execute any manifest."
  ];
}

function recommendedAction(status: z.infer<typeof ExecutionGateStatusSchema>): string {
  if (status === "eligible_for_fixture_manifest_file_creation_dry_run_execution_review") {
    return "Keep as future dry-run execution review eligibility only; do not create or write a fixture manifest now.";
  }
  if (status === "needs_owner_review") return "Collect explicit owner approval for future dry-run execution review.";
  if (status === "incomplete_execution_gate") return "Complete required fields, safe fixture target path, and approval metadata.";
  return "Keep blocked and remove duplicate IDs, risky flags, denied actions, unsafe target paths, or blocked upstream approvals.";
}

function summarizeDeniedActions(
  items: FixtureManifestFileCreationDryRunExecutionGateItem[],
  records: SourceFolderFixtureManifestFileCreationDryRunExecutionApprovalRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.file_creation_plan_item_id));
  return summarizeValues(records.filter((record) => itemIds.has(record.file_creation_plan_item_id)).flatMap((record) => record.requested_actions));
}

function containsBlockedPathToken(pathValue: string): boolean {
  const lower = pathValue.toLowerCase();
  return ["ssd", "google drive", "gdrive", "storage", "production", "backup", "upload", "render", "publish"].some((token) =>
    lower.includes(token)
  );
}

function countExecutionStatus(
  items: FixtureManifestFileCreationDryRunExecutionGateItem[],
  status: z.infer<typeof ExecutionGateStatusSchema>
): number {
  return items.filter((item) => item.execution_gate_status === status).length;
}

function summarizeValues(values: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const value of values) summary[value] = (summary[value] || 0) + 1;
  return summary;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
