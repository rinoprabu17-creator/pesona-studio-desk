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
  reviewSourceFolderMetadataEnrichmentFixture,
  type SourceFolderMetadataEnrichmentCandidate,
  type SourceFolderMetadataEnrichmentReviewFixture,
  type SourceFolderMetadataEnrichmentReviewOutput
} from "./source-folder-metadata-enrichment-review.ts";

const APPROVAL_GATE_ID = "phase-2j15-source-folder-metadata-enrichment-approval-gate";
const DRAFT_MANIFEST_SCOPE = "draft_manifest_preparation_only";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const ApprovalStatusSchema = z.enum([
  "approved_for_draft_manifest",
  "needs_owner_review",
  "blocked_approval",
  "incomplete_approval"
]);

const RiskyActionSchema = z.enum([
  "metadata_write_requested",
  "metadata_import_requested",
  "manifest_write_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

export const SourceFolderMetadataEnrichmentApprovalRecordSchema = z.object({
  suggested_footage_id: z.string().min(1),
  approval_record_found: z.boolean(),
  owner_approved: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  requested_actions: z.array(RiskyActionSchema).default([])
}).strict();

export const SourceFolderMetadataEnrichmentApprovalGateFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-metadata-enrichment-approval-gate-smoke-v1"),
  mode: z.literal("controlled_fixture_metadata_enrichment_approval_gate"),
  source_metadata_enrichment_fixture: z.string().min(1),
  source_listing_review_fixture: z.string().min(1),
  source_listing_gate_fixture: z.string().min(1),
  approval_records: z.array(SourceFolderMetadataEnrichmentApprovalRecordSchema).min(1),
  notes: z.string().min(1)
}).strict();

export const SourceFolderMetadataEnrichmentApprovalItemSchema = z.object({
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  enrichment_status: z.enum([
    "enrichment_ready",
    "needs_manual_metadata",
    "blocked_enrichment",
    "low_confidence"
  ]),
  suggested_product_family: z.string().min(1).nullable(),
  suggested_process_stage: z.string().min(1).nullable(),
  suggested_visual_type: z.string().min(1).nullable(),
  suggested_orientation: z.enum(["vertical", "horizontal", "square", "unknown"]).nullable(),
  suggested_school_level: z.string().min(1).nullable(),
  suggested_color_variant: z.string().min(1).nullable(),
  suggested_content_tags: z.array(z.string().min(1)),
  suggested_risk_flags: z.array(z.string().min(1)),
  owner_approved: z.boolean(),
  approval_record_found: z.boolean(),
  approved_by: z.string().min(1).nullable(),
  approved_at: z.string().min(1).nullable(),
  approval_scope: z.string().min(1).nullable(),
  approval_status: ApprovalStatusSchema,
  missing_approval_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderMetadataEnrichmentApprovalGateOutputSchema = z.object({
  approval_gate_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  enrichment_review_status: z.enum(["reviewable_listing", "listing_review_denied"]),
  reviewed_suggestions: z.number().int().min(0),
  approved_for_draft_manifest: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  blocked_approval: z.number().int().min(0),
  incomplete_approval: z.number().int().min(0),
  approval_items: z.array(SourceFolderMetadataEnrichmentApprovalItemSchema),
  approval_policy_findings: z.array(z.string().min(1)),
  missing_approval_fields: z.record(z.string(), z.number().int().min(0)),
  blocked_reason_summary: z.record(z.string(), z.number().int().min(0)),
  denied_action_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  metadata_write_allowed: z.literal(false),
  manifest_write_allowed: z.literal(false),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderMetadataEnrichmentApprovalRecord = z.infer<
  typeof SourceFolderMetadataEnrichmentApprovalRecordSchema
>;
export type SourceFolderMetadataEnrichmentApprovalGateFixture = z.infer<
  typeof SourceFolderMetadataEnrichmentApprovalGateFixtureSchema
>;
export type SourceFolderMetadataEnrichmentApprovalItem = z.infer<
  typeof SourceFolderMetadataEnrichmentApprovalItemSchema
>;
export type SourceFolderMetadataEnrichmentApprovalGateOutput = z.infer<
  typeof SourceFolderMetadataEnrichmentApprovalGateOutputSchema
>;

export type SourceFolderMetadataEnrichmentApprovalGateBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderMetadataEnrichmentApprovalGateFixture;
  gates: SourceFolderMetadataEnrichmentApprovalGateOutput[];
  reviewedSuggestions: number;
  approvedForDraftManifestCount: number;
  needsOwnerReviewCount: number;
  incompleteApprovalCount: number;
  blockedApprovalCount: number;
  missingApprovalFieldsCount: number;
  blockedReasonsCount: number;
  deniedActionCount: number;
  metadataWriteAllowedCount: number;
  manifestWriteAllowedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderMetadataEnrichmentApprovalGateFixture(
  input: unknown
): SourceFolderMetadataEnrichmentApprovalGateFixture {
  return SourceFolderMetadataEnrichmentApprovalGateFixtureSchema.parse(input);
}

export function reviewSourceFolderMetadataEnrichmentApprovalGateFixture(input: {
  approvalGateFixture: SourceFolderMetadataEnrichmentApprovalGateFixture;
  enrichmentFixture: SourceFolderMetadataEnrichmentReviewFixture;
  listingReviewFixture: SourceFolderListingReviewFixture;
  listingGateFixture: SourceFolderListingApprovalGateFixture;
}): SourceFolderMetadataEnrichmentApprovalGateBatchResult {
  const enrichmentReviewResult = reviewSourceFolderMetadataEnrichmentFixture({
    enrichmentFixture: input.enrichmentFixture,
    listingReviewFixture: input.listingReviewFixture,
    listingGateFixture: input.listingGateFixture
  });
  const gates = enrichmentReviewResult.reviews.map((review) =>
    reviewEnrichmentSuggestionsForApprovalGate(review, input.approvalGateFixture.approval_records)
  );

  return {
    provider: "fake_content_engine",
    fixture: input.approvalGateFixture,
    gates,
    reviewedSuggestions: sum(gates.map((gate) => gate.reviewed_suggestions)),
    approvedForDraftManifestCount: sum(gates.map((gate) => gate.approved_for_draft_manifest)),
    needsOwnerReviewCount: sum(gates.map((gate) => gate.needs_owner_review)),
    incompleteApprovalCount: sum(gates.map((gate) => gate.incomplete_approval)),
    blockedApprovalCount: sum(gates.map((gate) => gate.blocked_approval)),
    missingApprovalFieldsCount: sum(gates.flatMap((gate) => Object.values(gate.missing_approval_fields))),
    blockedReasonsCount: sum(gates.flatMap((gate) => Object.values(gate.blocked_reason_summary))),
    deniedActionCount: sum(gates.flatMap((gate) => Object.values(gate.denied_action_summary))),
    metadataWriteAllowedCount: gates.filter((gate) => gate.metadata_write_allowed).length,
    manifestWriteAllowedCount: gates.filter((gate) => gate.manifest_write_allowed).length,
    recommendedOwnerActionsCount: sum(gates.map((gate) => gate.recommended_owner_actions.length)),
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderMetadataEnrichmentApprovalGateFixture(input: {
  approvalGateFixtureInput: unknown;
  enrichmentFixtureInput: unknown;
  listingReviewFixtureInput: unknown;
  listingGateFixtureInput: unknown;
}): SourceFolderMetadataEnrichmentApprovalGateBatchResult {
  return reviewSourceFolderMetadataEnrichmentApprovalGateFixture({
    approvalGateFixture: parseSourceFolderMetadataEnrichmentApprovalGateFixture(input.approvalGateFixtureInput),
    enrichmentFixture: parseSourceFolderMetadataEnrichmentReviewFixture(input.enrichmentFixtureInput),
    listingReviewFixture: parseSourceFolderListingReviewFixture(input.listingReviewFixtureInput),
    listingGateFixture: parseSourceFolderListingApprovalGateFixture(input.listingGateFixtureInput)
  });
}

export function reviewEnrichmentSuggestionsForApprovalGate(
  enrichmentReview: SourceFolderMetadataEnrichmentReviewOutput,
  approvalRecords: SourceFolderMetadataEnrichmentApprovalRecord[]
): SourceFolderMetadataEnrichmentApprovalGateOutput {
  const approvalItems = enrichmentReview.listing_review_status === "reviewable_listing"
    ? enrichmentReview.enrichment_candidates.map((candidate) =>
      approvalItemForCandidate(candidate, approvalRecords.find((record) =>
        record.suggested_footage_id === candidate.suggested_footage_id
      ))
    )
    : [];

  return SourceFolderMetadataEnrichmentApprovalGateOutputSchema.parse({
    approval_gate_id: `${APPROVAL_GATE_ID}-${enrichmentReview.source_id}`,
    source_id: enrichmentReview.source_id,
    source_label: enrichmentReview.source_label,
    source_root: enrichmentReview.source_root,
    dry_run: enrichmentReview.dry_run,
    read_only: enrichmentReview.read_only,
    enrichment_review_status: enrichmentReview.listing_review_status,
    reviewed_suggestions: approvalItems.length,
    approved_for_draft_manifest: countApprovalStatus(approvalItems, "approved_for_draft_manifest"),
    needs_owner_review: countApprovalStatus(approvalItems, "needs_owner_review"),
    blocked_approval: countApprovalStatus(approvalItems, "blocked_approval"),
    incomplete_approval: countApprovalStatus(approvalItems, "incomplete_approval"),
    approval_items: approvalItems,
    approval_policy_findings: approvalPolicyFindings(enrichmentReview, approvalItems),
    missing_approval_fields: summarizeValues(approvalItems.flatMap((item) => item.missing_approval_fields)),
    blocked_reason_summary: summarizeValues(approvalItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(approvalItems, approvalRecords),
    recommended_owner_actions: recommendedOwnerActions(enrichmentReview, approvalItems),
    next_safe_actions: nextSafeActions(enrichmentReview.listing_review_status),
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function approvalItemForCandidate(
  candidate: SourceFolderMetadataEnrichmentCandidate,
  approvalRecord: SourceFolderMetadataEnrichmentApprovalRecord | undefined
): SourceFolderMetadataEnrichmentApprovalItem {
  const record = approvalRecord ?? {
    suggested_footage_id: candidate.suggested_footage_id,
    approval_record_found: false,
    owner_approved: false,
    approved_by: null,
    approved_at: null,
    approval_scope: null,
    requested_actions: []
  };
  const missingFields = missingApprovalFields(record);
  const blockingReasons = blockingReasonsFor(candidate, record);
  const approvalStatus = approvalStatusFor(candidate, record, missingFields, blockingReasons);

  return SourceFolderMetadataEnrichmentApprovalItemSchema.parse({
    suggested_footage_id: candidate.suggested_footage_id,
    filename: candidate.filename,
    relative_path: candidate.relative_path,
    enrichment_status: candidate.enrichment_status,
    suggested_product_family: candidate.suggested_product_family,
    suggested_process_stage: candidate.suggested_process_stage,
    suggested_visual_type: candidate.suggested_visual_type,
    suggested_orientation: candidate.suggested_orientation,
    suggested_school_level: candidate.suggested_school_level,
    suggested_color_variant: candidate.suggested_color_variant,
    suggested_content_tags: candidate.suggested_content_tags,
    suggested_risk_flags: candidate.suggested_risk_flags,
    owner_approved: record.owner_approved,
    approval_record_found: record.approval_record_found,
    approved_by: record.approved_by,
    approved_at: record.approved_at,
    approval_scope: record.approval_scope,
    approval_status: approvalStatus,
    missing_approval_fields: missingFields,
    blocking_reasons: blockingReasons,
    review_notes: reviewNotes(candidate, approvalStatus),
    recommended_action: recommendedAction(approvalStatus)
  });
}

function approvalStatusFor(
  candidate: SourceFolderMetadataEnrichmentCandidate,
  record: SourceFolderMetadataEnrichmentApprovalRecord,
  missingFields: string[],
  blockingReasons: string[]
): z.infer<typeof ApprovalStatusSchema> {
  if (blockingReasons.length > 0) return "blocked_approval";
  if (record.approval_record_found && record.owner_approved && missingFields.length > 0) return "incomplete_approval";
  if (!record.approval_record_found || !record.owner_approved) return "needs_owner_review";
  if (candidate.enrichment_status === "enrichment_ready" && missingFields.length === 0) {
    return "approved_for_draft_manifest";
  }
  return "needs_owner_review";
}

function missingApprovalFields(record: SourceFolderMetadataEnrichmentApprovalRecord): string[] {
  const missing: string[] = [];
  if (!record.approval_record_found) missing.push("approval_record_found");
  if (!record.owner_approved) missing.push("owner_approved");
  if (!record.approved_by) missing.push("approved_by");
  if (!record.approved_at) missing.push("approved_at");
  if (!record.approval_scope) missing.push("approval_scope");
  if (record.approval_scope && record.approval_scope !== DRAFT_MANIFEST_SCOPE) {
    missing.push("approval_scope_draft_manifest_preparation_only");
  }
  return missing;
}

function blockingReasonsFor(
  candidate: SourceFolderMetadataEnrichmentCandidate,
  record: SourceFolderMetadataEnrichmentApprovalRecord
): string[] {
  const reasons: string[] = [];
  if (candidate.enrichment_status === "blocked_enrichment") {
    reasons.push("blocked_enrichment_cannot_be_upgraded");
  }
  if (candidate.enrichment_status === "needs_manual_metadata") {
    reasons.push("manual_metadata_required_before_approval");
  }
  if (candidate.enrichment_status === "low_confidence") {
    reasons.push("low_confidence_cannot_be_approved");
  }
  for (const riskFlag of candidate.suggested_risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const field of [
    ["suggested_product_family", candidate.suggested_product_family],
    ["suggested_process_stage", candidate.suggested_process_stage],
    ["suggested_visual_type", candidate.suggested_visual_type],
    ["suggested_orientation", candidate.suggested_orientation]
  ] as const) {
    if (!field[1]) reasons.push(`missing_${field[0]}`);
  }
  for (const action of record.requested_actions) reasons.push(`denied_action_${action}`);
  return reasons;
}

function approvalPolicyFindings(
  enrichmentReview: SourceFolderMetadataEnrichmentReviewOutput,
  items: SourceFolderMetadataEnrichmentApprovalItem[]
): string[] {
  const findings = [
    "Metadata approval gate is fixture-only and does not write or import metadata.",
    "metadata_write_allowed and manifest_write_allowed remain false.",
    "public_ready remains false and publish_track remains blocked."
  ];
  if (enrichmentReview.source_root !== SAFE_FIXTURE_ROOT) {
    findings.push("Source root is not the Phase 2J.8 safe fixture root; approval remains conservative.");
  }
  if (enrichmentReview.listing_review_status === "listing_review_denied") {
    findings.push("Denied enrichment review case produced zero approval items.");
  }
  if (items.some((item) => item.approval_status === "approved_for_draft_manifest")) {
    findings.push("Approved items are approved only for future draft-manifest preparation, not manifest creation.");
  }
  return findings;
}

function summarizeDeniedActions(
  items: SourceFolderMetadataEnrichmentApprovalItem[],
  approvalRecords: SourceFolderMetadataEnrichmentApprovalRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.suggested_footage_id));
  return summarizeValues(
    approvalRecords
      .filter((record) => itemIds.has(record.suggested_footage_id))
      .flatMap((record) => record.requested_actions)
  );
}

function recommendedOwnerActions(
  enrichmentReview: SourceFolderMetadataEnrichmentReviewOutput,
  items: SourceFolderMetadataEnrichmentApprovalItem[]
): string[] {
  if (enrichmentReview.listing_review_status === "listing_review_denied") {
    return ["Keep denied enrichment review cases blocked; do not review or write metadata."];
  }
  const actions = [
    "Review approved-for-draft-manifest suggestions before any future manifest phase.",
    "Do not write metadata rows, import metadata, or create draft manifests in Phase 2J.15."
  ];
  if (items.some((item) => item.approval_status === "needs_owner_review")) {
    actions.push("Add explicit owner approval for enrichment-ready suggestions that should proceed later.");
  }
  if (items.some((item) => item.approval_status === "incomplete_approval")) {
    actions.push("Complete approved_by, approved_at, and draft-manifest-only approval scope.");
  }
  if (items.some((item) => item.approval_status === "blocked_approval")) {
    actions.push("Keep blocked enrichment, risky flags, and write/import/render/upload/publish requests out of future manifests.");
  }
  return actions;
}

function nextSafeActions(status: "reviewable_listing" | "listing_review_denied"): string[] {
  if (status === "listing_review_denied") {
    return [
      "Do not approve suggestions from denied enrichment review cases.",
      "Return to Phase 2J.12 through 2J.14 before retry.",
      "Keep real-looking paths as metadata strings only."
    ];
  }
  return [
    "Treat approved items as permission for a future draft-manifest review phase only.",
    "Do not write production manifests or mutate real metadata stores.",
    "Do not open, decode, render, upload, publish, scan real folders, or mutate storage."
  ];
}

function reviewNotes(
  candidate: SourceFolderMetadataEnrichmentCandidate,
  status: z.infer<typeof ApprovalStatusSchema>
): string[] {
  return [
    `Enrichment status: ${candidate.enrichment_status}.`,
    `Approval status: ${status}.`,
    "Approval gate is dry-run only; no metadata or manifest write is allowed."
  ];
}

function recommendedAction(status: z.infer<typeof ApprovalStatusSchema>): string {
  if (status === "approved_for_draft_manifest") {
    return "Allow this suggestion to proceed to a future draft-manifest review only; do not write a manifest now.";
  }
  if (status === "incomplete_approval") return "Complete owner approval metadata before retry.";
  if (status === "blocked_approval") return "Keep blocked and remove risk flags or denied action requests before retry.";
  return "Request explicit owner approval before this suggestion can proceed.";
}

function countApprovalStatus(
  items: SourceFolderMetadataEnrichmentApprovalItem[],
  status: z.infer<typeof ApprovalStatusSchema>
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
