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
  reviewSourceFolderMetadataEnrichmentApprovalGateFixture,
  type SourceFolderMetadataEnrichmentApprovalGateFixture,
  type SourceFolderMetadataEnrichmentApprovalGateOutput,
  type SourceFolderMetadataEnrichmentApprovalItem
} from "./source-folder-metadata-enrichment-approval-gate.ts";

const DRAFT_MANIFEST_REVIEW_ID = "phase-2j16-source-folder-draft-manifest-review";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const ManifestReviewStatusSchema = z.enum([
  "manifest_preview_ok",
  "needs_owner_review",
  "blocked_manifest",
  "incomplete_manifest"
]);

const ManifestReviewActionSchema = z.enum([
  "metadata_write_requested",
  "metadata_import_requested",
  "manifest_write_requested",
  "manifest_export_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

export const SourceFolderDraftManifestReviewOverrideSchema = z.object({
  suggested_footage_id: z.string().min(1),
  force_missing_fields: z.array(z.string().min(1)).default([]),
  requires_owner_cleanup: z.boolean().default(false),
  duplicate_preview_item: z.boolean().default(false),
  requested_actions: z.array(ManifestReviewActionSchema).default([])
}).strict();

export const SourceFolderDraftManifestReviewFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-draft-manifest-review-smoke-v1"),
  mode: z.literal("controlled_fixture_draft_manifest_review"),
  source_metadata_enrichment_approval_gate_fixture: z.string().min(1),
  source_metadata_enrichment_fixture: z.string().min(1),
  source_listing_review_fixture: z.string().min(1),
  source_listing_gate_fixture: z.string().min(1),
  manifest_review_overrides: z.array(SourceFolderDraftManifestReviewOverrideSchema).default([]),
  notes: z.string().min(1)
}).strict();

export const ManifestPreviewItemSchema = z.object({
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  product_family: z.string().min(1).nullable(),
  visual_type: z.string().min(1).nullable(),
  process_stage: z.string().min(1).nullable(),
  orientation: z.enum(["vertical", "horizontal", "square", "unknown"]).nullable(),
  school_level: z.string().min(1).nullable(),
  color_variant: z.string().min(1).nullable(),
  content_tags: z.array(z.string().min(1)),
  risk_flags: z.array(z.string().min(1)),
  recommended_use: z.string().min(1),
  channel_fit: z.array(z.string().min(1)),
  usable_guess: z.boolean(),
  duration_sec: z.null(),
  source_approval_status: z.enum([
    "approved_for_draft_manifest",
    "needs_owner_review",
    "blocked_approval",
    "incomplete_approval"
  ]),
  manifest_review_status: ManifestReviewStatusSchema,
  missing_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderDraftManifestReviewOutputSchema = z.object({
  draft_manifest_review_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  approval_gate_status: z.enum(["approval_gate_reviewable", "approval_gate_denied"]),
  reviewed_approval_items: z.number().int().min(0),
  manifest_preview_items: z.number().int().min(0),
  manifest_ready_count: z.number().int().min(0),
  needs_owner_review_count: z.number().int().min(0),
  blocked_manifest_count: z.number().int().min(0),
  incomplete_manifest_count: z.number().int().min(0),
  duplicate_id_count: z.number().int().min(0),
  missing_required_field_count: z.number().int().min(0),
  manifest_preview: z.array(ManifestPreviewItemSchema),
  manifest_policy_findings: z.array(z.string().min(1)),
  blocked_reason_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  metadata_write_allowed: z.literal(false),
  manifest_write_allowed: z.literal(false),
  manifest_file_created: z.literal(false),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderDraftManifestReviewOverride = z.infer<
  typeof SourceFolderDraftManifestReviewOverrideSchema
>;
export type SourceFolderDraftManifestReviewFixture = z.infer<
  typeof SourceFolderDraftManifestReviewFixtureSchema
>;
export type ManifestPreviewItem = z.infer<typeof ManifestPreviewItemSchema>;
export type SourceFolderDraftManifestReviewOutput = z.infer<
  typeof SourceFolderDraftManifestReviewOutputSchema
>;

export type SourceFolderDraftManifestReviewBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderDraftManifestReviewFixture;
  reviews: SourceFolderDraftManifestReviewOutput[];
  reviewedApprovalItems: number;
  manifestPreviewItems: number;
  manifestPreviewOkCount: number;
  needsOwnerReviewCount: number;
  incompleteManifestCount: number;
  blockedManifestCount: number;
  duplicateIdCount: number;
  missingRequiredFieldCount: number;
  metadataWriteAllowedCount: number;
  manifestWriteAllowedCount: number;
  manifestFileCreatedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderDraftManifestReviewFixture(
  input: unknown
): SourceFolderDraftManifestReviewFixture {
  return SourceFolderDraftManifestReviewFixtureSchema.parse(input);
}

export function reviewSourceFolderDraftManifestFixture(input: {
  draftManifestReviewFixture: SourceFolderDraftManifestReviewFixture;
  approvalGateFixture: SourceFolderMetadataEnrichmentApprovalGateFixture;
  enrichmentFixture: SourceFolderMetadataEnrichmentReviewFixture;
  listingReviewFixture: SourceFolderListingReviewFixture;
  listingGateFixture: SourceFolderListingApprovalGateFixture;
}): SourceFolderDraftManifestReviewBatchResult {
  const approvalGateResult = reviewSourceFolderMetadataEnrichmentApprovalGateFixture({
    approvalGateFixture: input.approvalGateFixture,
    enrichmentFixture: input.enrichmentFixture,
    listingReviewFixture: input.listingReviewFixture,
    listingGateFixture: input.listingGateFixture
  });
  const reviews = approvalGateResult.gates.map((gate) =>
    reviewApprovalGateForDraftManifest(gate, input.draftManifestReviewFixture.manifest_review_overrides)
  );

  return {
    provider: "fake_content_engine",
    fixture: input.draftManifestReviewFixture,
    reviews,
    reviewedApprovalItems: sum(reviews.map((review) => review.reviewed_approval_items)),
    manifestPreviewItems: sum(reviews.map((review) => review.manifest_preview_items)),
    manifestPreviewOkCount: sum(reviews.map((review) => review.manifest_ready_count)),
    needsOwnerReviewCount: sum(reviews.map((review) => review.needs_owner_review_count)),
    incompleteManifestCount: sum(reviews.map((review) => review.incomplete_manifest_count)),
    blockedManifestCount: sum(reviews.map((review) => review.blocked_manifest_count)),
    duplicateIdCount: sum(reviews.map((review) => review.duplicate_id_count)),
    missingRequiredFieldCount: sum(reviews.map((review) => review.missing_required_field_count)),
    metadataWriteAllowedCount: reviews.filter((review) => review.metadata_write_allowed).length,
    manifestWriteAllowedCount: reviews.filter((review) => review.manifest_write_allowed).length,
    manifestFileCreatedCount: reviews.filter((review) => review.manifest_file_created).length,
    recommendedOwnerActionsCount: sum(reviews.map((review) => review.recommended_owner_actions.length)),
    publicReadyCount: reviews.filter((review) => review.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderDraftManifestFixture(input: {
  draftManifestReviewFixtureInput: unknown;
  approvalGateFixtureInput: unknown;
  enrichmentFixtureInput: unknown;
  listingReviewFixtureInput: unknown;
  listingGateFixtureInput: unknown;
}): SourceFolderDraftManifestReviewBatchResult {
  return reviewSourceFolderDraftManifestFixture({
    draftManifestReviewFixture: parseSourceFolderDraftManifestReviewFixture(input.draftManifestReviewFixtureInput),
    approvalGateFixture: parseSourceFolderMetadataEnrichmentApprovalGateFixture(input.approvalGateFixtureInput),
    enrichmentFixture: parseSourceFolderMetadataEnrichmentReviewFixture(input.enrichmentFixtureInput),
    listingReviewFixture: parseSourceFolderListingReviewFixture(input.listingReviewFixtureInput),
    listingGateFixture: parseSourceFolderListingApprovalGateFixture(input.listingGateFixtureInput)
  });
}

export function reviewApprovalGateForDraftManifest(
  approvalGate: SourceFolderMetadataEnrichmentApprovalGateOutput,
  overrides: SourceFolderDraftManifestReviewOverride[]
): SourceFolderDraftManifestReviewOutput {
  const approvalGateStatus = approvalGate.reviewed_suggestions > 0
    ? "approval_gate_reviewable"
    : "approval_gate_denied";
  const reviewableItems = approvalGateStatus === "approval_gate_reviewable" ? approvalGate.approval_items : [];
  const draftItems = expandDuplicatePreviewItems(reviewableItems, overrides).map((item, index) =>
    manifestPreviewItemForApprovalItem(item, overridesFor(item.suggested_footage_id, overrides), index)
  );
  const duplicateIds = duplicateSuggestedFootageIds(draftItems);
  const manifestPreview = draftItems.map((item) =>
    duplicateIds.has(item.suggested_footage_id)
      ? applyDuplicateBlock(item)
      : item
  );

  return SourceFolderDraftManifestReviewOutputSchema.parse({
    draft_manifest_review_id: `${DRAFT_MANIFEST_REVIEW_ID}-${approvalGate.source_id}`,
    source_id: approvalGate.source_id,
    source_label: approvalGate.source_label,
    source_root: approvalGate.source_root,
    dry_run: approvalGate.dry_run,
    read_only: approvalGate.read_only,
    approval_gate_status: approvalGateStatus,
    reviewed_approval_items: reviewableItems.length,
    manifest_preview_items: manifestPreview.length,
    manifest_ready_count: countManifestStatus(manifestPreview, "manifest_preview_ok"),
    needs_owner_review_count: countManifestStatus(manifestPreview, "needs_owner_review"),
    blocked_manifest_count: countManifestStatus(manifestPreview, "blocked_manifest"),
    incomplete_manifest_count: countManifestStatus(manifestPreview, "incomplete_manifest"),
    duplicate_id_count: duplicateCount(manifestPreview),
    missing_required_field_count: sum(manifestPreview.map((item) => item.missing_fields.length)),
    manifest_preview: manifestPreview,
    manifest_policy_findings: manifestPolicyFindings(approvalGate, approvalGateStatus, manifestPreview),
    blocked_reason_summary: summarizeValues(manifestPreview.flatMap((item) => item.blocking_reasons)),
    recommended_owner_actions: recommendedOwnerActions(approvalGateStatus, manifestPreview),
    next_safe_actions: nextSafeActions(approvalGateStatus),
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    manifest_file_created: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function expandDuplicatePreviewItems(
  items: SourceFolderMetadataEnrichmentApprovalItem[],
  overrides: SourceFolderDraftManifestReviewOverride[]
): SourceFolderMetadataEnrichmentApprovalItem[] {
  const expanded: SourceFolderMetadataEnrichmentApprovalItem[] = [];
  for (const item of items) {
    expanded.push(item);
    if (overridesFor(item.suggested_footage_id, overrides).some((override) => override.duplicate_preview_item)) {
      expanded.push(item);
    }
  }
  return expanded;
}

function manifestPreviewItemForApprovalItem(
  item: SourceFolderMetadataEnrichmentApprovalItem,
  overrides: SourceFolderDraftManifestReviewOverride[],
  index: number
): ManifestPreviewItem {
  const requestedActions = overrides.flatMap((override) => override.requested_actions);
  const missingFields = missingRequiredFields(item, overrides);
  const blockingReasons = blockingReasonsFor(item, requestedActions);
  const requiresOwnerCleanup = overrides.some((override) => override.requires_owner_cleanup);
  const status = manifestReviewStatusFor(item, missingFields, blockingReasons, requiresOwnerCleanup);

  return ManifestPreviewItemSchema.parse({
    manifest_item_id: `${item.suggested_footage_id}-preview-${index + 1}`,
    suggested_footage_id: item.suggested_footage_id,
    filename: item.filename,
    relative_path: item.relative_path,
    product_family: missingFields.includes("product_family") ? null : item.suggested_product_family,
    visual_type: missingFields.includes("visual_type") ? null : item.suggested_visual_type,
    process_stage: missingFields.includes("process_stage") ? null : item.suggested_process_stage,
    orientation: missingFields.includes("orientation") ? null : item.suggested_orientation,
    school_level: item.suggested_school_level,
    color_variant: item.suggested_color_variant,
    content_tags: item.suggested_content_tags,
    risk_flags: item.suggested_risk_flags,
    recommended_use: recommendedUse(item.approval_status),
    channel_fit: channelFit(item.suggested_orientation),
    usable_guess: status === "manifest_preview_ok",
    duration_sec: null,
    source_approval_status: item.approval_status,
    manifest_review_status: status,
    missing_fields: missingFields,
    blocking_reasons: blockingReasons,
    review_notes: reviewNotes(item, status),
    recommended_action: recommendedAction(status)
  });
}

function missingRequiredFields(
  item: SourceFolderMetadataEnrichmentApprovalItem,
  overrides: SourceFolderDraftManifestReviewOverride[]
): string[] {
  const missing: string[] = [];
  if (!item.filename) missing.push("filename");
  if (!item.relative_path) missing.push("relative_path");
  if (!item.suggested_product_family) missing.push("product_family");
  if (!item.suggested_visual_type) missing.push("visual_type");
  if (!item.suggested_process_stage) missing.push("process_stage");
  if (!item.suggested_orientation) missing.push("orientation");
  for (const forcedField of overrides.flatMap((override) => override.force_missing_fields)) {
    if (!missing.includes(forcedField)) missing.push(forcedField);
  }
  return missing;
}

function blockingReasonsFor(
  item: SourceFolderMetadataEnrichmentApprovalItem,
  requestedActions: z.infer<typeof ManifestReviewActionSchema>[]
): string[] {
  const reasons: string[] = [];
  if (item.approval_status === "blocked_approval") reasons.push("blocked_approval_cannot_be_upgraded");
  for (const reason of item.blocking_reasons) reasons.push(`approval_${reason}`);
  for (const riskFlag of item.suggested_risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const action of requestedActions) reasons.push(`denied_action_${action}`);
  return reasons;
}

function manifestReviewStatusFor(
  item: SourceFolderMetadataEnrichmentApprovalItem,
  missingFields: string[],
  blockingReasons: string[],
  requiresOwnerCleanup: boolean
): z.infer<typeof ManifestReviewStatusSchema> {
  if (blockingReasons.length > 0) return "blocked_manifest";
  if (item.approval_status === "incomplete_approval" || missingFields.length > 0) return "incomplete_manifest";
  if (item.approval_status === "needs_owner_review" || requiresOwnerCleanup) return "needs_owner_review";
  if (item.approval_status === "approved_for_draft_manifest") return "manifest_preview_ok";
  return "blocked_manifest";
}

function applyDuplicateBlock(item: ManifestPreviewItem): ManifestPreviewItem {
  const blockingReasons = item.blocking_reasons.includes("duplicate_suggested_footage_id")
    ? item.blocking_reasons
    : [...item.blocking_reasons, "duplicate_suggested_footage_id"];
  const reviewNotes = item.review_notes.includes("Duplicate suggested footage ID detected in preview-only review.")
    ? item.review_notes
    : [...item.review_notes, "Duplicate suggested footage ID detected in preview-only review."];

  return ManifestPreviewItemSchema.parse({
    ...item,
    usable_guess: false,
    manifest_review_status: "blocked_manifest",
    blocking_reasons: blockingReasons,
    review_notes: reviewNotes,
    recommended_action: "Keep duplicate IDs blocked before any future manifest phase."
  });
}

function duplicateSuggestedFootageIds(items: ManifestPreviewItem[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of items) {
    if (seen.has(item.suggested_footage_id)) duplicates.add(item.suggested_footage_id);
    seen.add(item.suggested_footage_id);
  }
  return duplicates;
}

function duplicateCount(items: ManifestPreviewItem[]): number {
  const unique = new Set(items.map((item) => item.suggested_footage_id));
  return items.length - unique.size;
}

function manifestPolicyFindings(
  approvalGate: SourceFolderMetadataEnrichmentApprovalGateOutput,
  approvalGateStatus: "approval_gate_reviewable" | "approval_gate_denied",
  items: ManifestPreviewItem[]
): string[] {
  const findings = [
    "Draft manifest review is preview-only and keeps metadata_write_allowed false.",
    "manifest_write_allowed and manifest_file_created remain false.",
    "public_ready remains false and publish_track remains blocked."
  ];
  if (approvalGate.source_root !== SAFE_FIXTURE_ROOT) {
    findings.push("Source root is not the Phase 2J.8 safe fixture root; manifest preview remains blocked.");
  }
  if (approvalGateStatus === "approval_gate_denied") {
    findings.push("Denied upstream approval gate produced zero manifest preview items.");
  }
  if (items.some((item) => item.manifest_review_status === "manifest_preview_ok")) {
    findings.push("Approved items create only an in-memory preview record, not a manifest file.");
  }
  return findings;
}

function recommendedOwnerActions(
  approvalGateStatus: "approval_gate_reviewable" | "approval_gate_denied",
  items: ManifestPreviewItem[]
): string[] {
  if (approvalGateStatus === "approval_gate_denied") {
    return ["Keep denied upstream approval cases blocked; do not create draft manifest previews."];
  }
  const actions = [
    "Review manifest preview rows in memory before any future approval gate.",
    "Do not write, import, export, or persist manifests in Phase 2J.16."
  ];
  if (items.some((item) => item.manifest_review_status === "needs_owner_review")) {
    actions.push("Resolve owner confirmation or optional metadata cleanup before a future draft-manifest gate.");
  }
  if (items.some((item) => item.manifest_review_status === "incomplete_manifest")) {
    actions.push("Complete required manifest fields before any future manifest creation phase.");
  }
  if (items.some((item) => item.manifest_review_status === "blocked_manifest")) {
    actions.push("Keep blocked approvals, duplicate IDs, risky flags, and write/export/render/upload/publish requests out of manifests.");
  }
  return actions;
}

function nextSafeActions(status: "approval_gate_reviewable" | "approval_gate_denied"): string[] {
  if (status === "approval_gate_denied") {
    return [
      "Return to Phase 2J.15 approval gate before draft manifest review.",
      "Do not create, export, import, or write any manifest.",
      "Keep real-looking paths as metadata strings only."
    ];
  }
  return [
    "Treat manifest preview items as in-memory review data only.",
    "Do not write production manifests, draft manifest files, or real metadata stores.",
    "Do not open, decode, render, upload, publish, scan real folders, or mutate storage."
  ];
}

function reviewNotes(
  item: SourceFolderMetadataEnrichmentApprovalItem,
  status: z.infer<typeof ManifestReviewStatusSchema>
): string[] {
  return [
    `Source approval status: ${item.approval_status}.`,
    `Draft manifest review status: ${status}.`,
    "Draft manifest review is preview-only; no manifest file is created."
  ];
}

function recommendedAction(status: z.infer<typeof ManifestReviewStatusSchema>): string {
  if (status === "manifest_preview_ok") {
    return "Keep as an in-memory draft manifest preview row only; do not write a file.";
  }
  if (status === "needs_owner_review") return "Request owner confirmation or metadata cleanup before retry.";
  if (status === "incomplete_manifest") return "Complete required manifest fields before retry.";
  return "Keep blocked and remove risky flags, duplicate IDs, or denied action requests before retry.";
}

function recommendedUse(approvalStatus: SourceFolderMetadataEnrichmentApprovalItem["approval_status"]): string {
  return approvalStatus === "approved_for_draft_manifest"
    ? "draft_manifest_review_only"
    : "blocked_or_manual_review";
}

function channelFit(orientation: SourceFolderMetadataEnrichmentApprovalItem["suggested_orientation"]): string[] {
  if (orientation === "vertical") return ["instagram_reels", "tiktok", "youtube_shorts", "whatsapp_status"];
  if (orientation === "horizontal") return ["facebook_feed", "youtube"];
  if (orientation === "square") return ["instagram_feed", "facebook_feed"];
  return ["manual_review_required"];
}

function overridesFor(
  suggestedFootageId: string,
  overrides: SourceFolderDraftManifestReviewOverride[]
): SourceFolderDraftManifestReviewOverride[] {
  return overrides.filter((override) => override.suggested_footage_id === suggestedFootageId);
}

function countManifestStatus(
  items: ManifestPreviewItem[],
  status: z.infer<typeof ManifestReviewStatusSchema>
): number {
  return items.filter((item) => item.manifest_review_status === status).length;
}

function summarizeValues(values: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const value of values) summary[value] = (summary[value] || 0) + 1;
  return summary;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
