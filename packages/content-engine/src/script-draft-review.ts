import { readFileSync } from "node:fs";
import { z } from "zod";
import type { FootageIntakeManifestRow } from "./intake.ts";

export const PlannedContentReviewItemSchema = z.object({
  content_id: z.string().min(1),
  content_goal: z.string().min(1),
  product_family: z.string().min(1),
  target_channel: z.enum(["facebook", "instagram", "tiktok", "youtube"]),
  hook: z.string().min(1),
  required_visual_types: z.array(z.string().min(1)).min(1),
  preferred_orientation: z.enum(["vertical", "horizontal", "square"]),
  planned_scene_count: z.number().int().positive()
}).strict();

export const ScriptDraftReviewFixtureSchema = z.object({
  fixture_version: z.literal("script-draft-review-smoke-v1"),
  source: z.string().min(1),
  mode: z.literal("metadata_only_fixture"),
  planned_content: z.array(PlannedContentReviewItemSchema).min(3)
}).strict();

export const ScriptDraftReviewOutputSchema = z.object({
  content_id: z.string().min(1),
  content_goal: z.string().min(1),
  product_family: z.string().min(1),
  target_channel: z.enum(["facebook", "instagram", "tiktok", "youtube"]),
  hook: z.string().min(1),
  script_outline: z.array(z.string().min(1)).min(1),
  shot_list: z.array(z.string().min(1)).min(1),
  selected_footage_ids: z.array(z.string().min(1)),
  selection_reasons: z.array(z.string().min(1)),
  missing_footage_notes: z.array(z.string().min(1)),
  risk_notes: z.array(z.string().min(1)),
  draft_plan_scenes: z.array(z.object({
    scene: z.number().int().positive(),
    purpose: z.string().min(1),
    footage_id: z.string().min(1).nullable(),
    overlay_text: z.string().min(1)
  }).strict()).min(1),
  readiness_score: z.number().int().min(0).max(100),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type PlannedContentReviewItem = z.infer<typeof PlannedContentReviewItemSchema>;
export type ScriptDraftReviewFixture = z.infer<typeof ScriptDraftReviewFixtureSchema>;
export type ScriptDraftReviewOutput = z.infer<typeof ScriptDraftReviewOutputSchema>;

export type ScriptDraftReviewBatchResult = {
  provider: "fake_content_engine";
  fixture: ScriptDraftReviewFixture;
  reviews: ScriptDraftReviewOutput[];
  selectedFootageCount: number;
  missingFootageNotesCount: number;
  blockedLowReadinessCount: number;
  maxReadinessScore: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function loadScriptDraftReviewFixture(filePath: string): ScriptDraftReviewFixture {
  const parsed = JSON.parse(readFileSync(filePath, "utf8"));
  return ScriptDraftReviewFixtureSchema.parse(parsed);
}

export function reviewScriptDraftPlans(
  plannedContent: PlannedContentReviewItem[],
  footageRows: FootageIntakeManifestRow[]
): ScriptDraftReviewBatchResult {
  const usableRows = footageRows.filter((row) => row.usable && row.risk_flags.length === 0);
  const riskyRows = footageRows.filter((row) => !row.usable || row.risk_flags.length > 0);
  const reviews = plannedContent.map((item) => reviewOneItem(item, usableRows, riskyRows));
  return {
    provider: "fake_content_engine",
    fixture: ScriptDraftReviewFixtureSchema.parse({
      fixture_version: "script-draft-review-smoke-v1",
      source: "computed batch result",
      mode: "metadata_only_fixture",
      planned_content: plannedContent
    }),
    reviews,
    selectedFootageCount: new Set(reviews.flatMap((review) => review.selected_footage_ids)).size,
    missingFootageNotesCount: reviews.reduce((sum, review) => sum + review.missing_footage_notes.length, 0),
    blockedLowReadinessCount: reviews.filter((review) => review.readiness_score < 70 || review.risk_notes.length > 0).length,
    maxReadinessScore: Math.max(...reviews.map((review) => review.readiness_score)),
    publicReadyCount: reviews.filter((review) => review.public_ready).length,
    publishTrack: "blocked"
  };
}

function reviewOneItem(
  item: PlannedContentReviewItem,
  usableRows: FootageIntakeManifestRow[],
  riskyRows: FootageIntakeManifestRow[]
): ScriptDraftReviewOutput {
  const requiredVisuals = item.required_visual_types.map(normalizeToken);
  const product = normalizeToken(item.product_family);
  const selectedRows = selectRows(item, usableRows, requiredVisuals, product);
  const selectedVisualTypes = new Set(selectedRows.map((row) => row.visual_type));
  const missing = requiredVisuals.filter((visual) => !selectedVisualTypes.has(visual));
  const wrongOrientation = selectedRows.filter((row) => row.orientation !== item.preferred_orientation);
  const riskyRelatedRows = riskyRows.filter((row) => missing.includes(row.visual_type));
  const scenes = buildDraftPlanScenes(item, requiredVisuals, selectedRows);
  const riskNotes = [
    ...wrongOrientation.map((row) => `${row.footage_id} orientation ${row.orientation} does not match preferred ${item.preferred_orientation}.`),
    ...riskyRelatedRows.slice(0, 3).map((row) => `${row.footage_id} blocked by risk flags: ${row.risk_flags.join(", ")}.`)
  ];
  const missingNotes = missing.map((visual) => `Missing usable ${visual} footage for ${item.content_id}.`);
  const readinessScore = scoreReadiness({
    item,
    selectedRows,
    missingCount: missing.length,
    wrongOrientationCount: wrongOrientation.length,
    riskyRelatedCount: riskyRelatedRows.length,
    sceneCount: scenes.length,
    weakProductRelevance: selectedRows.some((row) => row.product_family !== product)
  });

  return ScriptDraftReviewOutputSchema.parse({
    content_id: item.content_id,
    content_goal: item.content_goal,
    product_family: item.product_family,
    target_channel: item.target_channel,
    hook: item.hook,
    script_outline: [
      `Open with hook: ${item.hook}`,
      `Show ${item.product_family} proof using selected footage.`,
      "Close with MOCKUP CTA while keeping publish track blocked."
    ],
    shot_list: requiredVisuals.map((visual) => `Need ${visual} shot for ${item.content_id}`),
    selected_footage_ids: selectedRows.map((row) => row.footage_id),
    selection_reasons: selectedRows.map((row) => `${row.footage_id} selected for ${row.visual_type} and ${row.product_family}.`),
    missing_footage_notes: missingNotes,
    risk_notes: riskNotes,
    draft_plan_scenes: scenes,
    readiness_score: readinessScore,
    public_ready: false,
    publish_track: "blocked"
  });
}

function selectRows(
  item: PlannedContentReviewItem,
  rows: FootageIntakeManifestRow[],
  requiredVisuals: string[],
  product: string
): FootageIntakeManifestRow[] {
  const selected: FootageIntakeManifestRow[] = [];
  for (const visual of requiredVisuals) {
    const exact = rows.find((row) => row.product_family === product && row.visual_type === visual && !selected.includes(row));
    if (exact) selected.push(exact);
  }
  return selected;
}

function buildDraftPlanScenes(
  item: PlannedContentReviewItem,
  requiredVisuals: string[],
  selectedRows: FootageIntakeManifestRow[]
): ScriptDraftReviewOutput["draft_plan_scenes"] {
  const count = Math.max(item.planned_scene_count, requiredVisuals.length);
  return Array.from({ length: count }, (_, index) => {
    const visual = requiredVisuals[index] || requiredVisuals[requiredVisuals.length - 1];
    const row = selectedRows.find((candidate) => candidate.visual_type === visual) || selectedRows[index] || null;
    return {
      scene: index + 1,
      purpose: visual ? `Show ${visual}` : "Support product proof",
      footage_id: row?.footage_id || null,
      overlay_text: index === 0 ? item.hook : "Ketik MOCKUP untuk minta arahan mockup awal"
    };
  });
}

function scoreReadiness(input: {
  item: PlannedContentReviewItem;
  selectedRows: FootageIntakeManifestRow[];
  missingCount: number;
  wrongOrientationCount: number;
  riskyRelatedCount: number;
  sceneCount: number;
  weakProductRelevance: boolean;
}): number {
  let score = 90;
  score -= input.missingCount * 18;
  score -= input.wrongOrientationCount * 10;
  score -= input.riskyRelatedCount * 8;
  if (input.sceneCount < 3) score -= 16;
  if (input.selectedRows.length < 2) score -= 20;
  if (input.weakProductRelevance) score -= 12;
  return Math.max(0, Math.min(95, score));
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}
