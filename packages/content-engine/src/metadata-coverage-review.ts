import { z } from "zod";
import type { ExpandedBatchParseResult, ExpandedFootageBatchRow } from "./expanded-batch.ts";

const CoverageLevelSchema = z.enum(["weak", "partial", "usable_for_pilot", "strong_metadata_base"]);

const CoverageDimensionSchema = z.object({
  covered: z.boolean(),
  usable_count: z.number().int().min(0),
  target_count: z.number().int().min(0),
  notes: z.array(z.string().min(1))
}).strict();

export const MetadataCoverageReviewSchema = z.object({
  review_id: z.string().min(1),
  source_fixture: z.string().min(1),
  total_rows: z.number().int().min(0),
  usable_rows: z.number().int().min(0),
  blocked_rows: z.number().int().min(0),
  coverage_score: z.number().int().min(0).max(100),
  coverage_level: CoverageLevelSchema,
  product_family_coverage: z.record(z.string(), CoverageDimensionSchema),
  process_stage_coverage: z.record(z.string(), CoverageDimensionSchema),
  channel_coverage: z.record(z.string(), CoverageDimensionSchema),
  school_level_coverage: z.record(z.string(), CoverageDimensionSchema),
  color_variant_coverage: z.record(z.string(), CoverageDimensionSchema),
  hook_asset_coverage: z.record(z.string(), CoverageDimensionSchema),
  cta_asset_coverage: z.record(z.string(), CoverageDimensionSchema),
  content_calendar_support: z.object({
    estimated_unique_short_video_ideas: z.number().int().min(0),
    estimated_usable_30_day_slots: z.number().int().min(0).max(30),
    strongest_content_pillars: z.array(z.string().min(1)),
    weakest_content_pillars: z.array(z.string().min(1)),
    minimum_additional_footage_needed: z.number().int().min(0),
    suggested_capture_list: z.array(z.string().min(1)),
    estimate_note: z.string().min(1)
  }).strict(),
  weak_spots: z.array(z.string().min(1)),
  recommended_footage_to_capture: z.array(z.string().min(1)),
  blocked_risk_summary: z.record(z.string(), z.number().int().min(0)),
  readiness_notes: z.array(z.string().min(1)),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type CoverageLevel = z.infer<typeof CoverageLevelSchema>;
export type MetadataCoverageReview = z.infer<typeof MetadataCoverageReviewSchema>;

const PRODUCT_TARGETS = {
  sampul_raport: 12,
  map_ijazah: 6
} as const;

const PROCESS_TARGETS = {
  product_closeup: 8,
  foil_emboss_poly: 3,
  cover_assembly: 2,
  inner_sheet_process: 2,
  packing_qc: 3,
  delivery_ready: 2,
  mockup_preview: 3
} as const;

const CHANNEL_TARGETS = {
  facebook: 12,
  instagram: 20,
  tiktok: 10,
  youtube: 12
} as const;

const SCHOOL_TARGETS = {
  sd: 3,
  smp: 3,
  sma: 3,
  mi: 1,
  mts: 1,
  ma: 3
} as const;

const COLOR_TARGETS = {
  maroon: 3,
  navy: 3,
  black: 2,
  green: 2,
  gray: 1,
  light_blue: 1,
  brown: 1,
  orange: 1
} as const;

export function reviewMetadataCoverage(
  expanded: ExpandedBatchParseResult,
  sourceFixture: string
): MetadataCoverageReview {
  const usableRows = expanded.usableRows;
  const productFamilyCoverage = buildCoverageMap(PRODUCT_TARGETS, (key) => usableRows.filter((row) => row.product_family === key).length);
  const processStageCoverage = buildCoverageMap(PROCESS_TARGETS, (key) => usableRows.filter((row) => row.process_stage === key).length);
  const channelCoverage = buildCoverageMap(CHANNEL_TARGETS, (key) => usableRows.filter((row) => row.channel_fit.includes(key as "facebook" | "instagram" | "tiktok" | "youtube")).length);
  const schoolLevelCoverage = buildCoverageMap(SCHOOL_TARGETS, (key) => usableRows.filter((row) => row.school_level === key).length);
  const colorVariantCoverage = buildCoverageMap(COLOR_TARGETS, (key) => usableRows.filter((row) => row.color_variant === key).length);
  const hookAssetCoverage = buildHookAssetCoverage(usableRows);
  const ctaAssetCoverage = buildCtaAssetCoverage(usableRows);
  const weakSpots = buildWeakSpots({
    productFamilyCoverage,
    processStageCoverage,
    channelCoverage,
    schoolLevelCoverage,
    colorVariantCoverage,
    hookAssetCoverage,
    ctaAssetCoverage,
    usableRows
  });
  const recommendedCapture = buildRecommendedCaptureList(weakSpots);
  const coverageScore = calculateCoverageScore({
    productFamilyCoverage,
    processStageCoverage,
    channelCoverage,
    schoolLevelCoverage,
    colorVariantCoverage,
    hookAssetCoverage,
    ctaAssetCoverage,
    usableRows,
    blockedRows: expanded.blockedRows
  });
  const coverageLevel = determineCoverageLevel(coverageScore, expanded.summary.usable_rows, weakSpots);
  const contentCalendarSupport = estimateCalendarSupport({
    coverageLevel,
    weakSpots,
    recommendedCapture,
    usableRows,
    productFamilyCoverage,
    processStageCoverage,
    channelCoverage,
    hookAssetCoverage,
    ctaAssetCoverage
  });

  return MetadataCoverageReviewSchema.parse({
    review_id: "phase-2j6-real-footage-metadata-coverage-review",
    source_fixture: sourceFixture,
    total_rows: expanded.summary.total_rows,
    usable_rows: expanded.summary.usable_rows,
    blocked_rows: expanded.summary.blocked_rows,
    coverage_score: coverageScore,
    coverage_level: coverageLevel,
    product_family_coverage: productFamilyCoverage,
    process_stage_coverage: processStageCoverage,
    channel_coverage: channelCoverage,
    school_level_coverage: schoolLevelCoverage,
    color_variant_coverage: colorVariantCoverage,
    hook_asset_coverage: hookAssetCoverage,
    cta_asset_coverage: ctaAssetCoverage,
    content_calendar_support: contentCalendarSupport,
    weak_spots: weakSpots,
    recommended_footage_to_capture: recommendedCapture,
    blocked_risk_summary: expanded.summary.risk_flag_breakdown,
    readiness_notes: [
      "Metadata coverage is an approximation only; it does not verify real media readability or visual quality.",
      "The batch can support planning review, but render and public-readiness decisions remain blocked.",
      "Real footage paths remain metadata strings and are not scanned or opened by this review."
    ],
    public_ready: false,
    publish_track: "blocked"
  });
}

function buildCoverageMap<T extends Record<string, number>>(
  targets: T,
  countFor: (key: keyof T & string) => number
): Record<string, z.infer<typeof CoverageDimensionSchema>> {
  return Object.fromEntries(Object.entries(targets).map(([key, targetCount]) => {
    const usableCount = countFor(key as keyof T & string);
    return [key, {
      covered: usableCount >= targetCount,
      usable_count: usableCount,
      target_count: targetCount,
      notes: [usableCount >= targetCount
        ? `${key} meets metadata target.`
        : `${key} needs ${targetCount - usableCount} more usable metadata row(s).`]
    }];
  }));
}

function buildHookAssetCoverage(rows: ExpandedFootageBatchRow[]): Record<string, z.infer<typeof CoverageDimensionSchema>> {
  return {
    product_closeup_hook: coverageDimension("product_closeup_hook", rows.filter((row) => row.visual_type.includes("close_up") || row.process_stage === "product_closeup").length, 8),
    process_trust_hook: coverageDimension("process_trust_hook", rows.filter((row) => isProcessRow(row)).length, 8),
    qc_proof_hook: coverageDimension("qc_proof_hook", rows.filter((row) => row.process_stage === "packing_qc" || row.content_tags.includes("qc")).length, 3),
    delivery_ready_hook: coverageDimension("delivery_ready_hook", rows.filter((row) => row.process_stage === "delivery_ready" || row.content_tags.includes("delivery")).length, 2),
    color_variant_hook: coverageDimension("color_variant_hook", new Set(rows.map((row) => row.color_variant).filter(Boolean)).size, 8)
  };
}

function buildCtaAssetCoverage(rows: ExpandedFootageBatchRow[]): Record<string, z.infer<typeof CoverageDimensionSchema>> {
  return {
    mockup_desain_gratis_cta: coverageDimension("mockup_desain_gratis_cta", rows.filter((row) => hasAny(row, ["mockup", "desain_gratis", "cta"])).length, 3),
    proof_before_after_cta: coverageDimension("proof_before_after_cta", rows.filter((row) => row.visual_type.includes("before_after") || row.content_tags.includes("proof")).length, 2),
    closing_product_cta: coverageDimension("closing_product_cta", rows.filter((row) => row.recommended_use.includes("cta") || row.recommended_use.includes("closing")).length, 3)
  };
}

function coverageDimension(key: string, usableCount: number, targetCount: number): z.infer<typeof CoverageDimensionSchema> {
  return {
    covered: usableCount >= targetCount,
    usable_count: usableCount,
    target_count: targetCount,
    notes: [usableCount >= targetCount ? `${key} meets metadata target.` : `${key} needs ${targetCount - usableCount} more usable metadata row(s).`]
  };
}

function buildWeakSpots(input: {
  productFamilyCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  processStageCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  channelCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  schoolLevelCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  colorVariantCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  hookAssetCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  ctaAssetCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  usableRows: ExpandedFootageBatchRow[];
}): string[] {
  const weakSpots = [
    ...uncoveredKeys("product_family", input.productFamilyCoverage),
    ...uncoveredKeys("process_stage", input.processStageCoverage),
    ...uncoveredKeys("channel", input.channelCoverage),
    ...uncoveredKeys("school_level", input.schoolLevelCoverage),
    ...uncoveredKeys("color_variant", input.colorVariantCoverage),
    ...uncoveredKeys("hook_asset", input.hookAssetCoverage),
    ...uncoveredKeys("cta_asset", input.ctaAssetCoverage)
  ];
  if (input.usableRows.filter((row) => row.orientation === "vertical").length < 20) weakSpots.push("vertical_social_metadata_below_20");
  if (input.usableRows.filter((row) => row.quality_score >= 75).length < 20) weakSpots.push("high_quality_usable_metadata_below_20");
  return weakSpots;
}

function uncoveredKeys(prefix: string, coverage: Record<string, z.infer<typeof CoverageDimensionSchema>>): string[] {
  return Object.entries(coverage)
    .filter(([, value]) => !value.covered)
    .map(([key]) => `${prefix}:${key}`);
}

function buildRecommendedCaptureList(weakSpots: string[]): string[] {
  if (weakSpots.length === 0) {
    return [
      "Capture a small real-media verification set matching the strongest metadata rows before any render dry-run.",
      "Add fresh CTA/mockup clips whenever the owner changes the offer or channel priority.",
      "Keep adding Map Ijazah proof/QC footage until it matches Sampul Raport depth."
    ];
  }
  return weakSpots.map((spot) => `Capture additional safe usable footage for ${spot.replace(":", " ")}.`);
}

function calculateCoverageScore(input: {
  productFamilyCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  processStageCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  channelCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  schoolLevelCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  colorVariantCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  hookAssetCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  ctaAssetCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  usableRows: ExpandedFootageBatchRow[];
  blockedRows: ExpandedFootageBatchRow[];
}): number {
  const score =
    coverageRatio(input.productFamilyCoverage, 18) +
    coverageRatio(input.processStageCoverage, 22) +
    coverageRatio(input.channelCoverage, 15) +
    coverageRatio(input.schoolLevelCoverage, 10) +
    coverageRatio(input.colorVariantCoverage, 10) +
    coverageRatio(input.hookAssetCoverage, 10) +
    coverageRatio(input.ctaAssetCoverage, 8) +
    (input.usableRows.filter((row) => row.quality_score >= 75).length >= 20 ? 5 : 2) +
    (input.blockedRows.length <= Math.max(6, Math.floor(input.usableRows.length * 0.25)) ? 2 : 0);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function coverageRatio(coverage: Record<string, z.infer<typeof CoverageDimensionSchema>>, maxScore: number): number {
  const values = Object.values(coverage);
  if (values.length === 0) return 0;
  const covered = values.filter((value) => value.covered).length;
  return Math.round((covered / values.length) * maxScore);
}

function determineCoverageLevel(score: number, usableRows: number, weakSpots: string[]): CoverageLevel {
  if (usableRows < 10 || score < 45) return "weak";
  if (score < 65 || weakSpots.length > 10) return "partial";
  if (score < 85 || weakSpots.length > 4) return "usable_for_pilot";
  return "strong_metadata_base";
}

function estimateCalendarSupport(input: {
  coverageLevel: CoverageLevel;
  weakSpots: string[];
  recommendedCapture: string[];
  usableRows: ExpandedFootageBatchRow[];
  productFamilyCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  processStageCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  channelCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  hookAssetCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
  ctaAssetCoverage: Record<string, z.infer<typeof CoverageDimensionSchema>>;
}): MetadataCoverageReview["content_calendar_support"] {
  const productFamilies = Object.values(input.productFamilyCoverage).filter((value) => value.usable_count > 0).length;
  const processStages = Object.values(input.processStageCoverage).filter((value) => value.usable_count > 0).length;
  const channelTargets = Object.values(input.channelCoverage).filter((value) => value.covered).length;
  const hookTargets = Object.values(input.hookAssetCoverage).filter((value) => value.covered).length;
  const ctaTargets = Object.values(input.ctaAssetCoverage).filter((value) => value.covered).length;
  const estimatedUniqueIdeas = Math.min(45, productFamilies * 5 + processStages * 3 + hookTargets * 2 + ctaTargets + channelTargets);
  const estimatedSlots = Math.min(30, estimatedUniqueIdeas, Math.floor(input.usableRows.length * 0.9) + channelTargets);
  const weakestPillars = [
    ...uncoveredKeys("process_stage", input.processStageCoverage),
    ...uncoveredKeys("hook_asset", input.hookAssetCoverage),
    ...uncoveredKeys("cta_asset", input.ctaAssetCoverage)
  ].slice(0, 8);
  const strongestPillars = [
    ...coveredKeys("product_family", input.productFamilyCoverage),
    ...coveredKeys("process_stage", input.processStageCoverage),
    ...coveredKeys("hook_asset", input.hookAssetCoverage),
    ...coveredKeys("cta_asset", input.ctaAssetCoverage)
  ].slice(0, 10);
  const minimumAdditionalFootageNeeded = input.coverageLevel === "strong_metadata_base" ? 0 : Math.min(20, input.weakSpots.length * 2);
  return {
    estimated_unique_short_video_ideas: estimatedUniqueIdeas,
    estimated_usable_30_day_slots: estimatedSlots,
    strongest_content_pillars: strongestPillars,
    weakest_content_pillars: weakestPillars,
    minimum_additional_footage_needed: minimumAdditionalFootageNeeded,
    suggested_capture_list: input.recommendedCapture,
    estimate_note: "Metadata-only approximation for planning coverage; it is not render validation, media QA, or public publishing approval."
  };
}

function coveredKeys(prefix: string, coverage: Record<string, z.infer<typeof CoverageDimensionSchema>>): string[] {
  return Object.entries(coverage)
    .filter(([, value]) => value.covered)
    .map(([key]) => `${prefix}:${key}`);
}

function isProcessRow(row: ExpandedFootageBatchRow): boolean {
  return row.process_stage.includes("process") ||
    row.process_stage.includes("assembly") ||
    row.process_stage.includes("poly") ||
    row.process_stage.includes("penamaan") ||
    row.process_stage.includes("packing");
}

function hasAny(row: ExpandedFootageBatchRow, tokens: string[]): boolean {
  const values = [...row.content_tags, ...row.recommended_use, row.notes.toLowerCase()];
  return tokens.some((token) => values.some((value) => value.includes(token)));
}
