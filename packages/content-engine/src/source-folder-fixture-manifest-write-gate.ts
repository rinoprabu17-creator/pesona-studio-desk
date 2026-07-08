import { z } from "zod";
import {
  parseSourceFolderDraftManifestCreationDryRunApprovalGateFixture,
  reviewSourceFolderDraftManifestCreationDryRunApprovalGateFixture,
  type DraftManifestCreationDryRunApprovalItem,
  type SourceFolderDraftManifestCreationDryRunApprovalGateFixture,
  type SourceFolderDraftManifestCreationDryRunApprovalGateOutput
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

const FIXTURE_MANIFEST_WRITE_GATE_ID = "phase-2j21-source-folder-fixture-manifest-write-gate";
const FIXTURE_MANIFEST_WRITE_DRY_RUN_SCOPE = "future_fixture_manifest_write_dry_run_review_only";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const FixtureManifestWriteGateStatusSchema = z.enum([
  "eligible_for_fixture_manifest_write_dry_run",
  "needs_owner_review",
  "incomplete_write_gate",
  "blocked_write_gate"
]);

const FixtureManifestWriteGateActionSchema = z.enum([
  "metadata_write_requested",
  "metadata_import_requested",
  "manifest_write_requested",
  "manifest_import_requested",
  "manifest_export_requested",
  "fixture_manifest_file_create_requested",
  "draft_manifest_file_create_requested",
  "production_manifest_write_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

export const SourceFolderFixtureManifestWriteGateApprovalRecordSchema = z.object({
  manifest_item_id: z.string().min(1),
  approval_record_found: z.boolean(),
  owner_approved: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  requested_actions: z.array(FixtureManifestWriteGateActionSchema).default([])
}).strict();

export const SourceFolderFixtureManifestWriteGateFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-fixture-manifest-write-gate-smoke-v1"),
  mode: z.literal("controlled_fixture_manifest_write_gate"),
  source_creation_approval_gate_fixture: z.string().min(1),
  source_creation_review_fixture: z.string().min(1),
  source_creation_gate_fixture: z.string().min(1),
  source_draft_manifest_approval_gate_fixture: z.string().min(1),
  source_draft_manifest_review_fixture: z.string().min(1),
  source_metadata_enrichment_approval_gate_fixture: z.string().min(1),
  source_metadata_enrichment_fixture: z.string().min(1),
  source_listing_review_fixture: z.string().min(1),
  source_listing_gate_fixture: z.string().min(1),
  approval_records: z.array(SourceFolderFixtureManifestWriteGateApprovalRecordSchema).min(1),
  notes: z.string().min(1)
}).strict();

export const FixtureManifestWriteGateItemSchema = z.object({
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_creation_approval_status: z.enum([
    "approved_for_future_fixture_manifest_write_gate",
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
  owner_approved: z.boolean(),
  approval_record_found: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  write_gate_status: FixtureManifestWriteGateStatusSchema,
  missing_required_fields: z.array(z.string().min(1)),
  missing_approval_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderFixtureManifestWriteGateOutputSchema = z.object({
  fixture_manifest_write_gate_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  source_creation_approval_status: z.enum(["creation_approval_reviewable", "creation_approval_denied"]),
  reviewed_creation_approval_items: z.number().int().min(0),
  eligible_for_fixture_manifest_write_dry_run: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_write_gate: z.number().int().min(0),
  blocked_write_gate: z.number().int().min(0),
  write_gate_items: z.array(FixtureManifestWriteGateItemSchema),
  write_policy_findings: z.array(z.string().min(1)),
  duplicate_id_findings: z.array(z.string().min(1)),
  missing_required_field_count: z.number().int().min(0),
  missing_approval_fields: z.record(z.string(), z.number().int().min(0)),
  blocked_reason_summary: z.record(z.string(), z.number().int().min(0)),
  denied_action_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  metadata_write_allowed: z.literal(false),
  manifest_write_allowed: z.literal(false),
  fixture_manifest_write_allowed: z.boolean(),
  fixture_manifest_file_created: z.literal(false),
  production_manifest_write_allowed: z.literal(false),
  manifest_export_allowed: z.literal(false),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderFixtureManifestWriteGateApprovalRecord = z.infer<
  typeof SourceFolderFixtureManifestWriteGateApprovalRecordSchema
>;
export type SourceFolderFixtureManifestWriteGateFixture = z.infer<
  typeof SourceFolderFixtureManifestWriteGateFixtureSchema
>;
export type FixtureManifestWriteGateItem = z.infer<typeof FixtureManifestWriteGateItemSchema>;
export type SourceFolderFixtureManifestWriteGateOutput = z.infer<
  typeof SourceFolderFixtureManifestWriteGateOutputSchema
>;

export type SourceFolderFixtureManifestWriteGateBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderFixtureManifestWriteGateFixture;
  gates: SourceFolderFixtureManifestWriteGateOutput[];
  reviewedCreationApprovalItems: number;
  eligibleForFixtureManifestWriteDryRunCount: number;
  needsOwnerReviewCount: number;
  incompleteWriteGateCount: number;
  blockedWriteGateCount: number;
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
  productionManifestWriteAllowedCount: number;
  manifestExportAllowedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderFixtureManifestWriteGateFixture(
  input: unknown
): SourceFolderFixtureManifestWriteGateFixture {
  return SourceFolderFixtureManifestWriteGateFixtureSchema.parse(input);
}

export function reviewSourceFolderFixtureManifestWriteGateFixture(input: {
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
}): SourceFolderFixtureManifestWriteGateBatchResult {
  const creationApprovalResult = reviewSourceFolderDraftManifestCreationDryRunApprovalGateFixture({
    approvalGateFixture: input.creationApprovalGateFixture,
    creationReviewFixture: input.creationReviewFixture,
    creationGateFixture: input.creationGateFixture,
    draftManifestApprovalGateFixture: input.draftManifestApprovalGateFixture,
    draftManifestReviewFixture: input.draftManifestReviewFixture,
    metadataEnrichmentApprovalGateFixture: input.metadataEnrichmentApprovalGateFixture,
    enrichmentFixture: input.enrichmentFixture,
    listingReviewFixture: input.listingReviewFixture,
    listingGateFixture: input.listingGateFixture
  });
  const gates = creationApprovalResult.gates.map((gate) =>
    reviewCreationApprovalForFixtureManifestWriteGate(gate, input.writeGateFixture.approval_records)
  );

  return {
    provider: "fake_content_engine",
    fixture: input.writeGateFixture,
    gates,
    reviewedCreationApprovalItems: sum(gates.map((gate) => gate.reviewed_creation_approval_items)),
    eligibleForFixtureManifestWriteDryRunCount: sum(
      gates.map((gate) => gate.eligible_for_fixture_manifest_write_dry_run)
    ),
    needsOwnerReviewCount: sum(gates.map((gate) => gate.needs_owner_review)),
    incompleteWriteGateCount: sum(gates.map((gate) => gate.incomplete_write_gate)),
    blockedWriteGateCount: sum(gates.map((gate) => gate.blocked_write_gate)),
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
    productionManifestWriteAllowedCount: gates.filter((gate) => gate.production_manifest_write_allowed).length,
    manifestExportAllowedCount: gates.filter((gate) => gate.manifest_export_allowed).length,
    recommendedOwnerActionsCount: sum(gates.map((gate) => gate.recommended_owner_actions.length)),
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderFixtureManifestWriteGateFixture(input: {
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
}): SourceFolderFixtureManifestWriteGateBatchResult {
  return reviewSourceFolderFixtureManifestWriteGateFixture({
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

export function reviewCreationApprovalForFixtureManifestWriteGate(
  creationApprovalGate: SourceFolderDraftManifestCreationDryRunApprovalGateOutput,
  approvalRecords: SourceFolderFixtureManifestWriteGateApprovalRecord[]
): SourceFolderFixtureManifestWriteGateOutput {
  const sourceStatus = creationApprovalGate.fixture_manifest_write_gate_allowed
    ? "creation_approval_reviewable"
    : "creation_approval_denied";
  const duplicateIdFindings = creationApprovalGate.duplicate_id_findings;
  const duplicateIds = duplicateSuggestedFootageIdsFromFindings(duplicateIdFindings);
  const gateItems = sourceStatus === "creation_approval_reviewable"
    ? writeGateItemsForApprovalItems(creationApprovalGate.approval_items, approvalRecords, duplicateIds)
    : [];
  const eligibleCount = countWriteGateStatus(gateItems, "eligible_for_fixture_manifest_write_dry_run");

  return SourceFolderFixtureManifestWriteGateOutputSchema.parse({
    fixture_manifest_write_gate_id: `${FIXTURE_MANIFEST_WRITE_GATE_ID}-${creationApprovalGate.source_id}`,
    source_id: creationApprovalGate.source_id,
    source_label: creationApprovalGate.source_label,
    source_root: creationApprovalGate.source_root,
    dry_run: creationApprovalGate.dry_run,
    read_only: creationApprovalGate.read_only,
    source_creation_approval_status: sourceStatus,
    reviewed_creation_approval_items: sourceStatus === "creation_approval_reviewable"
      ? creationApprovalGate.approval_items.length
      : 0,
    eligible_for_fixture_manifest_write_dry_run: eligibleCount,
    needs_owner_review: countWriteGateStatus(gateItems, "needs_owner_review"),
    incomplete_write_gate: countWriteGateStatus(gateItems, "incomplete_write_gate"),
    blocked_write_gate: countWriteGateStatus(gateItems, "blocked_write_gate"),
    write_gate_items: gateItems,
    write_policy_findings: writePolicyFindings(creationApprovalGate, gateItems),
    duplicate_id_findings: duplicateIdFindings,
    missing_required_field_count: sum(gateItems.map((item) => item.missing_required_fields.length)),
    missing_approval_fields: summarizeValues(gateItems.flatMap((item) => item.missing_approval_fields)),
    blocked_reason_summary: summarizeValues(gateItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(gateItems, approvalRecords),
    recommended_owner_actions: recommendedOwnerActions(sourceStatus, gateItems, duplicateIdFindings),
    next_safe_actions: nextSafeActions(sourceStatus, eligibleCount),
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    fixture_manifest_write_allowed: eligibleCount > 0,
    fixture_manifest_file_created: false,
    production_manifest_write_allowed: false,
    manifest_export_allowed: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function writeGateItemsForApprovalItems(
  approvalItems: DraftManifestCreationDryRunApprovalItem[],
  records: SourceFolderFixtureManifestWriteGateApprovalRecord[],
  duplicateIds: Set<string>
): FixtureManifestWriteGateItem[] {
  const items: FixtureManifestWriteGateItem[] = [];
  for (const approvalItem of approvalItems) {
    const itemRecords = records.filter((record) => record.manifest_item_id === approvalItem.manifest_item_id);
    const selectedRecords = itemRecords.length > 0 ? itemRecords : [defaultWriteGateApprovalRecord(approvalItem.manifest_item_id)];
    for (const record of selectedRecords) items.push(writeGateItemForApprovalItem(approvalItem, record, duplicateIds));
  }
  return items;
}

function defaultWriteGateApprovalRecord(manifestItemId: string): SourceFolderFixtureManifestWriteGateApprovalRecord {
  return {
    manifest_item_id: manifestItemId,
    approval_record_found: false,
    owner_approved: false,
    approved_by: null,
    approved_at: null,
    approval_scope: null,
    requested_actions: []
  };
}

function writeGateItemForApprovalItem(
  approvalItem: DraftManifestCreationDryRunApprovalItem,
  record: SourceFolderFixtureManifestWriteGateApprovalRecord,
  duplicateIds: Set<string>
): FixtureManifestWriteGateItem {
  const missingRequired = missingRequiredFieldsFor(approvalItem);
  const missingApproval = missingApprovalFields(record);
  const blockingReasons = blockingReasonsFor(approvalItem, record, duplicateIds);
  const status = writeGateStatusFor(approvalItem, record, missingRequired, missingApproval, blockingReasons);

  return FixtureManifestWriteGateItemSchema.parse({
    manifest_item_id: approvalItem.manifest_item_id,
    suggested_footage_id: approvalItem.suggested_footage_id,
    filename: approvalItem.filename,
    relative_path: approvalItem.relative_path,
    source_creation_approval_status: approvalItem.approval_status,
    product_family: approvalItem.product_family,
    visual_type: approvalItem.visual_type,
    process_stage: approvalItem.process_stage,
    orientation: approvalItem.orientation,
    school_level: approvalItem.school_level,
    color_variant: approvalItem.color_variant,
    content_tags: approvalItem.content_tags,
    risk_flags: approvalItem.risk_flags,
    owner_approved: record.owner_approved,
    approval_record_found: record.approval_record_found,
    approved_by: record.approved_by,
    approved_at: record.approved_at,
    approval_scope: record.approval_scope,
    write_gate_status: status,
    missing_required_fields: missingRequired,
    missing_approval_fields: missingApproval,
    blocking_reasons: blockingReasons,
    review_notes: [
      `Source creation approval status: ${approvalItem.approval_status}.`,
      `Fixture manifest write gate status: ${status}.`,
      "Gate approval is future fixture manifest write dry-run eligibility only; no manifest file is created."
    ],
    recommended_action: recommendedAction(status)
  });
}

function missingRequiredFieldsFor(item: DraftManifestCreationDryRunApprovalItem): string[] {
  const missing: string[] = [];
  for (const field of [
    ["product_family", item.product_family],
    ["visual_type", item.visual_type],
    ["process_stage", item.process_stage],
    ["orientation", item.orientation],
    ["filename", item.filename],
    ["relative_path", item.relative_path]
  ] as const) {
    if (!field[1]) missing.push(field[0]);
  }
  return missing;
}

function missingApprovalFields(record: SourceFolderFixtureManifestWriteGateApprovalRecord): string[] {
  const missing: string[] = [];
  if (!record.approval_record_found) missing.push("approval_record_found");
  if (!record.owner_approved) missing.push("owner_approved");
  if (!record.approved_by) missing.push("approved_by");
  if (!record.approved_at) missing.push("approved_at");
  if (!record.approval_scope) missing.push("approval_scope");
  if (record.approval_scope && record.approval_scope !== FIXTURE_MANIFEST_WRITE_DRY_RUN_SCOPE) {
    missing.push("approval_scope_future_fixture_manifest_write_dry_run_review_only");
  }
  return missing;
}

function blockingReasonsFor(
  approvalItem: DraftManifestCreationDryRunApprovalItem,
  record: SourceFolderFixtureManifestWriteGateApprovalRecord,
  duplicateIds: Set<string>
): string[] {
  const reasons: string[] = [];
  if (approvalItem.approval_status !== "approved_for_future_fixture_manifest_write_gate") {
    reasons.push(`source_creation_approval_${approvalItem.approval_status}_cannot_be_upgraded`);
  }
  if (duplicateIds.has(approvalItem.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of approvalItem.blocking_reasons) reasons.push(`creation_approval_${reason}`);
  for (const riskFlag of approvalItem.risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const action of record.requested_actions) reasons.push(`denied_action_${action}`);
  if (approvalItem.relative_path.includes("..")) reasons.push("unsafe_relative_path_blocked");
  return reasons;
}

function writeGateStatusFor(
  approvalItem: DraftManifestCreationDryRunApprovalItem,
  record: SourceFolderFixtureManifestWriteGateApprovalRecord,
  missingRequiredFields: string[],
  missingApprovalFields: string[],
  blockingReasons: string[]
): z.infer<typeof FixtureManifestWriteGateStatusSchema> {
  if (blockingReasons.length > 0) return "blocked_write_gate";
  if (missingRequiredFields.length > 0) return "incomplete_write_gate";
  if (approvalItem.approval_status !== "approved_for_future_fixture_manifest_write_gate") return "blocked_write_gate";
  if (record.approval_record_found && record.owner_approved && missingApprovalFields.length > 0) {
    return "incomplete_write_gate";
  }
  if (!record.approval_record_found || !record.owner_approved) return "needs_owner_review";
  return "eligible_for_fixture_manifest_write_dry_run";
}

function duplicateSuggestedFootageIdsFromFindings(findings: string[]): Set<string> {
  const ids = new Set<string>();
  for (const finding of findings) {
    const [, id] = finding.split(":");
    if (id) ids.add(id);
  }
  return ids;
}

function writePolicyFindings(
  gate: SourceFolderDraftManifestCreationDryRunApprovalGateOutput,
  items: FixtureManifestWriteGateItem[]
): string[] {
  const findings = [
    "Phase 2J.21 is a fixture manifest write gate only; it creates no fixture manifest file.",
    "metadata_write_allowed, manifest_write_allowed, fixture_manifest_file_created, production_manifest_write_allowed, manifest_export_allowed, and public_ready remain false."
  ];
  if (gate.source_root !== SAFE_FIXTURE_ROOT) findings.push("source_root_not_safe_fixture_blocked");
  if (!gate.dry_run) findings.push("dry_run_required");
  if (!gate.read_only) findings.push("read_only_required");
  if (items.some((item) => item.blocking_reasons.length > 0)) findings.push("blocked_write_gate_items_present");
  return findings;
}

function summarizeDeniedActions(
  items: FixtureManifestWriteGateItem[],
  records: SourceFolderFixtureManifestWriteGateApprovalRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.manifest_item_id));
  return summarizeValues(records.filter((record) => itemIds.has(record.manifest_item_id)).flatMap((record) => record.requested_actions));
}

function recommendedOwnerActions(
  sourceStatus: "creation_approval_reviewable" | "creation_approval_denied",
  items: FixtureManifestWriteGateItem[],
  duplicateFindings: string[]
): string[] {
  if (sourceStatus !== "creation_approval_reviewable") {
    return ["Keep denied creation approval cases blocked; do not enter fixture manifest write dry-run review."];
  }
  const actions = [
    "Review future fixture manifest write dry-run candidates before any later dry-run phase.",
    "Do not create, write, export, import, save, or persist any manifest in Phase 2J.21."
  ];
  if (items.some((item) => item.write_gate_status === "needs_owner_review")) {
    actions.push("Add explicit fixture-write dry-run owner approval for rows that should proceed.");
  }
  if (items.some((item) => item.write_gate_status === "incomplete_write_gate")) {
    actions.push("Complete required metadata or approval metadata before future fixture manifest write dry-run review.");
  }
  if (items.some((item) => item.write_gate_status === "blocked_write_gate") || duplicateFindings.length > 0) {
    actions.push("Keep duplicate IDs, blocked upstream rows, risky flags, and write/import/export/render/upload/publish requests blocked.");
  }
  return actions;
}

function nextSafeActions(sourceStatus: "creation_approval_reviewable" | "creation_approval_denied", eligibleCount: number): string[] {
  if (sourceStatus !== "creation_approval_reviewable") {
    return [
      "Return to Phase 2J.20 creation dry-run approval gate before fixture manifest write gating.",
      "Do not create, export, import, write, save, or persist any manifest."
    ];
  }
  if (eligibleCount > 0) {
    return [
      "Treat fixture_manifest_write_allowed as future dry-run eligibility only.",
      "Do not write production manifests, fixture manifest files, draft manifest files, or real metadata stores.",
      "Do not open, decode, render, upload, publish, scan real folders, or mutate storage."
    ];
  }
  return [
    "Keep all rows in review until owner approval and required metadata are complete.",
    "Do not create, export, import, write, save, or persist any manifest."
  ];
}

function recommendedAction(status: z.infer<typeof FixtureManifestWriteGateStatusSchema>): string {
  if (status === "eligible_for_fixture_manifest_write_dry_run") {
    return "Allow this row to enter a future fixture manifest write dry-run review only; do not create a manifest now.";
  }
  if (status === "incomplete_write_gate") return "Complete required metadata or approval metadata before future dry-run review.";
  if (status === "blocked_write_gate") return "Keep blocked and remove duplicate IDs, risky flags, denied actions, or blocked upstream rows.";
  return "Request explicit fixture-write dry-run owner approval before this row can proceed.";
}

function countWriteGateStatus(
  items: FixtureManifestWriteGateItem[],
  status: z.infer<typeof FixtureManifestWriteGateStatusSchema>
): number {
  return items.filter((item) => item.write_gate_status === status).length;
}

function summarizeValues(values: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const value of values) summary[value] = (summary[value] || 0) + 1;
  return summary;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
