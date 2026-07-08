import { z } from "zod";
import {
  parseSourceFolderFixtureManifestWriteDryRunApprovalGateFixture,
  reviewSourceFolderFixtureManifestWriteDryRunApprovalGateFixture,
  type FixtureManifestWriteDryRunApprovalItem,
  type SourceFolderFixtureManifestWriteDryRunApprovalGateFixture,
  type SourceFolderFixtureManifestWriteDryRunApprovalGateOutput
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

const FIXTURE_MANIFEST_FILE_CREATION_GATE_ID =
  "phase-2j24-source-folder-fixture-manifest-file-creation-gate";
const FUTURE_FIXTURE_MANIFEST_FILE_CREATION_DRY_RUN_SCOPE =
  "future_fixture_manifest_file_creation_dry_run_review_only";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const FixtureManifestFileCreationActionSchema = z.enum([
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

const FixtureManifestFileCreationStatusSchema = z.enum([
  "eligible_for_fixture_manifest_file_creation_dry_run",
  "needs_owner_review",
  "incomplete_file_creation_gate",
  "blocked_file_creation_gate"
]);

export const SourceFolderFixtureManifestFileCreationRecordSchema = z.object({
  write_plan_item_id: z.string().min(1),
  approval_record_found: z.boolean(),
  owner_approved: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  requested_actions: z.array(FixtureManifestFileCreationActionSchema).default([])
}).strict();

export const SourceFolderFixtureManifestFileCreationGateFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-fixture-manifest-file-creation-gate-smoke-v1"),
  mode: z.literal("controlled_fixture_manifest_file_creation_gate"),
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
  file_creation_approval_records: z.array(SourceFolderFixtureManifestFileCreationRecordSchema).min(1),
  notes: z.string().min(1)
}).strict();

export const FixtureManifestFileCreationItemSchema = z.object({
  write_plan_item_id: z.string().min(1),
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_file_creation_approval_status: z.enum([
    "eligible_for_fixture_manifest_file_creation_dry_run",
    "approved_for_future_fixture_manifest_file_creation_gate",
    "needs_owner_review",
    "incomplete_approval",
    "blocked_approval"
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
  file_creation_gate_status: FixtureManifestFileCreationStatusSchema,
  missing_required_fields: z.array(z.string().min(1)),
  missing_approval_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderFixtureManifestFileCreationGateOutputSchema = z.object({
  fixture_manifest_file_creation_gate_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  source_file_creation_approval_status: z.enum(["file_creation_approval_reviewable", "file_creation_approval_denied"]),
  reviewed_file_creation_approval_items: z.number().int().min(0),
  eligible_for_fixture_manifest_file_creation_dry_run: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_file_creation_gate: z.number().int().min(0),
  blocked_file_creation_gate: z.number().int().min(0),
  file_creation_gate_items: z.array(FixtureManifestFileCreationItemSchema),
  file_creation_policy_findings: z.array(z.string().min(1)),
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
  fixture_manifest_file_created: z.literal(false),
  fixture_manifest_write_performed: z.literal(false),
  production_manifest_write_allowed: z.literal(false),
  manifest_export_allowed: z.literal(false),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderFixtureManifestFileCreationRecord = z.infer<
  typeof SourceFolderFixtureManifestFileCreationRecordSchema
>;
export type SourceFolderFixtureManifestFileCreationGateFixture = z.infer<
  typeof SourceFolderFixtureManifestFileCreationGateFixtureSchema
>;
export type FixtureManifestFileCreationItem = z.infer<typeof FixtureManifestFileCreationItemSchema>;
export type SourceFolderFixtureManifestFileCreationGateOutput = z.infer<
  typeof SourceFolderFixtureManifestFileCreationGateOutputSchema
>;

export type SourceFolderFixtureManifestFileCreationGateBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderFixtureManifestFileCreationGateFixture;
  gates: SourceFolderFixtureManifestFileCreationGateOutput[];
  reviewedFileCreationApprovalItems: number;
  eligibleForFixtureManifestFileCreationDryRunCount: number;
  needsOwnerReviewCount: number;
  incompleteFileCreationGateCount: number;
  blockedFileCreationGateCount: number;
  duplicateIdFindingsCount: number;
  missingRequiredFieldCount: number;
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
  fixtureManifestFileCreationDryRunAllowedCount: number;
  fixtureManifestFileCreationDryRunAllowed: boolean;
  productionManifestWriteAllowedCount: number;
  manifestExportAllowedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderFixtureManifestFileCreationGateFixture(
  input: unknown
): SourceFolderFixtureManifestFileCreationGateFixture {
  return SourceFolderFixtureManifestFileCreationGateFixtureSchema.parse(input);
}

export function reviewSourceFolderFixtureManifestFileCreationGateFixture(input: {
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
}): SourceFolderFixtureManifestFileCreationGateBatchResult {
  const fileCreationApprovalGateResult = reviewSourceFolderFixtureManifestWriteDryRunApprovalGateFixture({
    approvalGateFixture: input.fileCreationApprovalGateFixture,
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
  const gates = fileCreationApprovalGateResult.gates.map((gate) =>
    reviewApprovalForFixtureManifestFileCreationGate(gate, input.fileCreationGateFixture.file_creation_approval_records)
  );

  return {
    provider: "fake_content_engine",
    fixture: input.fileCreationGateFixture,
    gates,
    reviewedFileCreationApprovalItems: sum(gates.map((gate) => gate.reviewed_file_creation_approval_items)),
    eligibleForFixtureManifestFileCreationDryRunCount: sum(
      gates.map((gate) => gate.eligible_for_fixture_manifest_file_creation_dry_run)
    ),
    needsOwnerReviewCount: sum(gates.map((gate) => gate.needs_owner_review)),
    incompleteFileCreationGateCount: sum(gates.map((gate) => gate.incomplete_file_creation_gate)),
    blockedFileCreationGateCount: sum(gates.map((gate) => gate.blocked_file_creation_gate)),
    duplicateIdFindingsCount: sum(gates.map((gate) => gate.duplicate_id_findings.length)),
    missingRequiredFieldCount: sum(gates.map((gate) => gate.missing_required_field_count)),
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
    fixtureManifestFileCreationDryRunAllowedCount: gates.filter(
      (gate) => gate.fixture_manifest_file_creation_dry_run_allowed
    ).length,
    fixtureManifestFileCreationDryRunAllowed: gates.some(
      (gate) => gate.fixture_manifest_file_creation_dry_run_allowed
    ),
    productionManifestWriteAllowedCount: gates.filter((gate) => gate.production_manifest_write_allowed).length,
    manifestExportAllowedCount: gates.filter((gate) => gate.manifest_export_allowed).length,
    recommendedOwnerActionsCount: sum(gates.map((gate) => gate.recommended_owner_actions.length)),
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderFixtureManifestFileCreationGateFixture(input: {
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
}): SourceFolderFixtureManifestFileCreationGateBatchResult {
  return reviewSourceFolderFixtureManifestFileCreationGateFixture({
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

export function reviewApprovalForFixtureManifestFileCreationGate(
  fileCreationApprovalGate: SourceFolderFixtureManifestWriteDryRunApprovalGateOutput,
  fileCreationRecords: SourceFolderFixtureManifestFileCreationRecord[]
): SourceFolderFixtureManifestFileCreationGateOutput {
  const sourceStatus = fileCreationApprovalGate.fixture_manifest_file_creation_gate_allowed
    ? "file_creation_approval_reviewable"
    : "file_creation_approval_denied";
  const duplicateIds = duplicateSuggestedFootageIds(fileCreationApprovalGate.approval_items);
  const fileCreationGateItems = sourceStatus === "file_creation_approval_reviewable"
    ? fileCreationApprovalGate.approval_items.map((item) =>
        fileCreationGateItemForApproval(item, fileCreationRecords.find((record) => record.write_plan_item_id === item.write_plan_item_id), duplicateIds)
      )
    : [];

  return SourceFolderFixtureManifestFileCreationGateOutputSchema.parse({
    fixture_manifest_file_creation_gate_id: `${FIXTURE_MANIFEST_FILE_CREATION_GATE_ID}-${fileCreationApprovalGate.source_id}`,
    source_id: fileCreationApprovalGate.source_id,
    source_label: fileCreationApprovalGate.source_label,
    source_root: fileCreationApprovalGate.source_root,
    dry_run: fileCreationApprovalGate.dry_run,
    read_only: fileCreationApprovalGate.read_only,
    source_file_creation_approval_status: sourceStatus,
    reviewed_file_creation_approval_items: sourceStatus === "file_creation_approval_reviewable"
      ? fileCreationApprovalGate.approval_items.length
      : 0,
    eligible_for_fixture_manifest_file_creation_dry_run: countFileCreationGateStatus(
      fileCreationGateItems,
      "eligible_for_fixture_manifest_file_creation_dry_run"
    ),
    needs_owner_review: countFileCreationGateStatus(fileCreationGateItems, "needs_owner_review"),
    incomplete_file_creation_gate: countFileCreationGateStatus(fileCreationGateItems, "incomplete_file_creation_gate"),
    blocked_file_creation_gate: countFileCreationGateStatus(fileCreationGateItems, "blocked_file_creation_gate"),
    file_creation_gate_items: fileCreationGateItems,
    file_creation_policy_findings: fileCreationPolicyFindings(sourceStatus, fileCreationApprovalGate),
    duplicate_id_findings: [...duplicateIds].map((id) => `duplicate_suggested_footage_id:${id}`),
    missing_required_field_count: sum(fileCreationGateItems.map((item) => item.missing_required_fields.length)),
    missing_approval_fields: summarizeValues(fileCreationGateItems.flatMap((item) => item.missing_approval_fields)),
    blocked_reason_summary: summarizeValues(fileCreationGateItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(fileCreationGateItems, fileCreationRecords),
    recommended_owner_actions: recommendedOwnerActions(sourceStatus, fileCreationGateItems, duplicateIds.size),
    next_safe_actions: nextSafeActions(
      sourceStatus,
      countFileCreationGateStatus(fileCreationGateItems, "eligible_for_fixture_manifest_file_creation_dry_run")
    ),
    target_fixture_manifest_path:
      fileCreationGateItems.find((item) => item.file_creation_gate_status === "eligible_for_fixture_manifest_file_creation_dry_run")
        ?.target_fixture_manifest_path ?? null,
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    fixture_manifest_write_allowed: fileCreationApprovalGate.fixture_manifest_write_allowed,
    fixture_manifest_file_creation_gate_allowed: fileCreationApprovalGate.fixture_manifest_file_creation_gate_allowed,
    fixture_manifest_file_creation_dry_run_allowed: fileCreationGateItems.some(
      (item) => item.file_creation_gate_status === "eligible_for_fixture_manifest_file_creation_dry_run"
    ),
    fixture_manifest_file_created: false,
    fixture_manifest_write_performed: false,
    production_manifest_write_allowed: false,
    manifest_export_allowed: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function fileCreationGateItemForApproval(
  item: FixtureManifestWriteDryRunApprovalItem,
  record: SourceFolderFixtureManifestFileCreationRecord | undefined,
  duplicateIds: Set<string>
): FixtureManifestFileCreationItem {
  const fallbackRecord = defaultApprovalRecord(item.write_plan_item_id);
  const fileCreationRecord = record ?? fallbackRecord;
  const missingRequiredFields = missingRequiredFieldsFor(item);
  const missingApprovalFields = missingApprovalFieldsFor(fileCreationRecord);
  const blockingReasons = blockingReasonsFor(item, fileCreationRecord, duplicateIds, missingRequiredFields);
  const status = fileCreationGateStatusFor(item, fileCreationRecord, missingApprovalFields, blockingReasons);

  return FixtureManifestFileCreationItemSchema.parse({
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
    owner_approved: fileCreationRecord.owner_approved,
    approval_record_found: fileCreationRecord.approval_record_found,
    approved_by: fileCreationRecord.approved_by,
    approved_at: fileCreationRecord.approved_at,
    approval_scope: fileCreationRecord.approval_scope,
    file_creation_gate_status: status,
    missing_required_fields: missingRequiredFields,
    missing_approval_fields: missingApprovalFields,
    blocking_reasons: blockingReasons,
    review_notes: [
      `Source file creation approval status: ${item.approval_status}.`,
      `Fixture manifest file creation gate status: ${status}.`,
      "Eligibility is future fixture-manifest file creation dry-run review only; no manifest file is created or written."
    ],
    recommended_action: recommendedAction(status)
  });
}

function defaultApprovalRecord(writePlanItemId: string): SourceFolderFixtureManifestFileCreationRecord {
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

function missingApprovalFieldsFor(record: SourceFolderFixtureManifestFileCreationRecord): string[] {
  const missing: string[] = [];
  if (!record.approval_record_found) missing.push("approval_record_found");
  if (!record.owner_approved) missing.push("owner_approved");
  if (!record.approved_by) missing.push("approved_by");
  if (!record.approved_at) missing.push("approved_at");
  if (!record.approval_scope) missing.push("approval_scope");
  if (record.approval_scope && record.approval_scope !== FUTURE_FIXTURE_MANIFEST_FILE_CREATION_DRY_RUN_SCOPE) {
    missing.push("approval_scope_future_fixture_manifest_file_creation_dry_run_review_only");
  }
  return missing;
}

function missingRequiredFieldsFor(item: FixtureManifestWriteDryRunApprovalItem): string[] {
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

function blockingReasonsFor(
  item: FixtureManifestWriteDryRunApprovalItem,
  record: SourceFolderFixtureManifestFileCreationRecord,
  duplicateIds: Set<string>,
  missingRequiredFields: string[]
): string[] {
  const reasons: string[] = [];
  if (item.approval_status === "blocked_approval") reasons.push("source_file_creation_approval_blocked_cannot_be_upgraded");
  if (item.approval_status === "incomplete_approval") reasons.push("source_file_creation_approval_incomplete_cannot_be_upgraded");
  if (duplicateIds.has(item.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of item.blocking_reasons) reasons.push(`file_creation_approval_${reason}`);
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
  if (missingRequiredFields.includes("target_fixture_manifest_path")) reasons.push("target_fixture_manifest_path_missing");
  if (missingRequiredFields.length > 0) {
    reasons.push("required_manifest_fields_missing");
  }
  return reasons;
}

function fileCreationGateStatusFor(
  item: FixtureManifestWriteDryRunApprovalItem,
  record: SourceFolderFixtureManifestFileCreationRecord,
  missingApprovalFields: string[],
  blockingReasons: string[]
): z.infer<typeof FixtureManifestFileCreationStatusSchema> {
  if (item.approval_status === "incomplete_approval" && missingApprovalFields.length > 0) {
    return "incomplete_file_creation_gate";
  }
  if (blockingReasons.length > 0) return "blocked_file_creation_gate";
  if (missingApprovalFields.length > 0) {
    if (item.approval_status === "approved_for_future_fixture_manifest_file_creation_gate" && !record.approval_record_found) {
      return "needs_owner_review";
    }
    return "incomplete_file_creation_gate";
  }
  if (item.approval_status === "needs_owner_review") return "needs_owner_review";
  if (item.approval_status !== "approved_for_future_fixture_manifest_file_creation_gate") {
    return "blocked_file_creation_gate";
  }
  return "eligible_for_fixture_manifest_file_creation_dry_run";
}

function duplicateSuggestedFootageIds(items: FixtureManifestWriteDryRunApprovalItem[]): Set<string> {
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

function fileCreationPolicyFindings(
  sourceStatus: "file_creation_approval_reviewable" | "file_creation_approval_denied",
  gate: SourceFolderFixtureManifestWriteDryRunApprovalGateOutput
): string[] {
  const findings = [
    "Phase 2J.24 is file creation gate only; it must not create, write, import, export, persist, or save manifests.",
    "fixture_manifest_file_creation_dry_run_allowed is future dry-run eligibility only."
  ];
  if (sourceStatus !== "file_creation_approval_reviewable") {
    findings.push("Denied file creation approval cases produce zero file creation gate items.");
  }
  if (gate.source_root !== SAFE_FIXTURE_ROOT) findings.push("source_root_not_safe_fixture");
  return findings;
}

function summarizeDeniedActions(
  items: FixtureManifestFileCreationItem[],
  records: SourceFolderFixtureManifestFileCreationRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.write_plan_item_id));
  return summarizeValues(records.filter((record) => itemIds.has(record.write_plan_item_id)).flatMap((record) => record.requested_actions));
}

function recommendedOwnerActions(
  sourceStatus: "file_creation_approval_reviewable" | "file_creation_approval_denied",
  items: FixtureManifestFileCreationItem[],
  duplicateIdCount: number
): string[] {
  if (sourceStatus !== "file_creation_approval_reviewable") {
    return ["Keep denied file creation approval cases blocked; do not create file creation gate items."];
  }
  const actions = [
    "Review eligible_for_fixture_manifest_file_creation_dry_run rows before any later file creation gate.",
    "Do not create, write, export, import, save, or persist any manifest in Phase 2J.24."
  ];
  if (items.some((item) => item.file_creation_gate_status === "needs_owner_review")) {
    actions.push("Collect explicit owner approval before a later fixture-manifest file creation gate.");
  }
  if (items.some((item) => item.file_creation_gate_status === "incomplete_file_creation_gate")) {
    actions.push("Complete approval metadata before any later fixture-manifest file creation gate.");
  }
  if (items.some((item) => item.file_creation_gate_status === "blocked_file_creation_gate") || duplicateIdCount > 0) {
    actions.push("Keep duplicate IDs, blocked upstream rows, risky flags, unsafe paths, and denied write/import/export/render/upload/publish requests blocked.");
  }
  return actions;
}

function nextSafeActions(
  sourceStatus: "file_creation_approval_reviewable" | "file_creation_approval_denied",
  approvedCount: number
): string[] {
  if (sourceStatus !== "file_creation_approval_reviewable") {
    return [
      "Return to Phase 2J.23 fixture manifest write dry-run approval gate before file creation gating.",
      "Do not create, export, import, write, save, or persist any manifest."
    ];
  }
  if (approvedCount > 0) {
    return [
      "Treat eligible rows as future fixture-manifest file creation dry-run review eligibility only.",
      "Keep fixture_manifest_write_allowed and fixture_manifest_file_creation_gate_allowed as inherited future eligibility flags.",
      "Do not write production manifests, fixture manifest files, draft manifest files, or real metadata stores."
    ];
  }
  return [
    "Keep all rows in approval review until owner approval is explicit and complete.",
    "Do not create, export, import, write, save, or persist any manifest."
  ];
}

function recommendedAction(status: z.infer<typeof FixtureManifestFileCreationStatusSchema>): string {
  if (status === "eligible_for_fixture_manifest_file_creation_dry_run") {
    return "Keep as future fixture-manifest file creation gate eligibility only; do not create a fixture manifest now.";
  }
  if (status === "needs_owner_review") return "Collect explicit owner approval before a later file creation gate.";
  if (status === "incomplete_file_creation_gate") return "Complete approval metadata before any later file creation gate.";
  return "Keep blocked and remove duplicate IDs, risky flags, denied actions, unsafe target paths, or blocked upstream rows.";
}

function countFileCreationGateStatus(
  items: FixtureManifestFileCreationItem[],
  status: z.infer<typeof FixtureManifestFileCreationStatusSchema>
): number {
  return items.filter((item) => item.file_creation_gate_status === status).length;
}

function summarizeValues(values: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const value of values) summary[value] = (summary[value] || 0) + 1;
  return summary;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
