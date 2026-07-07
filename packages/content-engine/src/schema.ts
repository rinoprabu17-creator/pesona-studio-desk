import { z } from "zod";
import { contentEngineAgentIds, contentEngineChannels } from "./types.ts";

export const ContentEngineAgentIdSchema = z.enum(contentEngineAgentIds);
export const ContentEngineChannelSchema = z.enum(contentEngineChannels);

export const ContentEngineAgentRegistrationSchema = z.object({
  id: ContentEngineAgentIdSchema,
  name: z.string().min(1),
  enabled: z.boolean(),
  promptPath: z.string().min(1),
  mode: z.enum(["fake_default", "live_optional"]),
  description: z.string().min(1)
}).strict();

export const ContentEngineSmokeInputSchema = z.object({
  campaign: z.object({
    code: z.string().min(1),
    product: z.enum(["Sampul Raport", "Map Ijazah", "Sampul Ijazah"]),
    theme: z.string().min(1),
    month: z.string().regex(/^\d{4}-\d{2}$/),
    audience: z.array(z.string().min(1)).min(1),
    offer: z.string().min(1),
    cta: z.string().min(1),
    channels: z.array(ContentEngineChannelSchema).min(1)
  }).strict(),
  footage: z.array(z.object({
    path: z.string().min(1).refine((value) => !value.startsWith("/") && !value.includes(".."), "Footage path must be relative and safe."),
    owner_note: z.string().min(1),
    duration_seconds: z.number().int().positive(),
    orientation: z.enum(["vertical", "horizontal", "square"])
  }).strict()).min(1)
}).strict();

export const ContentCalendarDraftItemSchema = z.object({
  day: z.number().int().min(1).max(30),
  content_pillar: z.string().min(1),
  topic: z.string().min(1),
  hook: z.string().min(1),
  recommended_channels: z.array(ContentEngineChannelSchema).min(1)
}).strict();

export const ContentAngleSchema = z.object({
  angle: z.string().min(1),
  hook: z.string().min(1),
  emotional_driver: z.string().min(1),
  objection: z.string().min(1),
  proof_point: z.string().min(1)
}).strict();

export const ScriptSceneBeatSchema = z.object({
  scene: z.number().int().positive(),
  seconds: z.string().min(1),
  visual: z.string().min(1),
  overlay_text: z.string().min(1),
  voice_over: z.string().min(1)
}).strict();

export const ShotListItemSchema = z.object({
  shot_id: z.string().min(1),
  needed_visual: z.string().min(1),
  shot_type: z.string().min(1),
  estimated_seconds: z.number().int().positive()
}).strict();

export const CaptionCtaOutputSchema = z.object({
  caption: z.string().min(1),
  hashtags: z.array(z.string().regex(/^#[A-Za-z0-9_]+$/)).min(1),
  cta: z.string().min(1),
  platform_variants: z.record(ContentEngineChannelSchema, z.string().min(1))
}).strict();

export const FootageMetadataSchema = z.object({
  path: z.string().min(1),
  product: z.string().min(1),
  shot_type: z.string().min(1),
  angle: z.string().min(1),
  color: z.string().nullable(),
  school_level: z.string().nullable(),
  quality: z.enum(["usable", "needs_review", "fallback_only"]),
  use_case: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)).min(1)
}).strict();

export const FootageSelectionSchema = z.object({
  shot_id: z.string().min(1),
  selected_clip: z.string().min(1).nullable(),
  reason: z.string().min(1),
  fallback_clips: z.array(z.string().min(1)),
  missing_footage_note: z.string().min(1).nullable()
}).strict();

export const VideoDraftPlanSchema = z.object({
  title: z.string().min(1),
  format: z.literal("vertical_short"),
  estimated_duration_seconds: z.number().int().positive(),
  scenes: z.array(z.object({
    scene: z.number().int().positive(),
    clip_path: z.string().min(1).nullable(),
    overlay_text: z.string().min(1),
    duration_seconds: z.number().int().positive()
  }).strict()).min(1),
  render_notes: z.array(z.string().min(1)).min(1)
}).strict();

export const VideoReviewReadinessSchema = z.object({
  public_ready: z.boolean(),
  issues: z.array(z.string().min(1)),
  suggested_revisions: z.array(z.string().min(1)),
  caption_cta_fit: z.enum(["pass", "needs_revision"]),
  product_clarity: z.enum(["pass", "needs_revision"])
}).strict();

export const ContentEngineSmokeResultSchema = z.object({
  provider_name: z.string().min(1),
  model_name: z.string().min(1),
  registry: z.array(ContentEngineAgentRegistrationSchema).length(8),
  calendar: z.array(ContentCalendarDraftItemSchema).min(7),
  angles: z.array(ContentAngleSchema).min(3),
  script: z.object({
    estimated_duration_seconds: z.number().int().positive(),
    scenes: z.array(ScriptSceneBeatSchema).min(3),
    shot_list: z.array(ShotListItemSchema).min(3)
  }).strict(),
  caption: CaptionCtaOutputSchema,
  footage_metadata: z.array(FootageMetadataSchema).min(1),
  footage_selection: z.array(FootageSelectionSchema).min(1),
  video_draft_plan: VideoDraftPlanSchema,
  review: VideoReviewReadinessSchema
}).strict();
