import { z } from "zod";
import {
  parseSourceFolderListingApprovalGateFixture,
  type SourceFolderListingApprovalGateFixture
} from "./source-folder-listing-approval-gate.ts";
import {
  parseSourceFolderListingReviewFixture,
  type SourceFolderListingReviewFixture
} from "./source-folder-listing-review.ts";
import {
  parseSourceFolderMetadataEnrichmentReviewFixture,
  type SourceFolderMetadataEnrichmentReviewFixture
} from "./source-folder-metadata-enrichment-review.ts";
import {
  parseSourceFolderMetadataEnrichmentApprovalGateFixture,
  type SourceFolderMetadataEnrichmentApprovalGateFixture
} from "./source-folder-metadata-enrichment-approval-gate.ts";
import {
  parseSourceFolderDraftManifestReviewFixture,
  type SourceFolderDraftManifestReviewFixture
} from "./source-folder-draft-manifest-review.ts";
import {
  parseSourceFolderDraftManifestApprovalGateFixture,
  reviewSourceFolderDraftManifestApprovalGateFixture,
  type DraftManifestApprovalItem,
  type SourceFolderDraftManifestApprovalGateFixture,
  type SourceFolderDraftManifestApprovalGateOutput
} from "./source-folder-draft-manifest-approval-gate.ts";

const CREATION_GATE_ID = "phase-2j18-source-folder-draft-manifest-creation-dry-run-gate";
const CREATION_DRY_RUN_SCOPE = "draft_manifest_creation_dry_run_only";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const CreationGateStatusSchema = z.enum([
  "eligible_for_creation_dry_run",
  "needs_owner_review",
  "incomplete_creation_gate",
  "blocked_creation_gate"
]);

const CreationGateActionSchema = z.enum([
  "metadata_write_requested",
  "metadata_import_requested",
  "manifest_write_requested",
  "manifest_import_requested",
  "manifest_export_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

export const SourceFolderDraftManifestCreationApprovalRecordSchema = z.object({
  manifest_item_id: z.string().min(1),
  approval_record_found: z.boolean(),
  owner_approved: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  requested_actions: z.array(CreationGateActionSchema).default([])
}).strict();

export const SourceFolderDraftManifestCreationDryRunGateFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-draft-manifest-creation-dry-run-gate-smoke-v1"),
  mode: z.literal("controlled_fixture_draft_manifest_creation_dry_run_gate"),
  source_draft_manifest_approval_gate_fixture: z.string().min(1),
  source_draft_manifest_review_fixture: z.string().min(1),
  source_metadata_enrichment_approval_gate_fixture: z.string().min(1),
  source_metadata_enrichment_fixture: z.string().min(1),
  source_listing_review_fixture: z.string().min(1),
  source_listing_gate_fixture: z.string().min(1),
  creation_approval_records: z.array(SourceFolderDraftManifestCreationApprovalRecordSchema).min(1),
  notes: z.string().min(1)
}).strict();

export const DraftManifestCreationGateItemSchema = z.object({
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_approval_status: z.enum([
    "approved_for_future_manifest_creation",
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
  creation_gate_status: CreationGateStatusSchema,
  missing_required_fields: z.array(z.string().min(1)),
  missing_approval_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderDraftManifestCreationDryRunGateOutputSchema = z.object({
  creation_gate_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  source_approval_status: z.enum(["draft_manifest_approval_reviewable", "draft_manifest_approval_denied"]),
  reviewed_approval_items: z.number().int().min(0),
  eligible_for_creation_dry_run: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_creation_gate: z.number().int().min(0),
  blocked_creation_gate: z.number().int().min(0),
  gate_items: z.array(DraftManifestCreationGateItemSchema),
  creation_policy_findings: z.array(z.string().min(1)),
  duplicate_id_findings: z.array(z.string().min(1)),
  missing_required_field_count: z.number().int().min(0),
  missing_approval_fields: z.record(z.string(), z.number().int().min(0)),
  blocked_reason_summary: z.record(z.string(), z.number().int().min(0)),
  denied_action_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  metadata_write_allowed: z.literal(false),
  manifest_write_allowed: z.literal(false),
  manifest_file_created: z.literal(false),
  manifest_export_allowed: z.literal(false),
  creation_dry_run_allowed: z.boolean(),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderDraftManifestCreationApprovalRecord = z.infer<
  typeof SourceFolderDraftManifestCreationApprovalRecordSchema
>;
export type SourceFolderDraftManifestCreationDryRunGateFixture = z.infer<
  typeof SourceFolderDraftManifestCreationDryRunGateFixtureSchema
>;
export type DraftManifestCreationGateItem = z.infer<typeof DraftManifestCreationGateItemSchema>;
export type SourceFolderDraftManifestCreationDryRunGateOutput = z.infer<
  typeof SourceFolderDraftManifestCreationDryRunGateOutputSchema
>;

export type SourceFolderDraftManifestCreationDryRunGateBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderDraftManifestCreationDryRunGateFixture;
  gates: SourceFolderDraftManifestCreationDryRunGateOutput[];
  reviewedApprovalItems: number;
  eligibleForCreationDryRunCount: number;
  needsOwnerReviewCount: number;
  incompleteCreationGateCount: number;
  blockedCreationGateCount: number;
  duplicateIdFindingsCount: number;
  missingRequiredFieldCount: number;
  missingApprovalFieldsCount: number;
  blockedReasonsCount: number;
  deniedActionCount: number;
  metadataWriteAllowedCount: number;
  manifestWriteAllowedCount: number;
  manifestFileCreatedCount: number;
  manifestExportAllowedCount: number;
  creationDryRunAllowedCount: number;
  creationDryRunAllowed: boolean;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderDraftManifestCreationDryRunGateFixture(
  input: unknown
): SourceFolderDraftManifestCreationDryRunGateFixture {
  return SourceFolderDraftManifestCreationDryRunGateFixtureSchema.parse(input);
}

export function reviewSourceFolderDraftManifestCreationDryRunGateFixture(input: {
  creationGateFixture: SourceFolderDraftManifestCreationDryRunGateFixture;
  draftManifestApprovalGateFixture: SourceFolderDraftManifestApprovalGateFixture;
  draftManifestReviewFixture: SourceFolderDraftManifestReviewFixture;
  metadataEnrichmentApprovalGateFixture: SourceFolderMetadataEnrichmentApprovalGateFixture;
  enrichmentFixture: SourceFolderMetadataEnrichmentReviewFixture;
  listingReviewFixture: SourceFolderListingReviewFixture;
  listingGateFixture: SourceFolderListingApprovalGateFixture;
}): SourceFolderDraftManifestCreationDryRunGateBatchResult {
  const draftManifestApprovalResult = reviewSourceFolderDraftManifestApprovalGateFixture({
    approvalGateFixture: input.draftManifestApprovalGateFixture,
    draftManifestReviewFixture: input.draftManifestReviewFixture,
    metadataEnrichmentApprovalGateFixture: input.metadataEnrichmentApprovalGateFixture,
    enrichmentFixture: input.enrichmentFixture,
    listingReviewFixture: input.listingReviewFixture,
    listingGateFixture: input.listingGateFixture
  });
  const gates = draftManifestApprovalResult.gates.map((gate) =>
    reviewDraftManifestApprovalForCreationDryRunGate(
      gate,
      input.creationGateFixture.creation_approval_records
    )
  );

  return {
    provider: "fake_content_engine",
    fixture: input.creationGateFixture,
    gates,
    reviewedApprovalItems: sum(gates.map((gate) => gate.reviewed_approval_items)),
    eligibleForCreationDryRunCount: sum(gates.map((gate) => gate.eligible_for_creation_dry_run)),
    needsOwnerReviewCount: sum(gates.map((gate) => gate.needs_owner_review)),
    incompleteCreationGateCount: sum(gates.map((gate) => gate.incomplete_creation_gate)),
    blockedCreationGateCount: sum(gates.map((gate) => gate.blocked_creation_gate)),
    duplicateIdFindingsCount: sum(gates.map((gate) => gate.duplicate_id_findings.length)),
    missingRequiredFieldCount: sum(gates.map((gate) => gate.missing_required_field_count)),
    missingApprovalFieldsCount: sum(gates.flatMap((gate) => Object.values(gate.missing_approval_fields))),
    blockedReasonsCount: sum(gates.flatMap((gate) => Object.values(gate.blocked_reason_summary))),
    deniedActionCount: sum(gates.flatMap((gate) => Object.values(gate.denied_action_summary))),
    metadataWriteAllowedCount: gates.filter((gate) => gate.metadata_write_allowed).length,
    manifestWriteAllowedCount: gates.filter((gate) => gate.manifest_write_allowed).length,
    manifestFileCreatedCount: gates.filter((gate) => gate.manifest_file_created).length,
    manifestExportAllowedCount: gates.filter((gate) => gate.manifest_export_allowed).length,
    creationDryRunAllowedCount: gates.filter((gate) => gate.creation_dry_run_allowed).length,
    creationDryRunAllowed: gates.some((gate) => gate.creation_dry_run_allowed),
    recommendedOwnerActionsCount: sum(gates.map((gate) => gate.recommended_owner_actions.length)),
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderDraftManifestCreationDryRunGateFixture(input: {
  creationGateFixtureInput: unknown;
  draftManifestApprovalGateFixtureInput: unknown;
  draftManifestReviewFixtureInput: unknown;
  metadataEnrichmentApprovalGateFixtureInput: unknown;
  enrichmentFixtureInput: unknown;
  listingReviewFixtureInput: unknown;
  listingGateFixtureInput: unknown;
}): SourceFolderDraftManifestCreationDryRunGateBatchResult {
  return reviewSourceFolderDraftManifestCreationDryRunGateFixture({
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

export function reviewDraftManifestApprovalForCreationDryRunGate(
  approvalGate: SourceFolderDraftManifestApprovalGateOutput,
  creationApprovalRecords: SourceFolderDraftManifestCreationApprovalRecord[]
): SourceFolderDraftManifestCreationDryRunGateOutput {
  const sourceApprovalStatus = approvalGate.draft_manifest_review_status === "draft_manifest_reviewable"
    ? "draft_manifest_approval_reviewable"
    : "draft_manifest_approval_denied";
  const duplicateIdFindings = approvalGate.duplicate_id_findings;
  const duplicateIds = duplicateSuggestedFootageIdsFromFindings(duplicateIdFindings);
  const gateItems = sourceApprovalStatus === "draft_manifest_approval_reviewable"
    ? gateItemsForApprovalItems(approvalGate.approval_items, creationApprovalRecords, duplicateIds)
    : [];
  const eligibleCount = countGateStatus(gateItems, "eligible_for_creation_dry_run");

  return SourceFolderDraftManifestCreationDryRunGateOutputSchema.parse({
    creation_gate_id: `${CREATION_GATE_ID}-${approvalGate.source_id}`,
    source_id: approvalGate.source_id,
    source_label: approvalGate.source_label,
    source_root: approvalGate.source_root,
    dry_run: approvalGate.dry_run,
    read_only: approvalGate.read_only,
    source_approval_status: sourceApprovalStatus,
    reviewed_approval_items: sourceApprovalStatus === "draft_manifest_approval_reviewable"
      ? approvalGate.approval_items.length
      : 0,
    eligible_for_creation_dry_run: eligibleCount,
    needs_owner_review: countGateStatus(gateItems, "needs_owner_review"),
    incomplete_creation_gate: countGateStatus(gateItems, "incomplete_creation_gate"),
    blocked_creation_gate: countGateStatus(gateItems, "blocked_creation_gate"),
    gate_items: gateItems,
    creation_policy_findings: creationPolicyFindings(approvalGate, gateItems),
    duplicate_id_findings: duplicateIdFindings,
    missing_required_field_count: sum(gateItems.map((item) => item.missing_required_fields.length)),
    missing_approval_fields: summarizeValues(gateItems.flatMap((item) => item.missing_approval_fields)),
    blocked_reason_summary: summarizeValues(gateItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(gateItems, creationApprovalRecords),
    recommended_owner_actions: recommendedOwnerActions(sourceApprovalStatus, gateItems, duplicateIdFindings),
    next_safe_actions: nextSafeActions(sourceApprovalStatus, eligibleCount),
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    manifest_file_created: false,
    manifest_export_allowed: false,
    creation_dry_run_allowed: eligibleCount > 0,
    public_ready: false,
    publish_track: "blocked"
  });
}

function gateItemsForApprovalItems(
  approvalItems: DraftManifestApprovalItem[],
  creationApprovalRecords: SourceFolderDraftManifestCreationApprovalRecord[],
  duplicateIds: Set<string>
): DraftManifestCreationGateItem[] {
  const items: DraftManifestCreationGateItem[] = [];
  for (const approvalItem of approvalItems) {
    const records = creationApprovalRecords.filter((record) => record.manifest_item_id === approvalItem.manifest_item_id);
    const selectedRecords = records.length > 0 ? records : [defaultCreationApprovalRecord(approvalItem.manifest_item_id)];
    for (const record of selectedRecords) items.push(gateItemForApprovalItem(approvalItem, record, duplicateIds));
  }
  return items;
}

function defaultCreationApprovalRecord(manifestItemId: string): SourceFolderDraftManifestCreationApprovalRecord {
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

function gateItemForApprovalItem(
  approvalItem: DraftManifestApprovalItem,
  record: SourceFolderDraftManifestCreationApprovalRecord,
  duplicateIds: Set<string>
): DraftManifestCreationGateItem {
  const missingRequired = missingRequiredFieldsFor(approvalItem);
  const missingApproval = missingApprovalFields(record);
  const blockingReasons = blockingReasonsFor(approvalItem, record, duplicateIds);
  const status = creationGateStatusFor(approvalItem, record, missingRequired, missingApproval, blockingReasons);

  return DraftManifestCreationGateItemSchema.parse({
    manifest_item_id: approvalItem.manifest_item_id,
    suggested_footage_id: approvalItem.suggested_footage_id,
    filename: approvalItem.filename,
    relative_path: approvalItem.relative_path,
    source_approval_status: approvalItem.approval_status,
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
    creation_gate_status: status,
    missing_required_fields: missingRequired,
    missing_approval_fields: missingApproval,
    blocking_reasons: blockingReasons,
    review_notes: reviewNotes(approvalItem, status),
    recommended_action: recommendedAction(status)
  });
}

function missingRequiredFieldsFor(item: DraftManifestApprovalItem): string[] {
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

function missingApprovalFields(record: SourceFolderDraftManifestCreationApprovalRecord): string[] {
  const missing: string[] = [];
  if (!record.approval_record_found) missing.push("approval_record_found");
  if (!record.owner_approved) missing.push("owner_approved");
  if (!record.approved_by) missing.push("approved_by");
  if (!record.approved_at) missing.push("approved_at");
  if (!record.approval_scope) missing.push("approval_scope");
  if (record.approval_scope && record.approval_scope !== CREATION_DRY_RUN_SCOPE) {
    missing.push("approval_scope_draft_manifest_creation_dry_run_only");
  }
  return missing;
}

function blockingReasonsFor(
  item: DraftManifestApprovalItem,
  record: SourceFolderDraftManifestCreationApprovalRecord,
  duplicateIds: Set<string>
): string[] {
  const reasons: string[] = [];
  if (item.approval_status === "blocked_approval") reasons.push("blocked_approval_cannot_be_upgraded");
  if (item.approval_status === "incomplete_approval") reasons.push("incomplete_approval_cannot_be_upgraded");
  if (duplicateIds.has(item.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of item.blocking_reasons) reasons.push(`draft_manifest_approval_${reason}`);
  for (const riskFlag of item.risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const action of record.requested_actions) reasons.push(`denied_action_${action}`);
  return reasons;
}

function creationGateStatusFor(
  item: DraftManifestApprovalItem,
  record: SourceFolderDraftManifestCreationApprovalRecord,
  missingRequiredFields: string[],
  missingApprovalFields: string[],
  blockingReasons: string[]
): z.infer<typeof CreationGateStatusSchema> {
  if (blockingReasons.length > 0) return "blocked_creation_gate";
  if (missingRequiredFields.length > 0) return "incomplete_creation_gate";
  if (record.approval_record_found && record.owner_approved && missingApprovalFields.length > 0) {
    return "incomplete_creation_gate";
  }
  if (!record.approval_record_found || !record.owner_approved) return "needs_owner_review";
  if (item.approval_status === "approved_for_future_manifest_creation") return "eligible_for_creation_dry_run";
  return "blocked_creation_gate";
}

function duplicateSuggestedFootageIdsFromFindings(findings: string[]): Set<string> {
  const ids = new Set<string>();
  for (const finding of findings) {
    const [, id] = finding.split(":");
    if (id) ids.add(id);
  }
  return ids;
}

function creationPolicyFindings(
  approvalGate: SourceFolderDraftManifestApprovalGateOutput,
  items: DraftManifestCreationGateItem[]
): string[] {
  const findings = [
    "Draft manifest creation dry-run gate only gates future dry-run eligibility; it does not create manifests.",
    "metadata_write_allowed, manifest_write_allowed, manifest_file_created, and manifest_export_allowed remain false.",
    "public_ready remains false and publish_track remains blocked."
  ];
  if (approvalGate.source_root !== SAFE_FIXTURE_ROOT) {
    findings.push("Source root is not the Phase 2J.8 safe fixture root; creation dry-run remains blocked.");
  }
  if (items.some((item) => item.creation_gate_status === "eligible_for_creation_dry_run")) {
    findings.push("Eligible items may only enter a later draft-manifest creation dry-run review phase.");
  }
  return findings;
}

function summarizeDeniedActions(
  items: DraftManifestCreationGateItem[],
  records: SourceFolderDraftManifestCreationApprovalRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.manifest_item_id));
  return summarizeValues(records.filter((record) => itemIds.has(record.manifest_item_id)).flatMap((record) => record.requested_actions));
}

function recommendedOwnerActions(
  sourceStatus: "draft_manifest_approval_reviewable" | "draft_manifest_approval_denied",
  items: DraftManifestCreationGateItem[],
  duplicateFindings: string[]
): string[] {
  if (sourceStatus === "draft_manifest_approval_denied") {
    return ["Keep denied draft manifest approval cases blocked; do not allow creation dry-run entry."];
  }
  const actions = [
    "Review eligible creation dry-run candidates before any later dry-run phase.",
    "Do not write, import, export, save, or persist manifests in Phase 2J.18."
  ];
  if (items.some((item) => item.creation_gate_status === "needs_owner_review")) {
    actions.push("Add explicit owner approval for creation-dry-run rows that should proceed later.");
  }
  if (items.some((item) => item.creation_gate_status === "incomplete_creation_gate")) {
    actions.push("Complete required metadata and creation-dry-run approval fields before retry.");
  }
  if (items.some((item) => item.creation_gate_status === "blocked_creation_gate") || duplicateFindings.length > 0) {
    actions.push("Keep duplicate IDs, blocked approvals, risky flags, and write/import/export/render/upload/publish requests out of creation dry-runs.");
  }
  return actions;
}

function nextSafeActions(
  sourceStatus: "draft_manifest_approval_reviewable" | "draft_manifest_approval_denied",
  eligibleCount: number
): string[] {
  if (sourceStatus === "draft_manifest_approval_denied") {
    return [
      "Return to Phase 2J.17 draft manifest approval before creation dry-run gating.",
      "Do not create, export, import, write, save, or persist any manifest.",
      "Keep real-looking paths as metadata strings only."
    ];
  }
  if (eligibleCount > 0) {
    return [
      "Treat creation_dry_run_allowed as permission for a later dry-run review only.",
      "Do not write production manifests, draft manifest files, or real metadata stores.",
      "Do not open, decode, render, upload, publish, scan real folders, or mutate storage."
    ];
  }
  return [
    "Keep all rows in review until owner approval and required metadata are complete.",
    "Do not create, export, import, write, save, or persist any manifest."
  ];
}

function reviewNotes(
  item: DraftManifestApprovalItem,
  status: z.infer<typeof CreationGateStatusSchema>
): string[] {
  return [
    `Source draft manifest approval status: ${item.approval_status}.`,
    `Creation dry-run gate status: ${status}.`,
    "Creation dry-run gate is gate-only; no manifest file is created."
  ];
}

function recommendedAction(status: z.infer<typeof CreationGateStatusSchema>): string {
  if (status === "eligible_for_creation_dry_run") {
    return "Allow this item to enter a future draft-manifest creation dry-run review only; do not create a manifest now.";
  }
  if (status === "incomplete_creation_gate") return "Complete required metadata or creation-dry-run approval fields before retry.";
  if (status === "blocked_creation_gate") return "Keep blocked and remove duplicate IDs, risky flags, denied actions, or blocked upstream approvals before retry.";
  return "Request explicit owner approval before this item can enter a creation dry-run.";
}

function countGateStatus(
  items: DraftManifestCreationGateItem[],
  status: z.infer<typeof CreationGateStatusSchema>
): number {
  return items.filter((item) => item.creation_gate_status === status).length;
}

function summarizeValues(values: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const value of values) summary[value] = (summary[value] || 0) + 1;
  return summary;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
