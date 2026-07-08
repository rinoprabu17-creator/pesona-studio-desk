import { z } from "zod";
import {
  parseSourceFolderFixtureManifestWriteDryRunReviewFixture,
  reviewSourceFolderFixtureManifestWriteDryRunReviewFixture,
  type FixtureManifestWritePlanItem,
  type SourceFolderFixtureManifestWriteDryRunReviewFixture,
  type SourceFolderFixtureManifestWriteDryRunReviewOutput
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

const FIXTURE_MANIFEST_WRITE_DRY_RUN_APPROVAL_GATE_ID =
  "phase-2j23-source-folder-fixture-manifest-write-dry-run-approval-gate";
const FUTURE_FIXTURE_MANIFEST_FILE_CREATION_GATE_SCOPE =
  "future_fixture_manifest_file_creation_gate_review_only";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const FixtureManifestWriteDryRunApprovalActionSchema = z.enum([
  "metadata_write_requested",
  "metadata_import_requested",
  "manifest_write_requested",
  "manifest_import_requested",
  "manifest_export_requested",
  "fixture_manifest_write_requested",
  "fixture_manifest_file_create_requested",
  "draft_manifest_file_create_requested",
  "production_manifest_write_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

const FixtureManifestWriteDryRunApprovalStatusSchema = z.enum([
  "approved_for_future_fixture_manifest_file_creation_gate",
  "needs_owner_review",
  "incomplete_approval",
  "blocked_approval"
]);

export const SourceFolderFixtureManifestWriteDryRunApprovalRecordSchema = z.object({
  write_plan_item_id: z.string().min(1),
  approval_record_found: z.boolean(),
  owner_approved: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  requested_actions: z.array(FixtureManifestWriteDryRunApprovalActionSchema).default([])
}).strict();

export const SourceFolderFixtureManifestWriteDryRunApprovalGateFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-fixture-manifest-write-dry-run-approval-gate-smoke-v1"),
  mode: z.literal("controlled_fixture_manifest_write_dry_run_approval_gate"),
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
  approval_records: z.array(SourceFolderFixtureManifestWriteDryRunApprovalRecordSchema).min(1),
  notes: z.string().min(1)
}).strict();

export const FixtureManifestWriteDryRunApprovalItemSchema = z.object({
  write_plan_item_id: z.string().min(1),
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_write_plan_status: z.enum([
    "write_plan_ok",
    "needs_owner_review",
    "incomplete_write_plan",
    "blocked_write_plan"
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
  approval_status: FixtureManifestWriteDryRunApprovalStatusSchema,
  missing_approval_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderFixtureManifestWriteDryRunApprovalGateOutputSchema = z.object({
  fixture_manifest_write_dry_run_approval_gate_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  source_write_plan_status: z.enum(["write_plan_reviewable", "write_plan_denied"]),
  reviewed_write_plan_items: z.number().int().min(0),
  approved_for_future_fixture_manifest_file_creation_gate: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_approval: z.number().int().min(0),
  blocked_approval: z.number().int().min(0),
  approval_items: z.array(FixtureManifestWriteDryRunApprovalItemSchema),
  approval_policy_findings: z.array(z.string().min(1)),
  duplicate_id_findings: z.array(z.string().min(1)),
  missing_approval_fields: z.record(z.string(), z.number().int().min(0)),
  blocked_reason_summary: z.record(z.string(), z.number().int().min(0)),
  denied_action_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  metadata_write_allowed: z.literal(false),
  manifest_write_allowed: z.literal(false),
  fixture_manifest_write_allowed: z.boolean(),
  fixture_manifest_file_created: z.literal(false),
  fixture_manifest_write_performed: z.literal(false),
  fixture_manifest_file_creation_gate_allowed: z.boolean(),
  production_manifest_write_allowed: z.literal(false),
  manifest_export_allowed: z.literal(false),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderFixtureManifestWriteDryRunApprovalRecord = z.infer<
  typeof SourceFolderFixtureManifestWriteDryRunApprovalRecordSchema
>;
export type SourceFolderFixtureManifestWriteDryRunApprovalGateFixture = z.infer<
  typeof SourceFolderFixtureManifestWriteDryRunApprovalGateFixtureSchema
>;
export type FixtureManifestWriteDryRunApprovalItem = z.infer<typeof FixtureManifestWriteDryRunApprovalItemSchema>;
export type SourceFolderFixtureManifestWriteDryRunApprovalGateOutput = z.infer<
  typeof SourceFolderFixtureManifestWriteDryRunApprovalGateOutputSchema
>;

export type SourceFolderFixtureManifestWriteDryRunApprovalGateBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderFixtureManifestWriteDryRunApprovalGateFixture;
  gates: SourceFolderFixtureManifestWriteDryRunApprovalGateOutput[];
  reviewedWritePlanItems: number;
  approvedForFutureFixtureManifestFileCreationGateCount: number;
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
  fixtureManifestFileCreatedCount: number;
  fixtureManifestWritePerformedCount: number;
  fixtureManifestFileCreationGateAllowedCount: number;
  fixtureManifestFileCreationGateAllowed: boolean;
  productionManifestWriteAllowedCount: number;
  manifestExportAllowedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderFixtureManifestWriteDryRunApprovalGateFixture(
  input: unknown
): SourceFolderFixtureManifestWriteDryRunApprovalGateFixture {
  return SourceFolderFixtureManifestWriteDryRunApprovalGateFixtureSchema.parse(input);
}

export function reviewSourceFolderFixtureManifestWriteDryRunApprovalGateFixture(input: {
  approvalGateFixture: SourceFolderFixtureManifestWriteDryRunApprovalGateFixture;
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
}): SourceFolderFixtureManifestWriteDryRunApprovalGateBatchResult {
  const writeDryRunReviewResult = reviewSourceFolderFixtureManifestWriteDryRunReviewFixture({
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
  const gates = writeDryRunReviewResult.reviews.map((review) =>
    reviewWritePlanForFixtureManifestFileCreationGate(review, input.approvalGateFixture.approval_records)
  );

  return {
    provider: "fake_content_engine",
    fixture: input.approvalGateFixture,
    gates,
    reviewedWritePlanItems: sum(gates.map((gate) => gate.reviewed_write_plan_items)),
    approvedForFutureFixtureManifestFileCreationGateCount: sum(
      gates.map((gate) => gate.approved_for_future_fixture_manifest_file_creation_gate)
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
    fixtureManifestFileCreatedCount: gates.filter((gate) => gate.fixture_manifest_file_created).length,
    fixtureManifestWritePerformedCount: gates.filter((gate) => gate.fixture_manifest_write_performed).length,
    fixtureManifestFileCreationGateAllowedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_gate_allowed
    ).length,
    fixtureManifestFileCreationGateAllowed: gates.some((gate) => gate.fixture_manifest_file_creation_gate_allowed),
    productionManifestWriteAllowedCount: gates.filter((gate) => gate.production_manifest_write_allowed).length,
    manifestExportAllowedCount: gates.filter((gate) => gate.manifest_export_allowed).length,
    recommendedOwnerActionsCount: sum(gates.map((gate) => gate.recommended_owner_actions.length)),
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderFixtureManifestWriteDryRunApprovalGateFixture(input: {
  approvalGateFixtureInput: unknown;
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
}): SourceFolderFixtureManifestWriteDryRunApprovalGateBatchResult {
  return reviewSourceFolderFixtureManifestWriteDryRunApprovalGateFixture({
    approvalGateFixture: parseSourceFolderFixtureManifestWriteDryRunApprovalGateFixture(
      input.approvalGateFixtureInput
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

export function reviewWritePlanForFixtureManifestFileCreationGate(
  writePlanReview: SourceFolderFixtureManifestWriteDryRunReviewOutput,
  approvalRecords: SourceFolderFixtureManifestWriteDryRunApprovalRecord[]
): SourceFolderFixtureManifestWriteDryRunApprovalGateOutput {
  const sourceStatus = writePlanReview.fixture_manifest_write_allowed ? "write_plan_reviewable" : "write_plan_denied";
  const duplicateIds = duplicateSuggestedFootageIds(writePlanReview.write_plan_items);
  const approvalItems = sourceStatus === "write_plan_reviewable"
    ? writePlanReview.write_plan_items.map((item) =>
        approvalItemForWritePlan(item, approvalRecords.find((record) => record.write_plan_item_id === item.write_plan_item_id), duplicateIds)
      )
    : [];

  return SourceFolderFixtureManifestWriteDryRunApprovalGateOutputSchema.parse({
    fixture_manifest_write_dry_run_approval_gate_id: `${FIXTURE_MANIFEST_WRITE_DRY_RUN_APPROVAL_GATE_ID}-${writePlanReview.source_id}`,
    source_id: writePlanReview.source_id,
    source_label: writePlanReview.source_label,
    source_root: writePlanReview.source_root,
    dry_run: writePlanReview.dry_run,
    read_only: writePlanReview.read_only,
    source_write_plan_status: sourceStatus,
    reviewed_write_plan_items: sourceStatus === "write_plan_reviewable" ? writePlanReview.write_plan_items.length : 0,
    approved_for_future_fixture_manifest_file_creation_gate: countApprovalStatus(
      approvalItems,
      "approved_for_future_fixture_manifest_file_creation_gate"
    ),
    needs_owner_review: countApprovalStatus(approvalItems, "needs_owner_review"),
    incomplete_approval: countApprovalStatus(approvalItems, "incomplete_approval"),
    blocked_approval: countApprovalStatus(approvalItems, "blocked_approval"),
    approval_items: approvalItems,
    approval_policy_findings: approvalPolicyFindings(sourceStatus, writePlanReview),
    duplicate_id_findings: [...duplicateIds].map((id) => `duplicate_suggested_footage_id:${id}`),
    missing_approval_fields: summarizeValues(approvalItems.flatMap((item) => item.missing_approval_fields)),
    blocked_reason_summary: summarizeValues(approvalItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(approvalItems, approvalRecords),
    recommended_owner_actions: recommendedOwnerActions(sourceStatus, approvalItems, duplicateIds.size),
    next_safe_actions: nextSafeActions(
      sourceStatus,
      countApprovalStatus(approvalItems, "approved_for_future_fixture_manifest_file_creation_gate")
    ),
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    fixture_manifest_write_allowed: writePlanReview.fixture_manifest_write_allowed,
    fixture_manifest_file_created: false,
    fixture_manifest_write_performed: false,
    fixture_manifest_file_creation_gate_allowed: approvalItems.some(
      (item) => item.approval_status === "approved_for_future_fixture_manifest_file_creation_gate"
    ),
    production_manifest_write_allowed: false,
    manifest_export_allowed: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function approvalItemForWritePlan(
  item: FixtureManifestWritePlanItem,
  record: SourceFolderFixtureManifestWriteDryRunApprovalRecord | undefined,
  duplicateIds: Set<string>
): FixtureManifestWriteDryRunApprovalItem {
  const fallbackRecord = defaultApprovalRecord(item.write_plan_item_id);
  const approvalRecord = record ?? fallbackRecord;
  const missingApprovalFields = missingApprovalFieldsFor(approvalRecord);
  const blockingReasons = blockingReasonsFor(item, approvalRecord, duplicateIds);
  const status = approvalStatusFor(item, approvalRecord, missingApprovalFields, blockingReasons);

  return FixtureManifestWriteDryRunApprovalItemSchema.parse({
    write_plan_item_id: item.write_plan_item_id,
    manifest_item_id: item.manifest_item_id,
    suggested_footage_id: item.suggested_footage_id,
    filename: item.filename,
    relative_path: item.relative_path,
    source_write_plan_status: item.write_plan_status,
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
      `Source write-plan status: ${item.write_plan_status}.`,
      `Fixture manifest write dry-run approval status: ${status}.`,
      "Approval is future fixture-manifest file creation gate eligibility only; no manifest file is created or written."
    ],
    recommended_action: recommendedAction(status)
  });
}

function defaultApprovalRecord(writePlanItemId: string): SourceFolderFixtureManifestWriteDryRunApprovalRecord {
  return {
    write_plan_item_id: writePlanItemId,
    approval_record_found: false,
    owner_approved: false,
    approved_by: null,
    approved_at: null,
    approval_scope: null,
    requested_actions: []
  };
}

function missingApprovalFieldsFor(record: SourceFolderFixtureManifestWriteDryRunApprovalRecord): string[] {
  const missing: string[] = [];
  if (!record.approval_record_found) missing.push("approval_record_found");
  if (!record.owner_approved) missing.push("owner_approved");
  if (!record.approved_by) missing.push("approved_by");
  if (!record.approved_at) missing.push("approved_at");
  if (!record.approval_scope) missing.push("approval_scope");
  if (record.approval_scope && record.approval_scope !== FUTURE_FIXTURE_MANIFEST_FILE_CREATION_GATE_SCOPE) {
    missing.push("approval_scope_future_fixture_manifest_file_creation_gate_review_only");
  }
  return missing;
}

function blockingReasonsFor(
  item: FixtureManifestWritePlanItem,
  record: SourceFolderFixtureManifestWriteDryRunApprovalRecord,
  duplicateIds: Set<string>
): string[] {
  const reasons: string[] = [];
  if (item.write_plan_status === "blocked_write_plan") reasons.push("source_write_plan_blocked_cannot_be_upgraded");
  if (item.write_plan_status === "incomplete_write_plan") reasons.push("source_write_plan_incomplete_cannot_be_upgraded");
  if (duplicateIds.has(item.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of item.blocking_reasons) reasons.push(`write_plan_${reason}`);
  for (const riskFlag of item.risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const action of record.requested_actions) reasons.push(`denied_action_${action}`);
  if (item.relative_path.includes("..")) reasons.push("unsafe_relative_path_blocked");
  if (item.target_fixture_manifest_path && containsBlockedPathToken(item.target_fixture_manifest_path)) {
    reasons.push("target_fixture_manifest_path_blocked_metadata_only");
  }
  if (!item.target_fixture_manifest_path) reasons.push("target_fixture_manifest_path_missing");
  if (!item.product_family || !item.visual_type || !item.process_stage || !item.orientation || !item.filename || !item.relative_path) {
    reasons.push("required_manifest_fields_missing");
  }
  return reasons;
}

function approvalStatusFor(
  item: FixtureManifestWritePlanItem,
  record: SourceFolderFixtureManifestWriteDryRunApprovalRecord,
  missingApprovalFields: string[],
  blockingReasons: string[]
): z.infer<typeof FixtureManifestWriteDryRunApprovalStatusSchema> {
  if (item.write_plan_status === "incomplete_write_plan" && missingApprovalFields.length > 0) {
    return "incomplete_approval";
  }
  if (blockingReasons.length > 0) return "blocked_approval";
  if (missingApprovalFields.length > 0) {
    if (item.write_plan_status === "write_plan_ok" && !record.approval_record_found) return "needs_owner_review";
    return "incomplete_approval";
  }
  if (item.write_plan_status === "needs_owner_review") return "needs_owner_review";
  if (item.write_plan_status !== "write_plan_ok") return "blocked_approval";
  return "approved_for_future_fixture_manifest_file_creation_gate";
}

function duplicateSuggestedFootageIds(items: FixtureManifestWritePlanItem[]): Set<string> {
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
  sourceStatus: "write_plan_reviewable" | "write_plan_denied",
  review: SourceFolderFixtureManifestWriteDryRunReviewOutput
): string[] {
  const findings = [
    "Phase 2J.23 is approval-gate only; it must not create, write, import, export, persist, or save manifests.",
    "fixture_manifest_file_creation_gate_allowed is future eligibility only."
  ];
  if (sourceStatus !== "write_plan_reviewable") findings.push("Denied write-plan reviews produce zero approval items.");
  if (review.source_root !== SAFE_FIXTURE_ROOT) findings.push("source_root_not_safe_fixture");
  return findings;
}

function summarizeDeniedActions(
  items: FixtureManifestWriteDryRunApprovalItem[],
  records: SourceFolderFixtureManifestWriteDryRunApprovalRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.write_plan_item_id));
  return summarizeValues(records.filter((record) => itemIds.has(record.write_plan_item_id)).flatMap((record) => record.requested_actions));
}

function recommendedOwnerActions(
  sourceStatus: "write_plan_reviewable" | "write_plan_denied",
  items: FixtureManifestWriteDryRunApprovalItem[],
  duplicateIdCount: number
): string[] {
  if (sourceStatus !== "write_plan_reviewable") {
    return ["Keep denied write-plan review cases blocked; do not create approval items."];
  }
  const actions = [
    "Review approved_for_future_fixture_manifest_file_creation_gate rows before any later file creation gate.",
    "Do not create, write, export, import, save, or persist any manifest in Phase 2J.23."
  ];
  if (items.some((item) => item.approval_status === "needs_owner_review")) {
    actions.push("Collect explicit owner approval before a later fixture-manifest file creation gate.");
  }
  if (items.some((item) => item.approval_status === "incomplete_approval")) {
    actions.push("Complete approval metadata before any later fixture-manifest file creation gate.");
  }
  if (items.some((item) => item.approval_status === "blocked_approval") || duplicateIdCount > 0) {
    actions.push("Keep duplicate IDs, blocked upstream rows, risky flags, unsafe paths, and denied write/import/export/render/upload/publish requests blocked.");
  }
  return actions;
}

function nextSafeActions(
  sourceStatus: "write_plan_reviewable" | "write_plan_denied",
  approvedCount: number
): string[] {
  if (sourceStatus !== "write_plan_reviewable") {
    return [
      "Return to Phase 2J.22 fixture manifest write dry-run review before approval.",
      "Do not create, export, import, write, save, or persist any manifest."
    ];
  }
  if (approvedCount > 0) {
    return [
      "Treat approved rows as future fixture-manifest file creation gate eligibility only.",
      "Keep fixture_manifest_write_allowed and fixture_manifest_file_creation_gate_allowed as future eligibility flags.",
      "Do not write production manifests, fixture manifest files, draft manifest files, or real metadata stores."
    ];
  }
  return [
    "Keep all rows in approval review until owner approval is explicit and complete.",
    "Do not create, export, import, write, save, or persist any manifest."
  ];
}

function recommendedAction(status: z.infer<typeof FixtureManifestWriteDryRunApprovalStatusSchema>): string {
  if (status === "approved_for_future_fixture_manifest_file_creation_gate") {
    return "Keep as future fixture-manifest file creation gate eligibility only; do not create a fixture manifest now.";
  }
  if (status === "needs_owner_review") return "Collect explicit owner approval before a later file creation gate.";
  if (status === "incomplete_approval") return "Complete approval metadata before any later file creation gate.";
  return "Keep blocked and remove duplicate IDs, risky flags, denied actions, unsafe target paths, or blocked upstream rows.";
}

function countApprovalStatus(
  items: FixtureManifestWriteDryRunApprovalItem[],
  status: z.infer<typeof FixtureManifestWriteDryRunApprovalStatusSchema>
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
