import { z } from "zod";
import {
  parseSourceFolderListingReviewFixture,
  reviewSourceFolderListingGateFixture,
  type SourceFolderListingEntryReview,
  type SourceFolderListingReviewFixture,
  type SourceFolderListingReviewOutput
} from "./source-folder-listing-review.ts";
import {
  parseSourceFolderListingApprovalGateFixture,
  type SourceFolderListingApprovalGateFixture
} from "./source-folder-listing-approval-gate.ts";

const ENRICHMENT_REVIEW_ID = "phase-2j14-source-folder-metadata-enrichment-review";

const EnrichmentStatusSchema = z.enum([
  "enrichment_ready",
  "needs_manual_metadata",
  "blocked_enrichment",
  "low_confidence"
]);

const ListingReviewStatusSchema = z.enum([
  "listing_review_ok",
  "needs_manual_metadata",
  "blocked_entry",
  "low_confidence"
]);

export const SourceFolderMetadataEnrichmentReviewFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-metadata-enrichment-review-smoke-v1"),
  mode: z.literal("controlled_fixture_metadata_enrichment_review"),
  source_listing_review_fixture: z.string().min(1),
  source_listing_gate_fixture: z.string().min(1),
  notes: z.string().min(1)
}).strict();

export const SourceFolderMetadataEnrichmentCandidateSchema = z.object({
  entry_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  extension: z.string().min(1),
  listing_review_status: ListingReviewStatusSchema,
  enrichment_status: EnrichmentStatusSchema,
  suggested_footage_id: z.string().min(1),
  suggested_product_family: z.string().min(1).nullable(),
  suggested_process_stage: z.string().min(1).nullable(),
  suggested_visual_type: z.string().min(1).nullable(),
  suggested_orientation: z.enum(["vertical", "horizontal", "square", "unknown"]).nullable(),
  suggested_school_level: z.string().min(1).nullable(),
  suggested_color_variant: z.string().min(1).nullable(),
  suggested_content_tags: z.array(z.string().min(1)),
  suggested_risk_flags: z.array(z.string().min(1)),
  suggested_recommended_use: z.string().min(1).nullable(),
  confidence_notes: z.array(z.string().min(1)),
  missing_fields: z.array(z.string().min(1)),
  manual_review_required: z.boolean(),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SuggestedMetadataRowSchema = z.object({
  footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  product_family: z.string().min(1),
  visual_type: z.string().min(1),
  process_stage: z.string().min(1),
  orientation: z.enum(["vertical", "horizontal", "square", "unknown"]),
  school_level: z.string().min(1),
  color_variant: z.string().min(1),
  content_tags: z.array(z.string().min(1)),
  risk_flags: z.array(z.string().min(1)),
  recommended_use: z.string().min(1),
  channel_fit: z.array(z.string().min(1)),
  usable_guess: z.boolean(),
  duration_sec: z.null(),
  notes: z.string().min(1)
}).strict();

export const SourceFolderMetadataEnrichmentReviewOutputSchema = z.object({
  enrichment_review_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  listing_review_status: z.enum(["reviewable_listing", "listing_review_denied"]),
  reviewed_entries: z.number().int().min(0),
  enrichment_candidates: z.array(SourceFolderMetadataEnrichmentCandidateSchema),
  enrichment_ready_count: z.number().int().min(0),
  needs_manual_metadata_count: z.number().int().min(0),
  blocked_enrichment_count: z.number().int().min(0),
  low_confidence_count: z.number().int().min(0),
  enrichment_field_coverage: z.record(z.string(), z.number().int().min(0)),
  missing_required_metadata: z.record(z.string(), z.number().int().min(0)),
  suggested_metadata_rows: z.array(SuggestedMetadataRowSchema),
  recommended_manual_fields: z.array(z.string().min(1)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderMetadataEnrichmentReviewFixture = z.infer<
  typeof SourceFolderMetadataEnrichmentReviewFixtureSchema
>;
export type SourceFolderMetadataEnrichmentCandidate = z.infer<typeof SourceFolderMetadataEnrichmentCandidateSchema>;
export type SourceFolderMetadataEnrichmentReviewOutput = z.infer<
  typeof SourceFolderMetadataEnrichmentReviewOutputSchema
>;

export type SourceFolderMetadataEnrichmentReviewBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderMetadataEnrichmentReviewFixture;
  reviews: SourceFolderMetadataEnrichmentReviewOutput[];
  reviewedEntries: number;
  enrichmentCandidates: number;
  enrichmentReadyCount: number;
  needsManualMetadataCount: number;
  blockedEnrichmentCount: number;
  lowConfidenceCount: number;
  missingRequiredMetadataCount: number;
  suggestedMetadataRowsCount: number;
  recommendedManualFieldsCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderMetadataEnrichmentReviewFixture(
  input: unknown
): SourceFolderMetadataEnrichmentReviewFixture {
  return SourceFolderMetadataEnrichmentReviewFixtureSchema.parse(input);
}

export function reviewSourceFolderMetadataEnrichmentFixture(input: {
  enrichmentFixture: SourceFolderMetadataEnrichmentReviewFixture;
  listingReviewFixture: SourceFolderListingReviewFixture;
  listingGateFixture: SourceFolderListingApprovalGateFixture;
}): SourceFolderMetadataEnrichmentReviewBatchResult {
  const listingReviewResult = reviewSourceFolderListingGateFixture({
    reviewFixture: input.listingReviewFixture,
    listingGateFixture: input.listingGateFixture
  });
  const reviews = listingReviewResult.reviews.map(reviewListingForMetadataEnrichment);
  return {
    provider: "fake_content_engine",
    fixture: input.enrichmentFixture,
    reviews,
    reviewedEntries: sum(reviews.map((review) => review.reviewed_entries)),
    enrichmentCandidates: sum(reviews.map((review) => review.enrichment_candidates.length)),
    enrichmentReadyCount: sum(reviews.map((review) => review.enrichment_ready_count)),
    needsManualMetadataCount: sum(reviews.map((review) => review.needs_manual_metadata_count)),
    blockedEnrichmentCount: sum(reviews.map((review) => review.blocked_enrichment_count)),
    lowConfidenceCount: sum(reviews.map((review) => review.low_confidence_count)),
    missingRequiredMetadataCount: sum(
      reviews.flatMap((review) => Object.values(review.missing_required_metadata))
    ),
    suggestedMetadataRowsCount: sum(reviews.map((review) => review.suggested_metadata_rows.length)),
    recommendedManualFieldsCount: sum(reviews.map((review) => review.recommended_manual_fields.length)),
    recommendedOwnerActionsCount: sum(reviews.map((review) => review.recommended_owner_actions.length)),
    publicReadyCount: reviews.filter((review) => review.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderMetadataEnrichmentFixture(input: {
  enrichmentFixtureInput: unknown;
  listingReviewFixtureInput: unknown;
  listingGateFixtureInput: unknown;
}): SourceFolderMetadataEnrichmentReviewBatchResult {
  return reviewSourceFolderMetadataEnrichmentFixture({
    enrichmentFixture: parseSourceFolderMetadataEnrichmentReviewFixture(input.enrichmentFixtureInput),
    listingReviewFixture: parseSourceFolderListingReviewFixture(input.listingReviewFixtureInput),
    listingGateFixture: parseSourceFolderListingApprovalGateFixture(input.listingGateFixtureInput)
  });
}

export function reviewListingForMetadataEnrichment(
  listingReview: SourceFolderListingReviewOutput
): SourceFolderMetadataEnrichmentReviewOutput {
  const listingReviewStatus = listingReview.listing_gate_status === "listing_allowed" && listingReview.reviewed_entries > 0
    ? "reviewable_listing"
    : "listing_review_denied";
  const candidates = listingReviewStatus === "reviewable_listing"
    ? listingReview.entry_reviews.map(enrichEntryReview)
    : [];
  const suggestedRows = candidates
    .filter((candidate) => candidate.enrichment_status === "enrichment_ready")
    .map(candidateToSuggestedMetadataRow);

  return SourceFolderMetadataEnrichmentReviewOutputSchema.parse({
    enrichment_review_id: `${ENRICHMENT_REVIEW_ID}-${listingReview.source_id}`,
    source_id: listingReview.source_id,
    source_label: listingReview.source_label,
    source_root: listingReview.source_root,
    dry_run: listingReview.dry_run,
    read_only: listingReview.read_only,
    listing_review_status: listingReviewStatus,
    reviewed_entries: listingReview.reviewed_entries,
    enrichment_candidates: candidates,
    enrichment_ready_count: countStatus(candidates, "enrichment_ready"),
    needs_manual_metadata_count: countStatus(candidates, "needs_manual_metadata"),
    blocked_enrichment_count: countStatus(candidates, "blocked_enrichment"),
    low_confidence_count: countStatus(candidates, "low_confidence"),
    enrichment_field_coverage: enrichmentFieldCoverage(candidates),
    missing_required_metadata: summarizeMissingFields(candidates),
    suggested_metadata_rows: suggestedRows,
    recommended_manual_fields: recommendedManualFields(candidates),
    recommended_owner_actions: recommendedOwnerActions(listingReviewStatus, candidates),
    next_safe_actions: nextSafeActions(listingReviewStatus),
    public_ready: false,
    publish_track: "blocked"
  });
}

function enrichEntryReview(entry: SourceFolderListingEntryReview): SourceFolderMetadataEnrichmentCandidate {
  const token = entry.entry_id;
  const suggestedProductFamily = entry.product_family_guess === "unknown" ? null : entry.product_family_guess;
  const suggestedProcessStage = entry.process_stage_guess === "unknown" ? null : entry.process_stage_guess;
  const suggestedVisualType = visualTypeFromStage(entry.process_stage_guess);
  const suggestedOrientation = entry.orientation_hint === "unknown" ? null : entry.orientation_hint;
  const suggestedSchoolLevel = schoolLevelFromToken(token);
  const suggestedColorVariant = colorVariantFromToken(token);
  const suggestedTags = contentTags(entry, suggestedSchoolLevel, suggestedColorVariant);
  const suggestedRiskFlags = entry.risk_flags_guess;
  const missingFields = missingRequiredFields({
    entry,
    suggestedProductFamily,
    suggestedProcessStage,
    suggestedVisualType,
    suggestedOrientation,
    suggestedSchoolLevel,
    suggestedColorVariant
  });
  const enrichmentStatus = enrichmentStatusFor(entry, missingFields);
  const manualReviewRequired = enrichmentStatus !== "enrichment_ready";

  return SourceFolderMetadataEnrichmentCandidateSchema.parse({
    entry_id: entry.entry_id,
    filename: entry.filename,
    relative_path: entry.relative_path,
    extension: entry.extension,
    listing_review_status: entry.listing_review_status,
    enrichment_status: enrichmentStatus,
    suggested_footage_id: entry.entry_id,
    suggested_product_family: suggestedProductFamily,
    suggested_process_stage: suggestedProcessStage,
    suggested_visual_type: suggestedVisualType,
    suggested_orientation: suggestedOrientation,
    suggested_school_level: suggestedSchoolLevel,
    suggested_color_variant: suggestedColorVariant,
    suggested_content_tags: suggestedTags,
    suggested_risk_flags: suggestedRiskFlags,
    suggested_recommended_use: recommendedUse(entry, enrichmentStatus),
    confidence_notes: confidenceNotes(entry, enrichmentStatus),
    missing_fields: missingFields,
    manual_review_required: manualReviewRequired,
    review_notes: reviewNotes(entry, enrichmentStatus),
    recommended_action: recommendedAction(enrichmentStatus)
  });
}

function enrichmentStatusFor(
  entry: SourceFolderListingEntryReview,
  missingFields: string[]
): z.infer<typeof EnrichmentStatusSchema> {
  if (
    entry.listing_review_status === "blocked_entry" ||
    entry.risk_flags_guess.some((flag) =>
      ["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(flag)
    )
  ) {
    return "blocked_enrichment";
  }
  if (entry.listing_review_status === "low_confidence") return "low_confidence";
  if (entry.listing_review_status === "needs_manual_metadata") return "needs_manual_metadata";
  if (entry.listing_review_status === "listing_review_ok" && missingFields.length === 0) return "enrichment_ready";
  if (entry.product_family_guess === "unknown" || entry.process_stage_guess === "unknown" || entry.orientation_hint === "unknown") {
    return "low_confidence";
  }
  return "needs_manual_metadata";
}

function missingRequiredFields(input: {
  entry: SourceFolderListingEntryReview;
  suggestedProductFamily: string | null;
  suggestedProcessStage: string | null;
  suggestedVisualType: string | null;
  suggestedOrientation: "vertical" | "horizontal" | "square" | "unknown" | null;
  suggestedSchoolLevel: string | null;
  suggestedColorVariant: string | null;
}): string[] {
  const missing: string[] = [];
  if (!input.suggestedProductFamily) missing.push("product_family");
  if (!input.suggestedProcessStage) missing.push("process_stage");
  if (!input.suggestedVisualType) missing.push("visual_type");
  if (!input.suggestedOrientation) missing.push("orientation");
  if (!input.suggestedSchoolLevel) missing.push("school_level");
  if (!input.suggestedColorVariant) missing.push("color_variant");
  if (input.entry.risk_flags_guess.includes("blurry")) missing.push("visual_quality_manual_review");
  return missing;
}

function candidateToSuggestedMetadataRow(candidate: SourceFolderMetadataEnrichmentCandidate): z.infer<typeof SuggestedMetadataRowSchema> {
  return SuggestedMetadataRowSchema.parse({
    footage_id: candidate.suggested_footage_id,
    filename: candidate.filename,
    relative_path: candidate.relative_path,
    product_family: requireValue(candidate.suggested_product_family),
    visual_type: requireValue(candidate.suggested_visual_type),
    process_stage: requireValue(candidate.suggested_process_stage),
    orientation: requireValue(candidate.suggested_orientation),
    school_level: requireValue(candidate.suggested_school_level),
    color_variant: requireValue(candidate.suggested_color_variant),
    content_tags: candidate.suggested_content_tags,
    risk_flags: candidate.suggested_risk_flags,
    recommended_use: requireValue(candidate.suggested_recommended_use),
    channel_fit: channelFit(candidate),
    usable_guess: true,
    duration_sec: null,
    notes: "Suggested metadata row only. Duration, codec, visual quality, actual content, render readiness, and public readiness are not inferred."
  });
}

function visualTypeFromStage(stage: string): string | null {
  if (stage === "product_closeup") return "close_up_cover";
  if (stage === "foil_emboss_poly") return "detail_finishing_foil";
  if (stage === "packing_qc") return "packing_qc_proof";
  if (stage === "delivery_ready") return "ready_to_ship";
  if (stage === "mockup_preview") return "before_after_mockup";
  if (stage === "cover_assembly") return "cover_assembly";
  if (stage === "penamaan_process") return "penamaan_process";
  return null;
}

function schoolLevelFromToken(token: string): string | null {
  for (const level of ["sd", "smp", "sma", "mi", "mts", "ma"]) {
    if (token.includes(`_${level}_`) || token.endsWith(`_${level}`)) return level;
  }
  return null;
}

function colorVariantFromToken(token: string): string | null {
  const colors = ["maroon", "navy", "black", "green", "gray", "brown", "orange", "light_blue"];
  return colors.find((color) => token.includes(color)) ?? null;
}

function contentTags(
  entry: SourceFolderListingEntryReview,
  schoolLevel: string | null,
  colorVariant: string | null
): string[] {
  return [
    entry.product_family_guess,
    entry.process_stage_guess,
    entry.orientation_hint,
    ...(schoolLevel ? [`school_level:${schoolLevel}`] : []),
    ...(colorVariant ? [`color:${colorVariant}`] : [])
  ].filter((value) => value !== "unknown");
}

function recommendedUse(
  entry: SourceFolderListingEntryReview,
  status: z.infer<typeof EnrichmentStatusSchema>
): string | null {
  if (status === "blocked_enrichment") return null;
  if (entry.extension === ".jpg" || entry.extension === ".jpeg") return "support_asset_manual_review";
  if (entry.orientation_hint === "horizontal") return "manual_channel_fit_review";
  if (status === "enrichment_ready") return "metadata_enrichment_fixture_only";
  return "manual_metadata_review";
}

function channelFit(candidate: SourceFolderMetadataEnrichmentCandidate): string[] {
  if (candidate.suggested_orientation === "vertical") return ["instagram", "tiktok", "youtube_shorts", "whatsapp_status"];
  if (candidate.suggested_orientation === "horizontal") return ["facebook", "youtube"];
  return ["manual_review_required"];
}

function confidenceNotes(
  entry: SourceFolderListingEntryReview,
  status: z.infer<typeof EnrichmentStatusSchema>
): string[] {
  return [
    "Filename-derived suggestion only.",
    "Duration, codec, visual quality, and actual content are not inferred.",
    `Listing review status: ${entry.listing_review_status}.`,
    `Enrichment status: ${status}.`
  ];
}

function reviewNotes(
  entry: SourceFolderListingEntryReview,
  status: z.infer<typeof EnrichmentStatusSchema>
): string[] {
  if (status === "enrichment_ready") {
    return ["Safe filename signals support a suggested metadata row, but this is not render or public readiness."];
  }
  if (status === "blocked_enrichment") {
    return ["Entry remains blocked for enrichment because listing review or risk flags blocked it."];
  }
  return ["Manual owner metadata is required before this entry can be safely enriched."];
}

function recommendedAction(status: z.infer<typeof EnrichmentStatusSchema>): string {
  if (status === "enrichment_ready") return "Use suggested metadata row only in controlled fixtures; do not write production manifests.";
  if (status === "blocked_enrichment") return "Keep blocked until owner replaces or explicitly clears the entry.";
  if (status === "low_confidence") return "Resolve weak filename signals with manual owner metadata.";
  return "Add missing manual metadata before enrichment.";
}

function enrichmentFieldCoverage(candidates: SourceFolderMetadataEnrichmentCandidate[]): Record<string, number> {
  return {
    footage_id: candidates.filter((candidate) => candidate.suggested_footage_id).length,
    filename: candidates.filter((candidate) => candidate.filename).length,
    relative_path: candidates.filter((candidate) => candidate.relative_path).length,
    product_family: candidates.filter((candidate) => candidate.suggested_product_family).length,
    visual_type: candidates.filter((candidate) => candidate.suggested_visual_type).length,
    process_stage: candidates.filter((candidate) => candidate.suggested_process_stage).length,
    orientation: candidates.filter((candidate) => candidate.suggested_orientation).length,
    school_level: candidates.filter((candidate) => candidate.suggested_school_level).length,
    color_variant: candidates.filter((candidate) => candidate.suggested_color_variant).length,
    content_tags: candidates.filter((candidate) => candidate.suggested_content_tags.length > 0).length,
    risk_flags: candidates.length,
    recommended_use: candidates.filter((candidate) => candidate.suggested_recommended_use).length,
    channel_fit: candidates.filter((candidate) => candidate.enrichment_status === "enrichment_ready").length,
    usable_guess: candidates.filter((candidate) => candidate.enrichment_status === "enrichment_ready").length,
    notes: candidates.length
  };
}

function summarizeMissingFields(candidates: SourceFolderMetadataEnrichmentCandidate[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const candidate of candidates) {
    for (const field of candidate.missing_fields) summary[field] = (summary[field] || 0) + 1;
  }
  return summary;
}

function recommendedManualFields(candidates: SourceFolderMetadataEnrichmentCandidate[]): string[] {
  return [...new Set(candidates.flatMap((candidate) => candidate.missing_fields))];
}

function recommendedOwnerActions(
  status: "reviewable_listing" | "listing_review_denied",
  candidates: SourceFolderMetadataEnrichmentCandidate[]
): string[] {
  if (status === "listing_review_denied") {
    return ["Keep denied listing review cases blocked; do not enrich or access entries."];
  }
  const actions = [
    "Review suggested metadata rows before adding them to any future fixture.",
    "Keep blocked enrichment entries out of metadata fixtures.",
    "Do not write suggested rows to production manifests or real metadata stores."
  ];
  if (candidates.some((candidate) => candidate.enrichment_status === "needs_manual_metadata")) {
    actions.push("Complete manual metadata for horizontal, still-image, or incomplete-signal entries.");
  }
  return actions;
}

function nextSafeActions(status: "reviewable_listing" | "listing_review_denied"): string[] {
  if (status === "listing_review_denied") {
    return [
      "Do not enrich entries from denied listing review outputs.",
      "Return to Phase 2J.12 and 2J.13 gates before retry.",
      "Keep real-looking paths as metadata strings only."
    ];
  }
  return [
    "Keep enrichment suggestions limited to the approved safe fixture listing review.",
    "Do not open file contents, decode media, render, upload, publish, mutate storage, or write production metadata.",
    "Require a later owner-approved phase before any real source metadata enrichment."
  ];
}

function countStatus(
  candidates: SourceFolderMetadataEnrichmentCandidate[],
  status: z.infer<typeof EnrichmentStatusSchema>
): number {
  return candidates.filter((candidate) => candidate.enrichment_status === status).length;
}

function requireValue<T>(value: T | null): T {
  if (value === null) throw new Error("missing required suggested metadata value");
  return value;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
