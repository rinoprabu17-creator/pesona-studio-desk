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
  type SourceFolderDraftManifestApprovalGateFixture
} from "./source-folder-draft-manifest-approval-gate.ts";
import {
  parseSourceFolderDraftManifestCreationDryRunGateFixture,
  type SourceFolderDraftManifestCreationDryRunGateFixture
} from "./source-folder-draft-manifest-creation-dry-run-gate.ts";
import {
  parseSourceFolderDraftManifestCreationDryRunReviewFixture,
  reviewSourceFolderDraftManifestCreationDryRunFixture,
  type DraftManifestCreationDryRunPreviewItem,
  type SourceFolderDraftManifestCreationDryRunReviewFixture,
  type SourceFolderDraftManifestCreationDryRunReviewOutput
} from "./source-folder-draft-manifest-creation-dry-run-review.ts";

const CREATION_REVIEW_APPROVAL_GATE_ID = "phase-2j20-source-folder-draft-manifest-creation-dry-run-approval-gate";
const FUTURE_FIXTURE_MANIFEST_WRITE_GATE_SCOPE = "future_fixture_manifest_write_gate_review_only";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const CreationReviewApprovalStatusSchema = z.enum([
  "approved_for_future_fixture_manifest_write_gate",
  "needs_owner_review",
  "incomplete_approval",
  "blocked_approval"
]);

const CreationReviewApprovalActionSchema = z.enum([
  "metadata_write_requested",
  "metadata_import_requested",
  "manifest_write_requested",
  "manifest_import_requested",
  "manifest_export_requested",
  "fixture_manifest_file_create_requested",
  "draft_manifest_file_create_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

export const SourceFolderDraftManifestCreationDryRunApprovalRecordSchema = z.object({
  manifest_item_id: z.string().min(1),
  approval_record_found: z.boolean(),
  owner_approved: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  requested_actions: z.array(CreationReviewApprovalActionSchema).default([])
}).strict();

export const SourceFolderDraftManifestCreationDryRunApprovalGateFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-draft-manifest-creation-dry-run-approval-gate-smoke-v1"),
  mode: z.literal("controlled_fixture_draft_manifest_creation_dry_run_approval_gate"),
  source_creation_review_fixture: z.string().min(1),
  source_creation_gate_fixture: z.string().min(1),
  source_draft_manifest_approval_gate_fixture: z.string().min(1),
  source_draft_manifest_review_fixture: z.string().min(1),
  source_metadata_enrichment_approval_gate_fixture: z.string().min(1),
  source_metadata_enrichment_fixture: z.string().min(1),
  source_listing_review_fixture: z.string().min(1),
  source_listing_gate_fixture: z.string().min(1),
  approval_records: z.array(SourceFolderDraftManifestCreationDryRunApprovalRecordSchema).min(1),
  notes: z.string().min(1)
}).strict();

export const DraftManifestCreationDryRunApprovalItemSchema = z.object({
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_dry_run_review_status: z.enum([
    "dry_run_preview_ok",
    "needs_owner_review",
    "incomplete_dry_run",
    "blocked_dry_run"
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
  approval_status: CreationReviewApprovalStatusSchema,
  missing_approval_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderDraftManifestCreationDryRunApprovalGateOutputSchema = z.object({
  creation_review_approval_gate_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  reviewed_dry_run_items: z.number().int().min(0),
  approved_for_future_fixture_manifest_write_gate: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_approval: z.number().int().min(0),
  blocked_approval: z.number().int().min(0),
  approval_items: z.array(DraftManifestCreationDryRunApprovalItemSchema),
  duplicate_id_findings: z.array(z.string().min(1)),
  missing_approval_fields: z.record(z.string(), z.number().int().min(0)),
  blocked_reason_summary: z.record(z.string(), z.number().int().min(0)),
  denied_action_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  metadata_write_allowed: z.literal(false),
  manifest_write_allowed: z.literal(false),
  manifest_file_created: z.literal(false),
  manifest_export_allowed: z.literal(false),
  fixture_manifest_write_gate_allowed: z.boolean(),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderDraftManifestCreationDryRunApprovalRecord = z.infer<
  typeof SourceFolderDraftManifestCreationDryRunApprovalRecordSchema
>;
export type SourceFolderDraftManifestCreationDryRunApprovalGateFixture = z.infer<
  typeof SourceFolderDraftManifestCreationDryRunApprovalGateFixtureSchema
>;
export type DraftManifestCreationDryRunApprovalItem = z.infer<
  typeof DraftManifestCreationDryRunApprovalItemSchema
>;
export type SourceFolderDraftManifestCreationDryRunApprovalGateOutput = z.infer<
  typeof SourceFolderDraftManifestCreationDryRunApprovalGateOutputSchema
>;

export type SourceFolderDraftManifestCreationDryRunApprovalGateBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderDraftManifestCreationDryRunApprovalGateFixture;
  gates: SourceFolderDraftManifestCreationDryRunApprovalGateOutput[];
  reviewedDryRunItems: number;
  approvedForFutureFixtureManifestWriteGateCount: number;
  needsOwnerReviewCount: number;
  incompleteApprovalCount: number;
  blockedApprovalCount: number;
  duplicateIdFindingsCount: number;
  missingApprovalFieldsCount: number;
  blockedReasonsCount: number;
  deniedActionCount: number;
  metadataWriteAllowedCount: number;
  manifestWriteAllowedCount: number;
  manifestFileCreatedCount: number;
  manifestExportAllowedCount: number;
  fixtureManifestWriteGateAllowedCount: number;
  fixtureManifestWriteGateAllowed: boolean;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderDraftManifestCreationDryRunApprovalGateFixture(
  input: unknown
): SourceFolderDraftManifestCreationDryRunApprovalGateFixture {
  return SourceFolderDraftManifestCreationDryRunApprovalGateFixtureSchema.parse(input);
}

export function reviewSourceFolderDraftManifestCreationDryRunApprovalGateFixture(input: {
  approvalGateFixture: SourceFolderDraftManifestCreationDryRunApprovalGateFixture;
  creationReviewFixture: SourceFolderDraftManifestCreationDryRunReviewFixture;
  creationGateFixture: SourceFolderDraftManifestCreationDryRunGateFixture;
  draftManifestApprovalGateFixture: SourceFolderDraftManifestApprovalGateFixture;
  draftManifestReviewFixture: SourceFolderDraftManifestReviewFixture;
  metadataEnrichmentApprovalGateFixture: SourceFolderMetadataEnrichmentApprovalGateFixture;
  enrichmentFixture: SourceFolderMetadataEnrichmentReviewFixture;
  listingReviewFixture: SourceFolderListingReviewFixture;
  listingGateFixture: SourceFolderListingApprovalGateFixture;
}): SourceFolderDraftManifestCreationDryRunApprovalGateBatchResult {
  const creationReviewResult = reviewSourceFolderDraftManifestCreationDryRunFixture({
    creationReviewFixture: input.creationReviewFixture,
    creationGateFixture: input.creationGateFixture,
    draftManifestApprovalGateFixture: input.draftManifestApprovalGateFixture,
    draftManifestReviewFixture: input.draftManifestReviewFixture,
    metadataEnrichmentApprovalGateFixture: input.metadataEnrichmentApprovalGateFixture,
    enrichmentFixture: input.enrichmentFixture,
    listingReviewFixture: input.listingReviewFixture,
    listingGateFixture: input.listingGateFixture
  });
  const gates = creationReviewResult.reviews.map((review) =>
    reviewCreationDryRunForApprovalGate(review, input.approvalGateFixture.approval_records)
  );

  return {
    provider: "fake_content_engine",
    fixture: input.approvalGateFixture,
    gates,
    reviewedDryRunItems: sum(gates.map((gate) => gate.reviewed_dry_run_items)),
    approvedForFutureFixtureManifestWriteGateCount: sum(gates.map((gate) => gate.approved_for_future_fixture_manifest_write_gate)),
    needsOwnerReviewCount: sum(gates.map((gate) => gate.needs_owner_review)),
    incompleteApprovalCount: sum(gates.map((gate) => gate.incomplete_approval)),
    blockedApprovalCount: sum(gates.map((gate) => gate.blocked_approval)),
    duplicateIdFindingsCount: sum(gates.map((gate) => gate.duplicate_id_findings.length)),
    missingApprovalFieldsCount: sum(gates.flatMap((gate) => Object.values(gate.missing_approval_fields))),
    blockedReasonsCount: sum(gates.flatMap((gate) => Object.values(gate.blocked_reason_summary))),
    deniedActionCount: sum(gates.flatMap((gate) => Object.values(gate.denied_action_summary))),
    metadataWriteAllowedCount: gates.filter((gate) => gate.metadata_write_allowed).length,
    manifestWriteAllowedCount: gates.filter((gate) => gate.manifest_write_allowed).length,
    manifestFileCreatedCount: gates.filter((gate) => gate.manifest_file_created).length,
    manifestExportAllowedCount: gates.filter((gate) => gate.manifest_export_allowed).length,
    fixtureManifestWriteGateAllowedCount: gates.filter((gate) => gate.fixture_manifest_write_gate_allowed).length,
    fixtureManifestWriteGateAllowed: gates.some((gate) => gate.fixture_manifest_write_gate_allowed),
    recommendedOwnerActionsCount: sum(gates.map((gate) => gate.recommended_owner_actions.length)),
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderDraftManifestCreationDryRunApprovalGateFixture(input: {
  approvalGateFixtureInput: unknown;
  creationReviewFixtureInput: unknown;
  creationGateFixtureInput: unknown;
  draftManifestApprovalGateFixtureInput: unknown;
  draftManifestReviewFixtureInput: unknown;
  metadataEnrichmentApprovalGateFixtureInput: unknown;
  enrichmentFixtureInput: unknown;
  listingReviewFixtureInput: unknown;
  listingGateFixtureInput: unknown;
}): SourceFolderDraftManifestCreationDryRunApprovalGateBatchResult {
  return reviewSourceFolderDraftManifestCreationDryRunApprovalGateFixture({
    approvalGateFixture: parseSourceFolderDraftManifestCreationDryRunApprovalGateFixture(input.approvalGateFixtureInput),
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

export function reviewCreationDryRunForApprovalGate(
  creationReview: SourceFolderDraftManifestCreationDryRunReviewOutput,
  approvalRecords: SourceFolderDraftManifestCreationDryRunApprovalRecord[]
): SourceFolderDraftManifestCreationDryRunApprovalGateOutput {
  const reviewable = creationReview.creation_gate_status === "creation_gate_reviewable";
  const duplicateIdFindings = duplicateIdFindingsFor(creationReview.preview_items);
  const approvalItems = reviewable
    ? approvalItemsForPreview(creationReview.preview_items, approvalRecords, duplicateIdFindings)
    : [];
  const approvedCount = countApprovalStatus(approvalItems, "approved_for_future_fixture_manifest_write_gate");

  return SourceFolderDraftManifestCreationDryRunApprovalGateOutputSchema.parse({
    creation_review_approval_gate_id: `${CREATION_REVIEW_APPROVAL_GATE_ID}-${creationReview.source_id}`,
    source_id: creationReview.source_id,
    source_label: creationReview.source_label,
    source_root: creationReview.source_root,
    dry_run: creationReview.dry_run,
    read_only: creationReview.read_only,
    reviewed_dry_run_items: reviewable ? approvalItems.length : 0,
    approved_for_future_fixture_manifest_write_gate: approvedCount,
    needs_owner_review: countApprovalStatus(approvalItems, "needs_owner_review"),
    incomplete_approval: countApprovalStatus(approvalItems, "incomplete_approval"),
    blocked_approval: countApprovalStatus(approvalItems, "blocked_approval"),
    approval_items: approvalItems,
    duplicate_id_findings: duplicateIdFindings,
    missing_approval_fields: summarizeValues(approvalItems.flatMap((item) => item.missing_approval_fields)),
    blocked_reason_summary: summarizeValues(approvalItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(approvalItems, approvalRecords),
    recommended_owner_actions: recommendedOwnerActions(reviewable, approvalItems, duplicateIdFindings),
    next_safe_actions: nextSafeActions(reviewable, approvedCount),
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    manifest_file_created: false,
    manifest_export_allowed: false,
    fixture_manifest_write_gate_allowed: approvedCount > 0,
    public_ready: false,
    publish_track: "blocked"
  });
}

function approvalItemsForPreview(
  previewItems: DraftManifestCreationDryRunPreviewItem[],
  records: SourceFolderDraftManifestCreationDryRunApprovalRecord[],
  duplicateFindings: string[]
): DraftManifestCreationDryRunApprovalItem[] {
  const items: DraftManifestCreationDryRunApprovalItem[] = [];
  const duplicateIds = duplicateSuggestedFootageIdsFromFindings(duplicateFindings);
  for (const previewItem of previewItems) {
    const itemRecords = records.filter((record) => record.manifest_item_id === previewItem.manifest_item_id);
    const selectedRecords = itemRecords.length > 0 ? itemRecords : [defaultApprovalRecord(previewItem.manifest_item_id)];
    for (const record of selectedRecords) items.push(approvalItemForPreview(previewItem, record, duplicateIds));
  }
  return items;
}

function defaultApprovalRecord(manifestItemId: string): SourceFolderDraftManifestCreationDryRunApprovalRecord {
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

function approvalItemForPreview(
  previewItem: DraftManifestCreationDryRunPreviewItem,
  record: SourceFolderDraftManifestCreationDryRunApprovalRecord,
  duplicateIds: Set<string>
): DraftManifestCreationDryRunApprovalItem {
  const missingApproval = missingApprovalFields(record);
  const blockingReasons = blockingReasonsFor(previewItem, record, duplicateIds);
  const status = approvalStatusFor(previewItem, record, missingApproval, blockingReasons);

  return DraftManifestCreationDryRunApprovalItemSchema.parse({
    manifest_item_id: previewItem.manifest_item_id,
    suggested_footage_id: previewItem.suggested_footage_id,
    filename: previewItem.filename,
    relative_path: previewItem.relative_path,
    source_dry_run_review_status: previewItem.dry_run_review_status,
    product_family: previewItem.product_family,
    visual_type: previewItem.visual_type,
    process_stage: previewItem.process_stage,
    orientation: previewItem.orientation,
    school_level: previewItem.school_level,
    color_variant: previewItem.color_variant,
    content_tags: previewItem.content_tags,
    risk_flags: previewItem.risk_flags,
    owner_approved: record.owner_approved,
    approval_record_found: record.approval_record_found,
    approved_by: record.approved_by,
    approved_at: record.approved_at,
    approval_scope: record.approval_scope,
    approval_status: status,
    missing_approval_fields: missingApproval,
    blocking_reasons: blockingReasons,
    review_notes: [
      `Source dry-run review status: ${previewItem.dry_run_review_status}.`,
      `Creation dry-run approval status: ${status}.`,
      "Approval is future fixture manifest-write gate eligibility only; no manifest file is created."
    ],
    recommended_action: recommendedAction(status)
  });
}

function missingApprovalFields(record: SourceFolderDraftManifestCreationDryRunApprovalRecord): string[] {
  const missing: string[] = [];
  if (!record.approval_record_found) missing.push("approval_record_found");
  if (!record.owner_approved) missing.push("owner_approved");
  if (!record.approved_by) missing.push("approved_by");
  if (!record.approved_at) missing.push("approved_at");
  if (!record.approval_scope) missing.push("approval_scope");
  if (record.approval_scope && record.approval_scope !== FUTURE_FIXTURE_MANIFEST_WRITE_GATE_SCOPE) {
    missing.push("approval_scope_future_fixture_manifest_write_gate_review_only");
  }
  return missing;
}

function blockingReasonsFor(
  previewItem: DraftManifestCreationDryRunPreviewItem,
  record: SourceFolderDraftManifestCreationDryRunApprovalRecord,
  duplicateIds: Set<string>
): string[] {
  const reasons: string[] = [];
  if (previewItem.dry_run_review_status === "blocked_dry_run") reasons.push("blocked_dry_run_cannot_be_upgraded");
  if (previewItem.dry_run_review_status === "incomplete_dry_run") reasons.push("incomplete_dry_run_cannot_be_upgraded");
  if (duplicateIds.has(previewItem.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of previewItem.blocking_reasons) reasons.push(`creation_dry_run_${reason}`);
  for (const riskFlag of previewItem.risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const action of record.requested_actions) reasons.push(`denied_action_${action}`);
  if (previewItem.relative_path.includes("..")) reasons.push("unsafe_relative_path_blocked");
  return reasons;
}

function approvalStatusFor(
  previewItem: DraftManifestCreationDryRunPreviewItem,
  record: SourceFolderDraftManifestCreationDryRunApprovalRecord,
  missingApprovalFields: string[],
  blockingReasons: string[]
): z.infer<typeof CreationReviewApprovalStatusSchema> {
  if (blockingReasons.length > 0) return "blocked_approval";
  if (previewItem.dry_run_review_status !== "dry_run_preview_ok") return "blocked_approval";
  if (record.approval_record_found && record.owner_approved && missingApprovalFields.length > 0) {
    return "incomplete_approval";
  }
  if (!record.approval_record_found || !record.owner_approved) return "needs_owner_review";
  return "approved_for_future_fixture_manifest_write_gate";
}

function duplicateIdFindingsFor(items: DraftManifestCreationDryRunPreviewItem[]): string[] {
  const manifestIdsBySuggestedId = new Map<string, Set<string>>();
  for (const item of items) {
    const manifestIds = manifestIdsBySuggestedId.get(item.suggested_footage_id) || new Set<string>();
    manifestIds.add(item.manifest_item_id);
    manifestIdsBySuggestedId.set(item.suggested_footage_id, manifestIds);
  }
  return [...manifestIdsBySuggestedId.entries()]
    .filter(([, manifestIds]) => manifestIds.size > 1)
    .map(([id, manifestIds]) => `duplicate_suggested_footage_id:${id}:${manifestIds.size}`);
}

function duplicateSuggestedFootageIdsFromFindings(findings: string[]): Set<string> {
  const ids = new Set<string>();
  for (const finding of findings) {
    const [, id] = finding.split(":");
    if (id) ids.add(id);
  }
  return ids;
}

function summarizeDeniedActions(
  items: DraftManifestCreationDryRunApprovalItem[],
  records: SourceFolderDraftManifestCreationDryRunApprovalRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.manifest_item_id));
  return summarizeValues(records.filter((record) => itemIds.has(record.manifest_item_id)).flatMap((record) => record.requested_actions));
}

function recommendedOwnerActions(
  reviewable: boolean,
  items: DraftManifestCreationDryRunApprovalItem[],
  duplicateFindings: string[]
): string[] {
  if (!reviewable) return ["Keep denied creation dry-run review cases blocked; do not approve fixture manifest-write gate entry."];
  const actions = [
    "Review future fixture manifest-write gate candidates before any later gate phase.",
    "Do not create, write, export, import, save, or persist any manifest in Phase 2J.20."
  ];
  if (items.some((item) => item.approval_status === "needs_owner_review")) {
    actions.push("Add explicit owner approval for rows that should proceed to the future fixture manifest-write gate.");
  }
  if (items.some((item) => item.approval_status === "incomplete_approval")) {
    actions.push("Complete approval metadata before future fixture manifest-write gate review.");
  }
  if (items.some((item) => item.approval_status === "blocked_approval") || duplicateFindings.length > 0) {
    actions.push("Keep duplicate IDs, blocked dry-runs, risky flags, and write/import/export/render/upload/publish requests blocked.");
  }
  return actions;
}

function nextSafeActions(reviewable: boolean, approvedCount: number): string[] {
  if (!reviewable) {
    return [
      "Return to Phase 2J.19 creation dry-run review before approval gating.",
      "Do not create, export, import, write, save, or persist any manifest."
    ];
  }
  if (approvedCount > 0) {
    return [
      "Treat fixture_manifest_write_gate_allowed as future gate eligibility only.",
      "Do not write production manifests, fixture manifest files, draft manifest files, or real metadata stores.",
      "Do not open, decode, render, upload, publish, scan real folders, or mutate storage."
    ];
  }
  return [
    "Keep all rows in review until owner approval and required approval metadata are complete.",
    "Do not create, export, import, write, save, or persist any manifest."
  ];
}

function recommendedAction(status: z.infer<typeof CreationReviewApprovalStatusSchema>): string {
  if (status === "approved_for_future_fixture_manifest_write_gate") {
    return "Allow this row to enter a future fixture manifest-write gate review only; do not create a manifest now.";
  }
  if (status === "incomplete_approval") return "Complete approval metadata before future gate review.";
  if (status === "blocked_approval") return "Keep blocked and remove duplicate IDs, risky flags, denied actions, or blocked upstream rows.";
  return "Request explicit owner approval before this row can proceed.";
}

function countApprovalStatus(
  items: DraftManifestCreationDryRunApprovalItem[],
  status: z.infer<typeof CreationReviewApprovalStatusSchema>
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
