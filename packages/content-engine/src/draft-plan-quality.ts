import { readFileSync } from "node:fs";
import { z } from "zod";
import type { FootageIntakeManifestRow } from "./intake.ts";
import { reviewScriptDraftPlans, type PlannedContentReviewItem } from "./script-draft-review.ts";

const TargetChannelSchema = z.enum(["facebook", "instagram", "tiktok", "youtube"]);
const OrientationSchema = z.enum(["vertical", "horizontal", "square"]);
const ReadinessLevelSchema = z.enum(["blocked", "needs_footage", "review_required", "draft_plan_ok"]);

export const DraftPlanQualityPlannedItemSchema = z.object({
  content_id: z.string().min(1),
  content_goal: z.string().min(1),
  product_family: z.string().min(1),
  target_channel: TargetChannelSchema,
  hook: z.string().min(1),
  required_visual_types: z.array(z.string().min(1)).min(1),
  preferred_orientation: OrientationSchema,
  planned_scene_count: z.number().int().positive(),
  cta: z.string().min(1),
  closing_line: z.string().min(1)
}).strict();

export const DraftPlanQualityFixtureSchema = z.object({
  fixture_version: z.literal("draft-plan-quality-tuning-smoke-v1"),
  source: z.string().min(1),
  mode: z.literal("metadata_plan_only_fixture"),
  planned_content: z.array(DraftPlanQualityPlannedItemSchema).min(4)
}).strict();

export const DraftPlanQualityOutputSchema = z.object({
  content_id: z.string().min(1),
  readiness_level: ReadinessLevelSchema,
  readiness_score: z.number().int().min(0).max(100),
  score_components: z.object({
    selected_footage_count: z.number().int().min(0),
    product_coverage_score: z.number().int().min(0).max(20),
    orientation_fit_score: z.number().int().min(0).max(15),
    missing_footage_score: z.number().int().min(0).max(15),
    risk_safety_score: z.number().int().min(0).max(15),
    scene_count_score: z.number().int().min(0).max(10),
    cta_clarity_score: z.number().int().min(0).max(10),
    hook_product_match_score: z.number().int().min(0).max(10),
    product_relevance_score: z.number().int().min(0).max(5)
  }).strict(),
  blocking_reasons: z.array(z.string().min(1)),
  improvement_actions: z.array(z.string().min(1)),
  footage_coverage: z.object({
    required_visual_count: z.number().int().min(0),
    covered_visual_count: z.number().int().min(0),
    selected_footage_count: z.number().int().min(0),
    coverage_ratio: z.number().min(0).max(1)
  }).strict(),
  missing_footage_priority: z.array(z.string().min(1)),
  channel_fit_notes: z.array(z.string().min(1)),
  product_relevance_notes: z.array(z.string().min(1)),
  hook_strength_notes: z.array(z.string().min(1)),
  scene_flow_notes: z.array(z.string().min(1)),
  risk_notes: z.array(z.string().min(1)),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type DraftPlanQualityPlannedItem = z.infer<typeof DraftPlanQualityPlannedItemSchema>;
export type DraftPlanQualityFixture = z.infer<typeof DraftPlanQualityFixtureSchema>;
export type DraftPlanQualityOutput = z.infer<typeof DraftPlanQualityOutputSchema>;

export type DraftPlanQualityBatchResult = {
  provider: "fake_content_engine";
  fixture: DraftPlanQualityFixture;
  qualityReviews: DraftPlanQualityOutput[];
  readinessLevelBreakdown: Record<z.infer<typeof ReadinessLevelSchema>, number>;
  maxReadinessScore: number;
  blockedCount: number;
  needsFootageCount: number;
  improvementActionsCount: number;
  missingFootagePriorityCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function loadDraftPlanQualityFixture(filePath: string): DraftPlanQualityFixture {
  const parsed = JSON.parse(readFileSync(filePath, "utf8"));
  return DraftPlanQualityFixtureSchema.parse(parsed);
}

export function tuneDraftPlanQuality(
  fixture: DraftPlanQualityFixture,
  footageRows: FootageIntakeManifestRow[]
): DraftPlanQualityBatchResult {
  const plannedItems = fixture.planned_content.map(toReviewItem);
  const reviewBatch = reviewScriptDraftPlans(plannedItems, footageRows);
  const usableRows = footageRows.filter((row) => row.usable && row.risk_flags.length === 0);
  const riskyRows = footageRows.filter((row) => !row.usable || row.risk_flags.length > 0);
  const qualityReviews = fixture.planned_content.map((item) => {
    const review = reviewBatch.reviews.find((candidate) => candidate.content_id === item.content_id);
    if (!review) throw new Error(`missing_review_for_${item.content_id}`);
    return buildQualityReview(item, review, usableRows, riskyRows);
  });
  const readinessLevelBreakdown = {
    blocked: 0,
    needs_footage: 0,
    review_required: 0,
    draft_plan_ok: 0
  };
  for (const review of qualityReviews) readinessLevelBreakdown[review.readiness_level] += 1;
  return {
    provider: "fake_content_engine",
    fixture,
    qualityReviews,
    readinessLevelBreakdown,
    maxReadinessScore: Math.max(...qualityReviews.map((review) => review.readiness_score)),
    blockedCount: readinessLevelBreakdown.blocked,
    needsFootageCount: readinessLevelBreakdown.needs_footage,
    improvementActionsCount: qualityReviews.reduce((sum, review) => sum + review.improvement_actions.length, 0),
    missingFootagePriorityCount: qualityReviews.reduce((sum, review) => sum + review.missing_footage_priority.length, 0),
    publicReadyCount: qualityReviews.filter((review) => review.public_ready).length,
    publishTrack: "blocked"
  };
}

function buildQualityReview(
  item: DraftPlanQualityPlannedItem,
  review: {
    selected_footage_ids: string[];
    missing_footage_notes: string[];
    draft_plan_scenes: Array<{ footage_id: string | null }>;
    risk_notes: string[];
  },
  usableRows: FootageIntakeManifestRow[],
  riskyRows: FootageIntakeManifestRow[]
): DraftPlanQualityOutput {
  const product = normalizeToken(item.product_family);
  const requiredVisuals = item.required_visual_types.map(normalizeToken);
  const selectedRows = review.selected_footage_ids
    .map((id) => usableRows.find((row) => row.footage_id === id))
    .filter((row): row is FootageIntakeManifestRow => Boolean(row));
  const selectedVisuals = new Set(selectedRows.map((row) => row.visual_type));
  const missingVisuals = requiredVisuals.filter((visual) => !selectedVisuals.has(visual));
  const riskyRelatedRows = riskyRows.filter((row) => missingVisuals.includes(row.visual_type));
  const verticalSocial = ["instagram", "tiktok", "youtube"].includes(item.target_channel);
  const wrongOrientationRows = selectedRows.filter((row) => verticalSocial && row.orientation !== "vertical");
  const productMatchedRows = selectedRows.filter((row) => row.product_family === product);
  const productCoverageScore = scoreRatio(productMatchedRows.length, requiredVisuals.length, 20);
  const orientationFitScore = wrongOrientationRows.length === 0 ? 15 : Math.max(0, 15 - wrongOrientationRows.length * 7);
  const missingFootageScore = Math.max(0, 15 - missingVisuals.length * 6);
  const riskSafetyScore = Math.max(0, 15 - riskyRelatedRows.length * 6 - review.risk_notes.length * 3);
  const sceneCountScore = review.draft_plan_scenes.length >= 3 ? 10 : Math.max(0, review.draft_plan_scenes.length * 3);
  const ctaClarityScore = hasMockupCta(item.cta, item.closing_line) ? 10 : 2;
  const hookProductMatchScore = hookMatchesProduct(item.hook, product) ? 10 : 4;
  const productRelevanceScore = selectedRows.length > 0 && productMatchedRows.length === selectedRows.length ? 5 : 2;
  const scoreComponents = {
    selected_footage_count: selectedRows.length,
    product_coverage_score: productCoverageScore,
    orientation_fit_score: orientationFitScore,
    missing_footage_score: missingFootageScore,
    risk_safety_score: riskSafetyScore,
    scene_count_score: sceneCountScore,
    cta_clarity_score: ctaClarityScore,
    hook_product_match_score: hookProductMatchScore,
    product_relevance_score: productRelevanceScore
  };
  const readinessScore = Object.entries(scoreComponents)
    .filter(([key]) => key !== "selected_footage_count")
    .reduce((sum, [, value]) => sum + value, 0);
  const missingPriorities = missingVisuals.map((visual) => `${item.content_id}: capture usable ${visual} footage before render planning.`);
  const blockingReasons = [
    ...riskBlockingReasons(riskyRelatedRows),
    ...(selectedRows.length < 2 ? [`${item.content_id}: fewer than 2 safe selected footage rows.`] : []),
    ...(readinessScore < 50 ? [`${item.content_id}: quality score below safe draft planning threshold.`] : [])
  ];
  const readinessLevel = determineReadinessLevel({
    readinessScore,
    blockingReasons,
    missingVisuals,
    selectedRows
  });
  const improvementActions = buildImprovementActions({
    item,
    missingVisuals,
    wrongOrientationRows,
    selectedRows,
    ctaClarityScore,
    hookProductMatchScore,
    readinessLevel
  });

  return DraftPlanQualityOutputSchema.parse({
    content_id: item.content_id,
    readiness_level: readinessLevel,
    readiness_score: readinessScore,
    score_components: scoreComponents,
    blocking_reasons: blockingReasons,
    improvement_actions: improvementActions,
    footage_coverage: {
      required_visual_count: requiredVisuals.length,
      covered_visual_count: requiredVisuals.length - missingVisuals.length,
      selected_footage_count: selectedRows.length,
      coverage_ratio: requiredVisuals.length === 0 ? 0 : Number(((requiredVisuals.length - missingVisuals.length) / requiredVisuals.length).toFixed(2))
    },
    missing_footage_priority: missingPriorities,
    channel_fit_notes: buildChannelFitNotes(item, wrongOrientationRows),
    product_relevance_notes: buildProductRelevanceNotes(item, selectedRows, productMatchedRows),
    hook_strength_notes: buildHookNotes(item, hookProductMatchScore),
    scene_flow_notes: buildSceneFlowNotes(item, review.draft_plan_scenes.length),
    risk_notes: [
      ...review.risk_notes,
      ...riskyRelatedRows.map((row) => `${row.footage_id} has risk flags: ${row.risk_flags.join(", ")}.`)
    ],
    public_ready: false,
    publish_track: "blocked"
  });
}

function toReviewItem(item: DraftPlanQualityPlannedItem): PlannedContentReviewItem {
  return {
    content_id: item.content_id,
    content_goal: item.content_goal,
    product_family: item.product_family,
    target_channel: item.target_channel,
    hook: item.hook,
    required_visual_types: item.required_visual_types,
    preferred_orientation: item.preferred_orientation,
    planned_scene_count: item.planned_scene_count
  };
}

function scoreRatio(value: number, total: number, maxScore: number): number {
  if (total <= 0) return 0;
  return Math.round(Math.min(1, value / total) * maxScore);
}

function hasMockupCta(...parts: string[]): boolean {
  return parts.join(" ").toLowerCase().includes("mockup");
}

function hookMatchesProduct(hook: string, product: string): boolean {
  const normalizedHook = normalizeToken(hook);
  if (product === "sampul_raport") return normalizedHook.includes("raport") || normalizedHook.includes("sampul");
  if (product === "map_ijazah") return normalizedHook.includes("ijazah") || normalizedHook.includes("map");
  return normalizedHook.includes(product);
}

function riskBlockingReasons(rows: FootageIntakeManifestRow[]): string[] {
  return rows
    .filter((row) => row.risk_flags.some((flag) => ["private_contact_visible", "placeholder_smoke", "not_production_ready"].includes(flag)))
    .map((row) => `${row.footage_id}: blocked risk flags ${row.risk_flags.join(", ")}.`);
}

function determineReadinessLevel(input: {
  readinessScore: number;
  blockingReasons: string[];
  missingVisuals: string[];
  selectedRows: FootageIntakeManifestRow[];
}): z.infer<typeof ReadinessLevelSchema> {
  if (input.blockingReasons.length > 0 || input.readinessScore < 50) return "blocked";
  if (input.missingVisuals.length > 0 || input.selectedRows.length < 3) return "needs_footage";
  if (input.readinessScore < 85) return "review_required";
  return "draft_plan_ok";
}

function buildImprovementActions(input: {
  item: DraftPlanQualityPlannedItem;
  missingVisuals: string[];
  wrongOrientationRows: FootageIntakeManifestRow[];
  selectedRows: FootageIntakeManifestRow[];
  ctaClarityScore: number;
  hookProductMatchScore: number;
  readinessLevel: z.infer<typeof ReadinessLevelSchema>;
}): string[] {
  const actions = [
    ...input.missingVisuals.map((visual) => `Capture ${visual} footage for ${input.item.product_family}.`),
    ...input.wrongOrientationRows.map((row) => `Replace ${row.footage_id} with vertical footage for ${input.item.target_channel}.`),
    ...(input.selectedRows.length < 3 ? [`Add more safe product footage before draft render planning for ${input.item.content_id}.`] : []),
    ...(input.ctaClarityScore < 10 ? [`Clarify CTA with keyword MOCKUP for ${input.item.content_id}.`] : []),
    ...(input.hookProductMatchScore < 10 ? [`Rewrite hook so it names ${input.item.product_family} clearly.`] : [])
  ];
  if (input.readinessLevel === "draft_plan_ok") {
    actions.push("Keep as draft-plan candidate only; public readiness remains blocked.");
  }
  return actions;
}

function buildChannelFitNotes(item: DraftPlanQualityPlannedItem, wrongOrientationRows: FootageIntakeManifestRow[]): string[] {
  if (wrongOrientationRows.length === 0) return [`${item.target_channel} orientation fit acceptable for metadata-only draft planning.`];
  return wrongOrientationRows.map((row) => `${row.footage_id} is ${row.orientation}; vertical replacement recommended for ${item.target_channel}.`);
}

function buildProductRelevanceNotes(
  item: DraftPlanQualityPlannedItem,
  selectedRows: FootageIntakeManifestRow[],
  productMatchedRows: FootageIntakeManifestRow[]
): string[] {
  if (selectedRows.length === 0) return [`No safe selected footage supports ${item.product_family}.`];
  if (selectedRows.length === productMatchedRows.length) return [`Selected footage is product-relevant for ${item.product_family}.`];
  return [`Some selected footage is fallback-only and should be replaced with ${item.product_family} footage.`];
}

function buildHookNotes(item: DraftPlanQualityPlannedItem, hookProductMatchScore: number): string[] {
  if (hookProductMatchScore === 10) return [`Hook names or strongly implies ${item.product_family}.`];
  return [`Hook should mention ${item.product_family} more directly before render planning.`];
}

function buildSceneFlowNotes(item: DraftPlanQualityPlannedItem, sceneCount: number): string[] {
  if (sceneCount >= 3) return [`Scene flow has ${sceneCount} metadata-only scenes for hook, proof, and CTA.`];
  return [`Scene flow has only ${sceneCount} scene(s); add proof and closing beats.`];
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}
