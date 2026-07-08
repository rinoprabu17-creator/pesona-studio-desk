import { z } from "zod";
import {
  evaluateSourceFolderListingApprovalGateFixture,
  parseSourceFolderListingApprovalGateFixture,
  type SourceFolderListingApprovalGateFixture,
  type SourceFolderListingApprovalGateOutput
} from "./source-folder-listing-approval-gate.ts";

const LISTING_REVIEW_ID = "phase-2j13-source-folder-listing-review";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample";

const ListingReviewStatusSchema = z.enum([
  "listing_review_ok",
  "needs_manual_metadata",
  "blocked_entry",
  "low_confidence"
]);

export const SourceFolderListingReviewFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-listing-review-smoke-v1"),
  mode: z.literal("controlled_fixture_listing_review"),
  source_listing_gate_fixture: z.string().min(1),
  notes: z.string().min(1)
}).strict();

export const SourceFolderListingEntryReviewSchema = z.object({
  entry_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  extension: z.string().min(1),
  product_family_guess: z.string().min(1),
  product_family_confidence: z.number().int().min(0).max(100),
  process_stage_guess: z.string().min(1),
  process_stage_confidence: z.number().int().min(0).max(100),
  orientation_hint: z.enum(["vertical", "horizontal", "square", "unknown"]),
  orientation_confidence: z.number().int().min(0).max(100),
  risk_flags_guess: z.array(z.string().min(1)),
  listing_review_status: ListingReviewStatusSchema,
  missing_fields: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderListingReviewOutputSchema = z.object({
  listing_review_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  listing_gate_status: z.enum(["listing_allowed", "listing_denied"]),
  listing_allowed: z.boolean(),
  listing_performed: z.boolean(),
  total_listed_entries: z.number().int().min(0),
  reviewed_entries: z.number().int().min(0),
  accepted_for_metadata_review: z.number().int().min(0),
  needs_manual_metadata: z.number().int().min(0),
  blocked_entries: z.number().int().min(0),
  low_confidence_entries: z.number().int().min(0),
  entry_reviews: z.array(SourceFolderListingEntryReviewSchema),
  filename_signal_summary: z.object({
    product_family_known: z.number().int().min(0),
    process_stage_known: z.number().int().min(0),
    orientation_known: z.number().int().min(0),
    vertical_entries: z.number().int().min(0),
    video_like_entries: z.number().int().min(0),
    still_image_entries: z.number().int().min(0)
  }).strict(),
  extension_summary: z.record(z.string(), z.number().int().min(0)),
  risk_summary: z.record(z.string(), z.number().int().min(0)),
  missing_metadata_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_metadata_fields: z.array(z.string().min(1)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderListingReviewFixture = z.infer<typeof SourceFolderListingReviewFixtureSchema>;
export type SourceFolderListingEntryReview = z.infer<typeof SourceFolderListingEntryReviewSchema>;
export type SourceFolderListingReviewOutput = z.infer<typeof SourceFolderListingReviewOutputSchema>;

export type SourceFolderListingReviewBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderListingReviewFixture;
  reviews: SourceFolderListingReviewOutput[];
  listingAllowedCount: number;
  listingPerformedCount: number;
  reviewedEntries: number;
  listingReviewOkCount: number;
  needsManualMetadataCount: number;
  blockedEntriesCount: number;
  lowConfidenceEntriesCount: number;
  riskFlagCount: number;
  missingMetadataFieldCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

type ListingCandidate = {
  entry_id: string;
  filename: string;
  relative_path: string;
  extension: string;
  product_family_guess: string;
  process_stage_guess: string;
  orientation_hint: "vertical" | "horizontal" | "square" | "unknown";
  risk_flags_guess: string[];
};

export function parseSourceFolderListingReviewFixture(input: unknown): SourceFolderListingReviewFixture {
  return SourceFolderListingReviewFixtureSchema.parse(input);
}

export function reviewSourceFolderListingGateFixture(input: {
  reviewFixture: SourceFolderListingReviewFixture;
  listingGateFixture: SourceFolderListingApprovalGateFixture;
}): SourceFolderListingReviewBatchResult {
  const listingGateResult = evaluateSourceFolderListingApprovalGateFixture(input.listingGateFixture);
  const reviews = listingGateResult.gates.map(reviewSourceFolderListingGateOutput);
  return {
    provider: "fake_content_engine",
    fixture: input.reviewFixture,
    reviews,
    listingAllowedCount: reviews.filter((review) => review.listing_allowed).length,
    listingPerformedCount: reviews.filter((review) => review.listing_performed).length,
    reviewedEntries: sum(reviews.map((review) => review.reviewed_entries)),
    listingReviewOkCount: sum(reviews.map((review) => review.accepted_for_metadata_review)),
    needsManualMetadataCount: sum(reviews.map((review) => review.needs_manual_metadata)),
    blockedEntriesCount: sum(reviews.map((review) => review.blocked_entries)),
    lowConfidenceEntriesCount: sum(reviews.map((review) => review.low_confidence_entries)),
    riskFlagCount: sum(reviews.flatMap((review) => review.entry_reviews.map((entry) => entry.risk_flags_guess.length))),
    missingMetadataFieldCount: sum(
      reviews.flatMap((review) => review.entry_reviews.map((entry) => entry.missing_fields.length))
    ),
    recommendedOwnerActionsCount: sum(reviews.map((review) => review.recommended_owner_actions.length)),
    publicReadyCount: reviews.filter((review) => review.public_ready).length,
    publishTrack: "blocked"
  };
}

export function reviewSourceFolderListingGateOutput(
  listingGate: SourceFolderListingApprovalGateOutput
): SourceFolderListingReviewOutput {
  const listingGateStatus = listingGate.listing_allowed && listingGate.listing_performed
    ? "listing_allowed"
    : "listing_denied";
  const candidates = listingGateStatus === "listing_allowed"
    ? candidatesFromApprovedFixtureListing()
    : [];
  const entryReviews = candidates.map(reviewListingCandidate);

  return SourceFolderListingReviewOutputSchema.parse({
    listing_review_id: `${LISTING_REVIEW_ID}-${listingGate.source_id}`,
    source_id: listingGate.source_id,
    source_label: listingGate.source_label,
    source_root: listingGate.requested_source_root,
    dry_run: listingGate.dry_run,
    read_only: listingGate.read_only,
    listing_gate_status: listingGateStatus,
    listing_allowed: listingGate.listing_allowed,
    listing_performed: listingGate.listing_performed,
    total_listed_entries: listingGate.listing_performed ? listingGate.scanned_entries : 0,
    reviewed_entries: entryReviews.length,
    accepted_for_metadata_review: countStatus(entryReviews, "listing_review_ok"),
    needs_manual_metadata: countStatus(entryReviews, "needs_manual_metadata"),
    blocked_entries: countStatus(entryReviews, "blocked_entry"),
    low_confidence_entries: countStatus(entryReviews, "low_confidence"),
    entry_reviews: entryReviews,
    filename_signal_summary: filenameSignalSummary(entryReviews),
    extension_summary: summarizeExtensions(entryReviews),
    risk_summary: summarizeRiskFlags(entryReviews),
    missing_metadata_summary: summarizeMissingFields(entryReviews),
    recommended_metadata_fields: [
      "product_family",
      "process_stage",
      "orientation",
      "duration_sec",
      "codec",
      "visual_quality",
      "school_level",
      "color_variant",
      "content_tags",
      "owner_review_note"
    ],
    recommended_owner_actions: recommendedOwnerActions(listingGate, entryReviews),
    next_safe_actions: nextSafeActions(listingGateStatus),
    public_ready: false,
    publish_track: "blocked"
  });
}

export function parseAndReviewSourceFolderListingGateFixture(input: {
  reviewFixtureInput: unknown;
  listingGateFixtureInput: unknown;
}): SourceFolderListingReviewBatchResult {
  return reviewSourceFolderListingGateFixture({
    reviewFixture: parseSourceFolderListingReviewFixture(input.reviewFixtureInput),
    listingGateFixture: parseSourceFolderListingApprovalGateFixture(input.listingGateFixtureInput)
  });
}

function reviewListingCandidate(candidate: ListingCandidate): SourceFolderListingEntryReview {
  const missingFields = missingMetadataFields(candidate);
  const notes = ["Filename-only listing review. No media content, stream, codec, duration, or visual quality was inspected."];
  const blockingRisks = candidate.risk_flags_guess.filter((flag) =>
    ["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(flag)
  );

  if (blockingRisks.length > 0) {
    notes.push(`Blocked by risk flags: ${blockingRisks.join(", ")}.`);
    return buildEntryReview(candidate, "blocked_entry", missingFields, notes, "Keep blocked until owner replaces or manually clears this entry.");
  }

  if (candidate.risk_flags_guess.includes("blurry")) {
    notes.push("Blurry filename signal requires manual metadata and quality confirmation.");
    return buildEntryReview(candidate, "needs_manual_metadata", missingFields, notes, "Manually inspect metadata and quality before any future planning use.");
  }

  if (candidate.product_family_guess === "unknown" || candidate.process_stage_guess === "unknown") {
    notes.push("Filename does not provide enough product or process signal.");
    return buildEntryReview(candidate, "low_confidence", missingFields, notes, "Add manual product family and process stage metadata before using.");
  }

  if (candidate.orientation_hint === "unknown") {
    notes.push("Orientation is unknown from filename.");
    return buildEntryReview(candidate, "low_confidence", missingFields, notes, "Add manual orientation metadata before using.");
  }

  if (candidate.orientation_hint !== "vertical") {
    notes.push("Horizontal or square entry needs manual channel-fit review for vertical social planning.");
    return buildEntryReview(candidate, "needs_manual_metadata", missingFields, notes, "Confirm channel fit or capture a vertical replacement.");
  }

  if ([".jpg", ".jpeg"].includes(candidate.extension)) {
    notes.push("Still-image entry may be a support asset but is not video footage.");
    return buildEntryReview(candidate, "needs_manual_metadata", missingFields, notes, "Confirm intended use as a support asset, not render-ready footage.");
  }

  notes.push("Filename signals are sufficient for metadata review only; render and public readiness remain blocked.");
  return buildEntryReview(candidate, "listing_review_ok", missingFields, notes, "Proceed only to manual metadata enrichment while keeping publish track blocked.");
}

function buildEntryReview(
  candidate: ListingCandidate,
  status: z.infer<typeof ListingReviewStatusSchema>,
  missingFields: string[],
  notes: string[],
  action: string
): SourceFolderListingEntryReview {
  return SourceFolderListingEntryReviewSchema.parse({
    entry_id: candidate.entry_id,
    filename: candidate.filename,
    relative_path: candidate.relative_path,
    extension: candidate.extension,
    product_family_guess: candidate.product_family_guess,
    product_family_confidence: confidenceFor(candidate.product_family_guess),
    process_stage_guess: candidate.process_stage_guess,
    process_stage_confidence: confidenceFor(candidate.process_stage_guess),
    orientation_hint: candidate.orientation_hint,
    orientation_confidence: candidate.orientation_hint === "unknown" ? 0 : 85,
    risk_flags_guess: candidate.risk_flags_guess,
    listing_review_status: status,
    missing_fields: missingFields,
    review_notes: notes,
    recommended_action: action
  });
}

function candidatesFromApprovedFixtureListing(): ListingCandidate[] {
  return [
    candidate("map_ijazah_horizontal_cover_assembly_gray_ma_007", "map-ijazah-horizontal-cover-assembly-gray-ma-007.mp4", "map_ijazah", "cover_assembly", "horizontal", []),
    candidate("map_ijazah_vertical_delivery_ready_brown_mts_005", "map-ijazah-vertical-delivery-ready-brown-mts-005.mov", "map_ijazah", "delivery_ready", "vertical", []),
    candidate("map_ijazah_vertical_product_closeup_green_ma_004", "map-ijazah-vertical-product-closeup-green-ma-004.mp4", "map_ijazah", "product_closeup", "vertical", []),
    candidate("sr_horizontal_packing_qc_black_sma_003", "sr-horizontal-packing-qc-black-sma-003.mp4", "sampul_raport", "packing_qc", "horizontal", []),
    candidate("sr_vertical_foil_poly_navy_smp_002", "sr-vertical-foil-poly-navy-smp-002.mov", "sampul_raport", "foil_emboss_poly", "vertical", []),
    candidate("sr_vertical_mockup_desain_gratis_light_blue_mi_006", "sr-vertical-mockup-desain-gratis-light-blue-mi-006.jpg", "sampul_raport", "mockup_preview", "vertical", []),
    candidate("sr_vertical_penamaan_process_orange_sd_008", "sr-vertical-penamaan-process-orange-sd-008.mov", "sampul_raport", "penamaan_process", "vertical", []),
    candidate("sr_vertical_privacy_blurry_placeholder_unrelated_009", "sr-vertical-privacy-blurry-placeholder-unrelated-009.mp4", "sampul_raport", "unknown", "vertical", ["privacy_review_needed", "blurry", "placeholder", "unrelated_content"]),
    candidate("sr_vertical_product_closeup_maroon_sd_001", "sr-vertical-product-closeup-maroon-sd-001.mp4", "sampul_raport", "product_closeup", "vertical", [])
  ];
}

function candidate(
  entryId: string,
  filename: string,
  productFamily: string,
  processStage: string,
  orientation: "vertical" | "horizontal" | "square" | "unknown",
  riskFlags: string[]
): ListingCandidate {
  const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return {
    entry_id: entryId,
    filename,
    relative_path: `${SAFE_FIXTURE_ROOT}/${filename}`,
    extension,
    product_family_guess: productFamily,
    process_stage_guess: processStage,
    orientation_hint: orientation,
    risk_flags_guess: riskFlags
  };
}

function missingMetadataFields(candidate: ListingCandidate): string[] {
  const missing = ["duration_sec", "visual_quality", "codec", "owner_review_note"];
  if (candidate.product_family_guess === "unknown") missing.push("product_family");
  if (candidate.process_stage_guess === "unknown") missing.push("process_stage");
  if (candidate.orientation_hint === "unknown") missing.push("orientation");
  return missing;
}

function confidenceFor(value: string): number {
  return value === "unknown" ? 0 : 80;
}

function countStatus(
  reviews: SourceFolderListingEntryReview[],
  status: z.infer<typeof ListingReviewStatusSchema>
): number {
  return reviews.filter((review) => review.listing_review_status === status).length;
}

function filenameSignalSummary(reviews: SourceFolderListingEntryReview[]): SourceFolderListingReviewOutput["filename_signal_summary"] {
  return {
    product_family_known: reviews.filter((review) => review.product_family_guess !== "unknown").length,
    process_stage_known: reviews.filter((review) => review.process_stage_guess !== "unknown").length,
    orientation_known: reviews.filter((review) => review.orientation_hint !== "unknown").length,
    vertical_entries: reviews.filter((review) => review.orientation_hint === "vertical").length,
    video_like_entries: reviews.filter((review) => [".mp4", ".mov"].includes(review.extension)).length,
    still_image_entries: reviews.filter((review) => [".jpg", ".jpeg"].includes(review.extension)).length
  };
}

function summarizeExtensions(reviews: SourceFolderListingEntryReview[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const review of reviews) summary[review.extension] = (summary[review.extension] || 0) + 1;
  return summary;
}

function summarizeRiskFlags(reviews: SourceFolderListingEntryReview[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const review of reviews) {
    if (review.risk_flags_guess.length === 0) {
      summary.none = (summary.none || 0) + 1;
      continue;
    }
    for (const flag of review.risk_flags_guess) summary[flag] = (summary[flag] || 0) + 1;
  }
  return summary;
}

function summarizeMissingFields(reviews: SourceFolderListingEntryReview[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const review of reviews) {
    for (const field of review.missing_fields) summary[field] = (summary[field] || 0) + 1;
  }
  return summary;
}

function recommendedOwnerActions(
  listingGate: SourceFolderListingApprovalGateOutput,
  reviews: SourceFolderListingEntryReview[]
): string[] {
  if (!listingGate.listing_allowed || !listingGate.listing_performed) {
    return ["Keep denied listing cases blocked; do not review entries or access any source folder."];
  }
  const actions = [
    "Add owner-reviewed metadata for duration, quality, codec, school level, color, tags, recommended use, and channel fit.",
    "Keep blocked entries out of candidate selection until owner replaces or manually clears them.",
    "Confirm horizontal and still-image entries before any future short-form planning."
  ];
  if (reviews.some((review) => review.listing_review_status === "low_confidence")) {
    actions.push("Resolve low-confidence filename signals before moving any entry into expanded metadata.");
  }
  return actions;
}

function nextSafeActions(listingGateStatus: "listing_allowed" | "listing_denied"): string[] {
  if (listingGateStatus === "listing_denied") {
    return [
      "Do not review entries from denied listing gate outputs.",
      "Return to Phase 2J.10 through Phase 2J.12 gate fixes before retry.",
      "Keep real-looking paths as metadata strings only."
    ];
  }
  return [
    "Keep review limited to the Phase 2J.12 approved safe fixture listing.",
    "Do not open file contents, decode media, render, upload, publish, or mutate storage.",
    "Require a later owner-approved phase before any real source folder listing review."
  ];
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
