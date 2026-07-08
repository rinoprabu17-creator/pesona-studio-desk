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
  reviewSourceFolderDraftManifestFixture,
  type ManifestPreviewItem,
  type SourceFolderDraftManifestReviewFixture,
  type SourceFolderDraftManifestReviewOutput
} from "./source-folder-draft-manifest-review.ts";

const DRAFT_MANIFEST_APPROVAL_GATE_ID = "phase-2j17-source-folder-draft-manifest-approval-gate";
const FUTURE_MANIFEST_SCOPE = "future_draft_manifest_creation_only";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const DraftManifestApprovalStatusSchema = z.enum([
  "approved_for_future_manifest_creation",
  "needs_owner_review",
  "incomplete_approval",
  "blocked_approval"
]);

const DraftManifestApprovalActionSchema = z.enum([
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

export const SourceFolderDraftManifestApprovalRecordSchema = z.object({
  manifest_item_id: z.string().min(1),
  approval_record_found: z.boolean(),
  owner_approved: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  requested_actions: z.array(DraftManifestApprovalActionSchema).default([])
}).strict();

export const SourceFolderDraftManifestApprovalGateFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-draft-manifest-approval-gate-smoke-v1"),
  mode: z.literal("controlled_fixture_draft_manifest_approval_gate"),
  source_draft_manifest_review_fixture: z.string().min(1),
  source_metadata_enrichment_approval_gate_fixture: z.string().min(1),
  source_metadata_enrichment_fixture: z.string().min(1),
  source_listing_review_fixture: z.string().min(1),
  source_listing_gate_fixture: z.string().min(1),
  approval_records: z.array(SourceFolderDraftManifestApprovalRecordSchema).min(1),
  notes: z.string().min(1)
}).strict();

export const DraftManifestApprovalItemSchema = z.object({
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_manifest_review_status: z.enum([
    "manifest_preview_ok",
    "needs_owner_review",
    "blocked_manifest",
    "incomplete_manifest"
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
  approval_status: DraftManifestApprovalStatusSchema,
  missing_approval_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderDraftManifestApprovalGateOutputSchema = z.object({
  draft_manifest_approval_gate_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  draft_manifest_review_status: z.enum(["draft_manifest_reviewable", "draft_manifest_review_denied"]),
  reviewed_manifest_preview_items: z.number().int().min(0),
  approved_for_future_manifest_creation: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_approval: z.number().int().min(0),
  blocked_approval: z.number().int().min(0),
  approval_items: z.array(DraftManifestApprovalItemSchema),
  approval_policy_findings: z.array(z.string().min(1)),
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
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderDraftManifestApprovalRecord = z.infer<
  typeof SourceFolderDraftManifestApprovalRecordSchema
>;
export type SourceFolderDraftManifestApprovalGateFixture = z.infer<
  typeof SourceFolderDraftManifestApprovalGateFixtureSchema
>;
export type DraftManifestApprovalItem = z.infer<typeof DraftManifestApprovalItemSchema>;
export type SourceFolderDraftManifestApprovalGateOutput = z.infer<
  typeof SourceFolderDraftManifestApprovalGateOutputSchema
>;

export type SourceFolderDraftManifestApprovalGateBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderDraftManifestApprovalGateFixture;
  gates: SourceFolderDraftManifestApprovalGateOutput[];
  reviewedManifestPreviewItems: number;
  approvedForFutureManifestCreationCount: number;
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
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderDraftManifestApprovalGateFixture(
  input: unknown
): SourceFolderDraftManifestApprovalGateFixture {
  return SourceFolderDraftManifestApprovalGateFixtureSchema.parse(input);
}

export function reviewSourceFolderDraftManifestApprovalGateFixture(input: {
  approvalGateFixture: SourceFolderDraftManifestApprovalGateFixture;
  draftManifestReviewFixture: SourceFolderDraftManifestReviewFixture;
  metadataEnrichmentApprovalGateFixture: SourceFolderMetadataEnrichmentApprovalGateFixture;
  enrichmentFixture: SourceFolderMetadataEnrichmentReviewFixture;
  listingReviewFixture: SourceFolderListingReviewFixture;
  listingGateFixture: SourceFolderListingApprovalGateFixture;
}): SourceFolderDraftManifestApprovalGateBatchResult {
  const draftManifestReviewResult = reviewSourceFolderDraftManifestFixture({
    draftManifestReviewFixture: input.draftManifestReviewFixture,
    approvalGateFixture: input.metadataEnrichmentApprovalGateFixture,
    enrichmentFixture: input.enrichmentFixture,
    listingReviewFixture: input.listingReviewFixture,
    listingGateFixture: input.listingGateFixture
  });
  const gates = draftManifestReviewResult.reviews.map((review) =>
    reviewDraftManifestPreviewForApprovalGate(review, input.approvalGateFixture.approval_records)
  );

  return {
    provider: "fake_content_engine",
    fixture: input.approvalGateFixture,
    gates,
    reviewedManifestPreviewItems: sum(gates.map((gate) => gate.reviewed_manifest_preview_items)),
    approvedForFutureManifestCreationCount: sum(gates.map((gate) => gate.approved_for_future_manifest_creation)),
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
    recommendedOwnerActionsCount: sum(gates.map((gate) => gate.recommended_owner_actions.length)),
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderDraftManifestApprovalGateFixture(input: {
  approvalGateFixtureInput: unknown;
  draftManifestReviewFixtureInput: unknown;
  metadataEnrichmentApprovalGateFixtureInput: unknown;
  enrichmentFixtureInput: unknown;
  listingReviewFixtureInput: unknown;
  listingGateFixtureInput: unknown;
}): SourceFolderDraftManifestApprovalGateBatchResult {
  return reviewSourceFolderDraftManifestApprovalGateFixture({
    approvalGateFixture: parseSourceFolderDraftManifestApprovalGateFixture(input.approvalGateFixtureInput),
    draftManifestReviewFixture: parseSourceFolderDraftManifestReviewFixture(input.draftManifestReviewFixtureInput),
    metadataEnrichmentApprovalGateFixture: parseSourceFolderMetadataEnrichmentApprovalGateFixture(
      input.metadataEnrichmentApprovalGateFixtureInput
    ),
    enrichmentFixture: parseSourceFolderMetadataEnrichmentReviewFixture(input.enrichmentFixtureInput),
    listingReviewFixture: parseSourceFolderListingReviewFixture(input.listingReviewFixtureInput),
    listingGateFixture: parseSourceFolderListingApprovalGateFixture(input.listingGateFixtureInput)
  });
}

export function reviewDraftManifestPreviewForApprovalGate(
  draftManifestReview: SourceFolderDraftManifestReviewOutput,
  approvalRecords: SourceFolderDraftManifestApprovalRecord[]
): SourceFolderDraftManifestApprovalGateOutput {
  const reviewStatus = draftManifestReview.approval_gate_status === "approval_gate_reviewable"
    ? "draft_manifest_reviewable"
    : "draft_manifest_review_denied";
  const approvalItems = reviewStatus === "draft_manifest_reviewable"
    ? approvalItemsForPreview(draftManifestReview.manifest_preview, approvalRecords)
    : [];
  const duplicateIdFindings = duplicateIdFindingsFor(draftManifestReview.manifest_preview);

  return SourceFolderDraftManifestApprovalGateOutputSchema.parse({
    draft_manifest_approval_gate_id: `${DRAFT_MANIFEST_APPROVAL_GATE_ID}-${draftManifestReview.source_id}`,
    source_id: draftManifestReview.source_id,
    source_label: draftManifestReview.source_label,
    source_root: draftManifestReview.source_root,
    dry_run: draftManifestReview.dry_run,
    read_only: draftManifestReview.read_only,
    draft_manifest_review_status: reviewStatus,
    reviewed_manifest_preview_items: reviewStatus === "draft_manifest_reviewable"
      ? draftManifestReview.manifest_preview_items
      : 0,
    approved_for_future_manifest_creation: countApprovalStatus(approvalItems, "approved_for_future_manifest_creation"),
    needs_owner_review: countApprovalStatus(approvalItems, "needs_owner_review"),
    incomplete_approval: countApprovalStatus(approvalItems, "incomplete_approval"),
    blocked_approval: countApprovalStatus(approvalItems, "blocked_approval"),
    approval_items: approvalItems,
    approval_policy_findings: approvalPolicyFindings(draftManifestReview, approvalItems),
    duplicate_id_findings: duplicateIdFindings,
    missing_approval_fields: summarizeValues(approvalItems.flatMap((item) => item.missing_approval_fields)),
    blocked_reason_summary: summarizeValues(approvalItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(approvalItems, approvalRecords),
    recommended_owner_actions: recommendedOwnerActions(reviewStatus, approvalItems, duplicateIdFindings),
    next_safe_actions: nextSafeActions(reviewStatus),
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    manifest_file_created: false,
    manifest_export_allowed: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function approvalItemsForPreview(
  manifestPreview: ManifestPreviewItem[],
  approvalRecords: SourceFolderDraftManifestApprovalRecord[]
): DraftManifestApprovalItem[] {
  const items: DraftManifestApprovalItem[] = [];
  for (const previewItem of manifestPreview) {
    const records = approvalRecords.filter((record) => record.manifest_item_id === previewItem.manifest_item_id);
    const selectedRecords = records.length > 0 ? records : [defaultApprovalRecord(previewItem.manifest_item_id)];
    for (const record of selectedRecords) items.push(approvalItemForPreview(previewItem, record));
  }
  return items;
}

function defaultApprovalRecord(manifestItemId: string): SourceFolderDraftManifestApprovalRecord {
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
  previewItem: ManifestPreviewItem,
  record: SourceFolderDraftManifestApprovalRecord
): DraftManifestApprovalItem {
  const missingFields = missingApprovalFields(record);
  const blockingReasons = blockingReasonsFor(previewItem, record);
  const approvalStatus = approvalStatusFor(previewItem, record, missingFields, blockingReasons);

  return DraftManifestApprovalItemSchema.parse({
    manifest_item_id: previewItem.manifest_item_id,
    suggested_footage_id: previewItem.suggested_footage_id,
    filename: previewItem.filename,
    relative_path: previewItem.relative_path,
    source_manifest_review_status: previewItem.manifest_review_status,
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
    approval_status: approvalStatus,
    missing_approval_fields: missingFields,
    blocking_reasons: blockingReasons,
    review_notes: reviewNotes(previewItem, approvalStatus),
    recommended_action: recommendedAction(approvalStatus)
  });
}

function missingApprovalFields(record: SourceFolderDraftManifestApprovalRecord): string[] {
  const missing: string[] = [];
  if (!record.approval_record_found) missing.push("approval_record_found");
  if (!record.owner_approved) missing.push("owner_approved");
  if (!record.approved_by) missing.push("approved_by");
  if (!record.approved_at) missing.push("approved_at");
  if (!record.approval_scope) missing.push("approval_scope");
  if (record.approval_scope && record.approval_scope !== FUTURE_MANIFEST_SCOPE) {
    missing.push("approval_scope_future_draft_manifest_creation_only");
  }
  return missing;
}

function blockingReasonsFor(
  previewItem: ManifestPreviewItem,
  record: SourceFolderDraftManifestApprovalRecord
): string[] {
  const reasons: string[] = [];
  if (previewItem.manifest_review_status === "blocked_manifest") reasons.push("blocked_manifest_cannot_be_upgraded");
  if (previewItem.manifest_review_status === "incomplete_manifest") reasons.push("incomplete_manifest_cannot_be_approved");
  for (const reason of previewItem.blocking_reasons) reasons.push(`manifest_review_${reason}`);
  for (const field of [
    ["product_family", previewItem.product_family],
    ["visual_type", previewItem.visual_type],
    ["process_stage", previewItem.process_stage],
    ["orientation", previewItem.orientation],
    ["filename", previewItem.filename],
    ["relative_path", previewItem.relative_path]
  ] as const) {
    if (!field[1]) reasons.push(`missing_${field[0]}`);
  }
  for (const riskFlag of previewItem.risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const action of record.requested_actions) reasons.push(`denied_action_${action}`);
  return reasons;
}

function approvalStatusFor(
  previewItem: ManifestPreviewItem,
  record: SourceFolderDraftManifestApprovalRecord,
  missingFields: string[],
  blockingReasons: string[]
): z.infer<typeof DraftManifestApprovalStatusSchema> {
  if (blockingReasons.length > 0) return "blocked_approval";
  if (record.approval_record_found && record.owner_approved && missingFields.length > 0) return "incomplete_approval";
  if (!record.approval_record_found || !record.owner_approved) return "needs_owner_review";
  if (previewItem.manifest_review_status === "manifest_preview_ok") return "approved_for_future_manifest_creation";
  return "blocked_approval";
}

function duplicateIdFindingsFor(items: ManifestPreviewItem[]): string[] {
  const counts = summarizeValues(items.map((item) => item.suggested_footage_id));
  return Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([id, count]) => `duplicate_suggested_footage_id:${id}:${count}`);
}

function approvalPolicyFindings(
  draftManifestReview: SourceFolderDraftManifestReviewOutput,
  items: DraftManifestApprovalItem[]
): string[] {
  const findings = [
    "Draft manifest approval gate approves only future review eligibility; it does not create manifests.",
    "metadata_write_allowed, manifest_write_allowed, manifest_file_created, and manifest_export_allowed remain false.",
    "public_ready remains false and publish_track remains blocked."
  ];
  if (draftManifestReview.source_root !== SAFE_FIXTURE_ROOT) {
    findings.push("Source root is not the Phase 2J.8 safe fixture root; approval remains blocked.");
  }
  if (items.some((item) => item.approval_status === "approved_for_future_manifest_creation")) {
    findings.push("Approved items may only be reviewed in a later draft-manifest creation phase.");
  }
  return findings;
}

function summarizeDeniedActions(
  items: DraftManifestApprovalItem[],
  records: SourceFolderDraftManifestApprovalRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.manifest_item_id));
  return summarizeValues(records.filter((record) => itemIds.has(record.manifest_item_id)).flatMap((record) => record.requested_actions));
}

function recommendedOwnerActions(
  reviewStatus: "draft_manifest_reviewable" | "draft_manifest_review_denied",
  items: DraftManifestApprovalItem[],
  duplicateFindings: string[]
): string[] {
  if (reviewStatus === "draft_manifest_review_denied") {
    return ["Keep denied draft manifest review cases blocked; do not approve future manifest creation."];
  }
  const actions = [
    "Review approved future-manifest candidates before any later manifest creation phase.",
    "Do not write, import, export, or persist manifests in Phase 2J.17."
  ];
  if (items.some((item) => item.approval_status === "needs_owner_review")) {
    actions.push("Add explicit owner approval for manifest preview rows that should proceed later.");
  }
  if (items.some((item) => item.approval_status === "incomplete_approval")) {
    actions.push("Complete approved_by, approved_at, and future-manifest-only approval scope.");
  }
  if (items.some((item) => item.approval_status === "blocked_approval") || duplicateFindings.length > 0) {
    actions.push("Keep blocked manifest rows, duplicate IDs, risky flags, and write/import/export/render/upload/publish requests out of future manifests.");
  }
  return actions;
}

function nextSafeActions(status: "draft_manifest_reviewable" | "draft_manifest_review_denied"): string[] {
  if (status === "draft_manifest_review_denied") {
    return [
      "Return to Phase 2J.16 draft manifest review before approval.",
      "Do not create, export, import, or write any manifest.",
      "Keep real-looking paths as metadata strings only."
    ];
  }
  return [
    "Treat approvals as permission for a later draft-manifest creation review only.",
    "Do not write production manifests, draft manifest files, or real metadata stores.",
    "Do not open, decode, render, upload, publish, scan real folders, or mutate storage."
  ];
}

function reviewNotes(
  previewItem: ManifestPreviewItem,
  status: z.infer<typeof DraftManifestApprovalStatusSchema>
): string[] {
  return [
    `Source manifest review status: ${previewItem.manifest_review_status}.`,
    `Draft manifest approval status: ${status}.`,
    "Draft manifest approval gate is approval-only; no manifest file is created."
  ];
}

function recommendedAction(status: z.infer<typeof DraftManifestApprovalStatusSchema>): string {
  if (status === "approved_for_future_manifest_creation") {
    return "Allow this item to proceed to a future draft-manifest creation review only; do not create a manifest now.";
  }
  if (status === "incomplete_approval") return "Complete owner approval metadata before retry.";
  if (status === "blocked_approval") return "Keep blocked and remove duplicate IDs, risky flags, or denied action requests before retry.";
  return "Request explicit owner approval before this manifest preview item can proceed.";
}

function countApprovalStatus(
  items: DraftManifestApprovalItem[],
  status: z.infer<typeof DraftManifestApprovalStatusSchema>
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
