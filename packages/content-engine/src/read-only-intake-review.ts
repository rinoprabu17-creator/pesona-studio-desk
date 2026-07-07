import { z } from "zod";
import {
  getReadOnlyIntakeSafeFixtureRoot,
  runReadOnlyIntakeDryRun,
  type ReadOnlyIntakeCandidateRow,
  type ReadOnlyIntakeResult
} from "./read-only-intake.ts";

const ReviewStatusSchema = z.enum([
  "metadata_review_ok",
  "needs_manual_metadata",
  "blocked_candidate",
  "low_confidence"
]);

export const ReadOnlyIntakeCandidateReviewSchema = z.object({
  footage_id: z.string().min(1),
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
  review_status: ReviewStatusSchema,
  missing_fields: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const ReadOnlyIntakeReviewResultSchema = z.object({
  review_id: z.string().min(1),
  source_intake_id: z.string().min(1),
  source_fixture: z.string().min(1),
  dry_run: z.literal(true),
  read_only: z.literal(true),
  total_candidates: z.number().int().min(0),
  reviewed_candidates: z.number().int().min(0),
  accepted_for_metadata_review: z.number().int().min(0),
  needs_manual_metadata: z.number().int().min(0),
  blocked_candidates: z.number().int().min(0),
  low_confidence_candidates: z.number().int().min(0),
  candidate_reviews: z.array(ReadOnlyIntakeCandidateReviewSchema),
  filename_signal_summary: z.object({
    product_family_known: z.number().int().min(0),
    process_stage_known: z.number().int().min(0),
    orientation_known: z.number().int().min(0),
    vertical_candidates: z.number().int().min(0),
    media_like_video_candidates: z.number().int().min(0),
    still_image_candidates: z.number().int().min(0)
  }).strict(),
  risk_summary: z.record(z.string(), z.number().int().min(0)),
  missing_metadata_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_metadata_fields: z.array(z.string().min(1)),
  recommended_manual_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type ReadOnlyIntakeCandidateReview = z.infer<typeof ReadOnlyIntakeCandidateReviewSchema>;
export type ReadOnlyIntakeReviewResult = z.infer<typeof ReadOnlyIntakeReviewResultSchema>;

export function reviewReadOnlyIntakeResult(intake: ReadOnlyIntakeResult): ReadOnlyIntakeReviewResult {
  const candidateReviews = intake.candidate_manifest_rows.map(reviewCandidate);
  const missingMetadataSummary = summarizeMissingFields(candidateReviews);
  const riskSummary = summarizeRiskFlags(candidateReviews);

  return ReadOnlyIntakeReviewResultSchema.parse({
    review_id: "phase-2j9-read-only-intake-review",
    source_intake_id: intake.intake_id,
    source_fixture: intake.source_root,
    dry_run: true,
    read_only: true,
    total_candidates: intake.candidate_manifest_rows.length,
    reviewed_candidates: candidateReviews.length,
    accepted_for_metadata_review: countStatus(candidateReviews, "metadata_review_ok"),
    needs_manual_metadata: countStatus(candidateReviews, "needs_manual_metadata"),
    blocked_candidates: countStatus(candidateReviews, "blocked_candidate"),
    low_confidence_candidates: countStatus(candidateReviews, "low_confidence"),
    candidate_reviews: candidateReviews,
    filename_signal_summary: {
      product_family_known: intake.candidate_manifest_rows.filter((row) => row.product_family_guess !== "unknown").length,
      process_stage_known: intake.candidate_manifest_rows.filter((row) => row.process_stage_guess !== "unknown").length,
      orientation_known: intake.candidate_manifest_rows.filter((row) => row.orientation_hint !== "unknown").length,
      vertical_candidates: intake.candidate_manifest_rows.filter((row) => row.orientation_hint === "vertical").length,
      media_like_video_candidates: intake.candidate_manifest_rows.filter((row) => [".mp4", ".mov"].includes(row.extension)).length,
      still_image_candidates: intake.candidate_manifest_rows.filter((row) => [".jpg", ".jpeg"].includes(row.extension)).length
    },
    risk_summary: riskSummary,
    missing_metadata_summary: missingMetadataSummary,
    recommended_metadata_fields: [
      "product_family",
      "process_stage",
      "orientation",
      "school_level",
      "color_variant",
      "content_tags",
      "recommended_use",
      "channel_fit",
      "owner_review_note"
    ],
    recommended_manual_actions: recommendedManualActions(candidateReviews),
    next_safe_actions: [
      "Keep this review limited to the Phase 2J.8 safe repo fixture output.",
      "Manually enrich candidates that need metadata before any real footage source is considered.",
      "Use a later owner-approved gate before any real folder read-only scan.",
      "Do not render, decode, upload, publish, create packages, or mark public readiness."
    ],
    public_ready: false,
    publish_track: "blocked"
  });
}

export function runReadOnlyIntakeReview(input: {
  sourceRoot?: string;
  projectRoot?: string;
} = {}): ReadOnlyIntakeReviewResult {
  const intake = runReadOnlyIntakeDryRun({
    sourceRoot: input.sourceRoot || getReadOnlyIntakeSafeFixtureRoot(),
    projectRoot: input.projectRoot
  });
  return reviewReadOnlyIntakeResult(intake);
}

function reviewCandidate(row: ReadOnlyIntakeCandidateRow): ReadOnlyIntakeCandidateReview {
  const missingFields = missingMetadataFields(row);
  const notes: string[] = [
    "Filename-only review. No file content, stream, codec, duration, or visual quality was inspected."
  ];
  const blockingRisks = row.risk_flags_guess.filter((flag) =>
    ["privacy_review_needed", "unrelated_content", "placeholder", "suspicious"].includes(flag)
  );

  if (blockingRisks.length > 0) {
    notes.push(`Blocked by risk flags: ${blockingRisks.join(", ")}.`);
    return buildReview(row, "blocked_candidate", missingFields, notes, "Keep blocked until owner provides replacement footage or explicit manual clearance.");
  }

  if (row.risk_flags_guess.includes("blurry")) {
    notes.push("Blurry filename signal requires human metadata and quality review.");
    return buildReview(row, "low_confidence", missingFields, notes, "Request manual metadata and quality confirmation before using this candidate.");
  }

  if (row.product_family_guess === "unknown" || row.process_stage_guess === "unknown") {
    notes.push("Filename does not provide enough product or process signal.");
    return buildReview(row, "low_confidence", missingFields, notes, "Add manual product family and process stage metadata.");
  }

  if (row.orientation_hint === "unknown") {
    notes.push("Orientation is unknown from filename.");
    return buildReview(row, "needs_manual_metadata", missingFields, notes, "Add manual orientation metadata before vertical social planning.");
  }

  if (row.orientation_hint !== "vertical") {
    notes.push("Horizontal or square candidate needs manual channel-fit review for vertical social planning.");
    return buildReview(row, "needs_manual_metadata", missingFields, notes, "Confirm channel fit or capture a vertical replacement before short-form planning.");
  }

  if ([".jpg", ".jpeg"].includes(row.extension)) {
    notes.push("Still-image candidate may support mockup/proof planning but is not a video clip.");
    return buildReview(row, "needs_manual_metadata", missingFields, notes, "Confirm intended use as still support asset, not video footage.");
  }

  notes.push("Filename signals are sufficient for metadata review, but not for render or public readiness.");
  return buildReview(row, "metadata_review_ok", missingFields, notes, "Proceed to manual metadata enrichment while keeping publish track blocked.");
}

function buildReview(
  row: ReadOnlyIntakeCandidateRow,
  status: z.infer<typeof ReviewStatusSchema>,
  missingFields: string[],
  notes: string[],
  action: string
): ReadOnlyIntakeCandidateReview {
  return ReadOnlyIntakeCandidateReviewSchema.parse({
    footage_id: row.footage_id,
    filename: row.filename,
    relative_path: row.relative_path,
    extension: row.extension,
    product_family_guess: row.product_family_guess,
    product_family_confidence: confidenceFor(row.product_family_guess),
    process_stage_guess: row.process_stage_guess,
    process_stage_confidence: confidenceFor(row.process_stage_guess),
    orientation_hint: row.orientation_hint,
    orientation_confidence: row.orientation_hint === "unknown" ? 0 : 85,
    risk_flags_guess: row.risk_flags_guess,
    review_status: status,
    missing_fields: missingFields,
    review_notes: notes,
    recommended_action: action
  });
}

function missingMetadataFields(row: ReadOnlyIntakeCandidateRow): string[] {
  const missing: string[] = ["duration_sec", "visual_quality", "codec", "owner_review_note"];
  if (row.product_family_guess === "unknown") missing.push("product_family");
  if (row.process_stage_guess === "unknown") missing.push("process_stage");
  if (row.orientation_hint === "unknown") missing.push("orientation");
  if (!row.relative_path) missing.push("relative_path");
  return missing;
}

function confidenceFor(value: string): number {
  return value === "unknown" ? 0 : 80;
}

function countStatus(reviews: ReadOnlyIntakeCandidateReview[], status: z.infer<typeof ReviewStatusSchema>): number {
  return reviews.filter((review) => review.review_status === status).length;
}

function summarizeRiskFlags(reviews: ReadOnlyIntakeCandidateReview[]): Record<string, number> {
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

function summarizeMissingFields(reviews: ReadOnlyIntakeCandidateReview[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const review of reviews) {
    for (const field of review.missing_fields) summary[field] = (summary[field] || 0) + 1;
  }
  return summary;
}

function recommendedManualActions(reviews: ReadOnlyIntakeCandidateReview[]): string[] {
  const actions = [
    "Add manual duration, quality, school level, color, content tags, recommended use, and channel fit before real planning.",
    "Keep blocked candidates out of selection until owner review clears or replaces them.",
    "Capture or choose vertical replacements for horizontal candidates before Reels/Shorts planning."
  ];
  if (reviews.some((review) => review.extension === ".jpg" || review.extension === ".jpeg")) {
    actions.push("Confirm whether still-image candidates are support assets instead of video footage.");
  }
  if (reviews.some((review) => review.review_status === "low_confidence")) {
    actions.push("Manually inspect low-confidence filename signals before adding them to expanded metadata fixtures.");
  }
  return actions;
}
