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
  reviewSourceFolderDraftManifestCreationDryRunGateFixture,
  type DraftManifestCreationGateItem,
  type SourceFolderDraftManifestCreationDryRunGateFixture,
  type SourceFolderDraftManifestCreationDryRunGateOutput
} from "./source-folder-draft-manifest-creation-dry-run-gate.ts";

const CREATION_REVIEW_ID = "phase-2j19-source-folder-draft-manifest-creation-dry-run-review";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const DryRunReviewStatusSchema = z.enum([
  "dry_run_preview_ok",
  "needs_owner_review",
  "incomplete_dry_run",
  "blocked_dry_run"
]);

export const SourceFolderDraftManifestCreationDryRunReviewFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-draft-manifest-creation-dry-run-review-smoke-v1"),
  mode: z.literal("controlled_fixture_draft_manifest_creation_dry_run_review"),
  source_creation_gate_fixture: z.string().min(1),
  source_draft_manifest_approval_gate_fixture: z.string().min(1),
  source_draft_manifest_review_fixture: z.string().min(1),
  source_metadata_enrichment_approval_gate_fixture: z.string().min(1),
  source_metadata_enrichment_fixture: z.string().min(1),
  source_listing_review_fixture: z.string().min(1),
  source_listing_gate_fixture: z.string().min(1),
  notes: z.string().min(1)
}).strict();

export const DraftManifestCreationDryRunPreviewItemSchema = z.object({
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_creation_gate_status: z.enum([
    "eligible_for_creation_dry_run",
    "needs_owner_review",
    "incomplete_creation_gate",
    "blocked_creation_gate"
  ]),
  product_family: z.string().min(1).nullable(),
  visual_type: z.string().min(1).nullable(),
  process_stage: z.string().min(1).nullable(),
  orientation: z.enum(["vertical", "horizontal", "square", "unknown"]).nullable(),
  school_level: z.string().min(1).nullable(),
  color_variant: z.string().min(1).nullable(),
  content_tags: z.array(z.string().min(1)),
  risk_flags: z.array(z.string().min(1)),
  dry_run_review_status: DryRunReviewStatusSchema,
  missing_required_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderDraftManifestCreationDryRunReviewOutputSchema = z.object({
  creation_review_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  creation_gate_status: z.enum(["creation_gate_reviewable", "creation_gate_denied"]),
  reviewed_gate_items: z.number().int().min(0),
  dry_run_manifest_preview_items: z.number().int().min(0),
  dry_run_preview_ok: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_dry_run: z.number().int().min(0),
  blocked_dry_run: z.number().int().min(0),
  duplicate_id_count: z.number().int().min(0),
  missing_required_field_count: z.number().int().min(0),
  preview_items: z.array(DraftManifestCreationDryRunPreviewItemSchema),
  blocked_reason_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  metadata_write_allowed: z.literal(false),
  manifest_write_allowed: z.literal(false),
  manifest_file_created: z.literal(false),
  manifest_export_allowed: z.literal(false),
  creation_dry_run_performed: z.boolean(),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderDraftManifestCreationDryRunReviewFixture = z.infer<
  typeof SourceFolderDraftManifestCreationDryRunReviewFixtureSchema
>;
export type DraftManifestCreationDryRunPreviewItem = z.infer<
  typeof DraftManifestCreationDryRunPreviewItemSchema
>;
export type SourceFolderDraftManifestCreationDryRunReviewOutput = z.infer<
  typeof SourceFolderDraftManifestCreationDryRunReviewOutputSchema
>;

export type SourceFolderDraftManifestCreationDryRunReviewBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderDraftManifestCreationDryRunReviewFixture;
  reviews: SourceFolderDraftManifestCreationDryRunReviewOutput[];
  reviewedGateItems: number;
  dryRunManifestPreviewItems: number;
  dryRunPreviewOkCount: number;
  needsOwnerReviewCount: number;
  incompleteDryRunCount: number;
  blockedDryRunCount: number;
  duplicateIdCount: number;
  missingRequiredFieldCount: number;
  blockedReasonsCount: number;
  metadataWriteAllowedCount: number;
  manifestWriteAllowedCount: number;
  manifestFileCreatedCount: number;
  manifestExportAllowedCount: number;
  creationDryRunPerformedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderDraftManifestCreationDryRunReviewFixture(
  input: unknown
): SourceFolderDraftManifestCreationDryRunReviewFixture {
  return SourceFolderDraftManifestCreationDryRunReviewFixtureSchema.parse(input);
}

export function reviewSourceFolderDraftManifestCreationDryRunFixture(input: {
  creationReviewFixture: SourceFolderDraftManifestCreationDryRunReviewFixture;
  creationGateFixture: SourceFolderDraftManifestCreationDryRunGateFixture;
  draftManifestApprovalGateFixture: SourceFolderDraftManifestApprovalGateFixture;
  draftManifestReviewFixture: SourceFolderDraftManifestReviewFixture;
  metadataEnrichmentApprovalGateFixture: SourceFolderMetadataEnrichmentApprovalGateFixture;
  enrichmentFixture: SourceFolderMetadataEnrichmentReviewFixture;
  listingReviewFixture: SourceFolderListingReviewFixture;
  listingGateFixture: SourceFolderListingApprovalGateFixture;
}): SourceFolderDraftManifestCreationDryRunReviewBatchResult {
  const creationGateResult = reviewSourceFolderDraftManifestCreationDryRunGateFixture({
    creationGateFixture: input.creationGateFixture,
    draftManifestApprovalGateFixture: input.draftManifestApprovalGateFixture,
    draftManifestReviewFixture: input.draftManifestReviewFixture,
    metadataEnrichmentApprovalGateFixture: input.metadataEnrichmentApprovalGateFixture,
    enrichmentFixture: input.enrichmentFixture,
    listingReviewFixture: input.listingReviewFixture,
    listingGateFixture: input.listingGateFixture
  });
  const reviews = creationGateResult.gates.map(reviewCreationGateForDryRun);

  return {
    provider: "fake_content_engine",
    fixture: input.creationReviewFixture,
    reviews,
    reviewedGateItems: sum(reviews.map((review) => review.reviewed_gate_items)),
    dryRunManifestPreviewItems: sum(reviews.map((review) => review.dry_run_manifest_preview_items)),
    dryRunPreviewOkCount: sum(reviews.map((review) => review.dry_run_preview_ok)),
    needsOwnerReviewCount: sum(reviews.map((review) => review.needs_owner_review)),
    incompleteDryRunCount: sum(reviews.map((review) => review.incomplete_dry_run)),
    blockedDryRunCount: sum(reviews.map((review) => review.blocked_dry_run)),
    duplicateIdCount: sum(reviews.map((review) => review.duplicate_id_count)),
    missingRequiredFieldCount: sum(reviews.map((review) => review.missing_required_field_count)),
    blockedReasonsCount: sum(reviews.flatMap((review) => Object.values(review.blocked_reason_summary))),
    metadataWriteAllowedCount: reviews.filter((review) => review.metadata_write_allowed).length,
    manifestWriteAllowedCount: reviews.filter((review) => review.manifest_write_allowed).length,
    manifestFileCreatedCount: reviews.filter((review) => review.manifest_file_created).length,
    manifestExportAllowedCount: reviews.filter((review) => review.manifest_export_allowed).length,
    creationDryRunPerformedCount: reviews.filter((review) => review.creation_dry_run_performed).length,
    recommendedOwnerActionsCount: sum(reviews.map((review) => review.recommended_owner_actions.length)),
    publicReadyCount: reviews.filter((review) => review.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderDraftManifestCreationDryRunReviewFixture(input: {
  creationReviewFixtureInput: unknown;
  creationGateFixtureInput: unknown;
  draftManifestApprovalGateFixtureInput: unknown;
  draftManifestReviewFixtureInput: unknown;
  metadataEnrichmentApprovalGateFixtureInput: unknown;
  enrichmentFixtureInput: unknown;
  listingReviewFixtureInput: unknown;
  listingGateFixtureInput: unknown;
}): SourceFolderDraftManifestCreationDryRunReviewBatchResult {
  return reviewSourceFolderDraftManifestCreationDryRunFixture({
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

export function reviewCreationGateForDryRun(
  creationGate: SourceFolderDraftManifestCreationDryRunGateOutput
): SourceFolderDraftManifestCreationDryRunReviewOutput {
  const reviewable = creationGate.source_approval_status === "draft_manifest_approval_reviewable";
  const previewItems = reviewable
    ? creationGate.gate_items.map((item) => previewItemForGateItem(item, creationGate.duplicate_id_findings))
    : [];
  const okCount = countReviewStatus(previewItems, "dry_run_preview_ok");

  return SourceFolderDraftManifestCreationDryRunReviewOutputSchema.parse({
    creation_review_id: `${CREATION_REVIEW_ID}-${creationGate.source_id}`,
    source_id: creationGate.source_id,
    source_label: creationGate.source_label,
    source_root: creationGate.source_root,
    dry_run: creationGate.dry_run,
    read_only: creationGate.read_only,
    creation_gate_status: reviewable ? "creation_gate_reviewable" : "creation_gate_denied",
    reviewed_gate_items: reviewable ? creationGate.gate_items.length : 0,
    dry_run_manifest_preview_items: previewItems.length,
    dry_run_preview_ok: okCount,
    needs_owner_review: countReviewStatus(previewItems, "needs_owner_review"),
    incomplete_dry_run: countReviewStatus(previewItems, "incomplete_dry_run"),
    blocked_dry_run: countReviewStatus(previewItems, "blocked_dry_run"),
    duplicate_id_count: creationGate.duplicate_id_findings.length,
    missing_required_field_count: sum(previewItems.map((item) => item.missing_required_fields.length)),
    preview_items: previewItems,
    blocked_reason_summary: summarizeValues(previewItems.flatMap((item) => item.blocking_reasons)),
    recommended_owner_actions: recommendedOwnerActions(reviewable, previewItems, creationGate.duplicate_id_findings),
    next_safe_actions: nextSafeActions(reviewable, okCount),
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    manifest_file_created: false,
    manifest_export_allowed: false,
    creation_dry_run_performed: okCount > 0,
    public_ready: false,
    publish_track: "blocked"
  });
}

function previewItemForGateItem(
  item: DraftManifestCreationGateItem,
  duplicateFindings: string[]
): DraftManifestCreationDryRunPreviewItem {
  const duplicateIds = duplicateSuggestedFootageIdsFromFindings(duplicateFindings);
  const missingRequired = missingRequiredFieldsFor(item);
  const blockingReasons = blockingReasonsFor(item, duplicateIds);
  const status = dryRunReviewStatusFor(item, missingRequired, blockingReasons);

  return DraftManifestCreationDryRunPreviewItemSchema.parse({
    manifest_item_id: item.manifest_item_id,
    suggested_footage_id: item.suggested_footage_id,
    filename: item.filename,
    relative_path: item.relative_path,
    source_creation_gate_status: item.creation_gate_status,
    product_family: item.product_family,
    visual_type: item.visual_type,
    process_stage: item.process_stage,
    orientation: item.orientation,
    school_level: item.school_level,
    color_variant: item.color_variant,
    content_tags: item.content_tags,
    risk_flags: item.risk_flags,
    dry_run_review_status: status,
    missing_required_fields: missingRequired,
    blocking_reasons: blockingReasons,
    review_notes: [
      `Source creation gate status: ${item.creation_gate_status}.`,
      `Dry-run review status: ${status}.`,
      "Dry-run preview is in-memory only; no manifest file is created."
    ],
    recommended_action: recommendedAction(status)
  });
}

function missingRequiredFieldsFor(item: DraftManifestCreationGateItem): string[] {
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

function blockingReasonsFor(item: DraftManifestCreationGateItem, duplicateIds: Set<string>): string[] {
  const reasons: string[] = [];
  if (item.creation_gate_status === "blocked_creation_gate") reasons.push("blocked_creation_gate_cannot_be_upgraded");
  if (duplicateIds.has(item.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of item.blocking_reasons) reasons.push(`creation_gate_${reason}`);
  for (const riskFlag of item.risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  return reasons;
}

function dryRunReviewStatusFor(
  item: DraftManifestCreationGateItem,
  missingRequiredFields: string[],
  blockingReasons: string[]
): z.infer<typeof DryRunReviewStatusSchema> {
  if (blockingReasons.length > 0) return "blocked_dry_run";
  if (missingRequiredFields.length > 0) return "incomplete_dry_run";
  if (item.creation_gate_status === "incomplete_creation_gate") return "incomplete_dry_run";
  if (item.creation_gate_status === "needs_owner_review") return "needs_owner_review";
  if (item.creation_gate_status === "eligible_for_creation_dry_run") return "dry_run_preview_ok";
  return "blocked_dry_run";
}

function duplicateSuggestedFootageIdsFromFindings(findings: string[]): Set<string> {
  const ids = new Set<string>();
  for (const finding of findings) {
    const [, id] = finding.split(":");
    if (id) ids.add(id);
  }
  return ids;
}

function recommendedOwnerActions(
  reviewable: boolean,
  items: DraftManifestCreationDryRunPreviewItem[],
  duplicateFindings: string[]
): string[] {
  if (!reviewable) return ["Keep denied creation dry-run gate cases blocked; do not simulate manifest creation."];
  const actions = [
    "Review dry-run preview rows in memory only before any future fixture manifest-write gate.",
    "Do not create, write, export, import, save, or persist any manifest in Phase 2J.19."
  ];
  if (items.some((item) => item.dry_run_review_status === "needs_owner_review")) {
    actions.push("Resolve owner-review rows before any future fixture manifest-write gate.");
  }
  if (items.some((item) => item.dry_run_review_status === "incomplete_dry_run")) {
    actions.push("Complete required metadata before any future fixture manifest-write gate.");
  }
  if (items.some((item) => item.dry_run_review_status === "blocked_dry_run") || duplicateFindings.length > 0) {
    actions.push("Keep duplicate IDs, blocked upstream rows, risky flags, and denied actions blocked.");
  }
  return actions;
}

function nextSafeActions(reviewable: boolean, okCount: number): string[] {
  if (!reviewable) {
    return [
      "Return to Phase 2J.18 creation dry-run gate before review.",
      "Do not create, export, import, write, save, or persist any manifest."
    ];
  }
  if (okCount > 0) {
    return [
      "Treat creation_dry_run_performed as in-memory review simulation only.",
      "Do not write production manifests, fixture manifest files, draft manifest files, or real metadata stores.",
      "Do not open, decode, render, upload, publish, scan real folders, or mutate storage."
    ];
  }
  return [
    "Keep all rows in review until owner approval and required metadata are complete.",
    "Do not create, export, import, write, save, or persist any manifest."
  ];
}

function recommendedAction(status: z.infer<typeof DryRunReviewStatusSchema>): string {
  if (status === "dry_run_preview_ok") {
    return "Allow this in-memory dry-run preview row to enter a future approval gate only; do not create a manifest.";
  }
  if (status === "incomplete_dry_run") return "Complete required metadata before future approval.";
  if (status === "blocked_dry_run") return "Keep blocked and remove duplicate IDs, risky flags, or blocked upstream rows.";
  return "Request owner review before this row can proceed.";
}

function countReviewStatus(
  items: DraftManifestCreationDryRunPreviewItem[],
  status: z.infer<typeof DryRunReviewStatusSchema>
): number {
  return items.filter((item) => item.dry_run_review_status === status).length;
}

function summarizeValues(values: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const value of values) summary[value] = (summary[value] || 0) + 1;
  return summary;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
