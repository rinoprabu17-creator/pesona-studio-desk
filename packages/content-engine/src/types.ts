export const contentEngineAgentIds = [
  "content_calendar",
  "content_angle",
  "script_shot_list",
  "caption_hashtag_cta",
  "footage_metadata",
  "footage_selection",
  "video_draft_plan",
  "video_review_readiness"
] as const;

export const contentEngineChannels = ["facebook", "instagram", "tiktok", "youtube"] as const;

export type ContentEngineAgentId = (typeof contentEngineAgentIds)[number];
export type ContentEngineChannel = (typeof contentEngineChannels)[number];

export type ContentEngineProviderName = "fake" | "openai";

export type ContentEngineRuntimeConfig = {
  provider: ContentEngineProviderName;
  liveEnabled: boolean;
  promptVersion: string;
  openaiModel: string | null;
  openaiSecretAvailable: boolean;
  fallbackReason: string | null;
};

export type ContentEngineAgentRegistration = {
  id: ContentEngineAgentId;
  name: string;
  enabled: boolean;
  promptPath: string;
  mode: "fake_default" | "live_optional";
  description: string;
};

export type ContentEngineSmokeInput = {
  campaign: {
    code: string;
    product: "Sampul Raport" | "Map Ijazah" | "Sampul Ijazah";
    theme: string;
    month: string;
    audience: string[];
    offer: string;
    cta: string;
    channels: ContentEngineChannel[];
  };
  footage: Array<{
    path: string;
    owner_note: string;
    duration_seconds: number;
    orientation: "vertical" | "horizontal" | "square";
  }>;
};

export type ContentCalendarDraftItem = {
  day: number;
  content_pillar: string;
  topic: string;
  hook: string;
  recommended_channels: ContentEngineChannel[];
};

export type ContentAngle = {
  angle: string;
  hook: string;
  emotional_driver: string;
  objection: string;
  proof_point: string;
};

export type ScriptSceneBeat = {
  scene: number;
  seconds: string;
  visual: string;
  overlay_text: string;
  voice_over: string;
};

export type ShotListItem = {
  shot_id: string;
  needed_visual: string;
  shot_type: string;
  estimated_seconds: number;
};

export type CaptionCtaOutput = {
  caption: string;
  hashtags: string[];
  cta: string;
  platform_variants: Record<ContentEngineChannel, string>;
};

export type FootageMetadata = {
  path: string;
  product: string;
  shot_type: string;
  angle: string;
  color: string | null;
  school_level: string | null;
  quality: "usable" | "needs_review" | "fallback_only";
  use_case: string[];
  tags: string[];
};

export type FootageSelection = {
  shot_id: string;
  selected_clip: string | null;
  reason: string;
  fallback_clips: string[];
  missing_footage_note: string | null;
};

export type VideoDraftPlan = {
  title: string;
  format: "vertical_short";
  estimated_duration_seconds: number;
  scenes: Array<{
    scene: number;
    clip_path: string | null;
    overlay_text: string;
    duration_seconds: number;
  }>;
  render_notes: string[];
};

export type VideoReviewReadiness = {
  public_ready: boolean;
  issues: string[];
  suggested_revisions: string[];
  caption_cta_fit: "pass" | "needs_revision";
  product_clarity: "pass" | "needs_revision";
};

export type ContentEngineSmokeResult = {
  provider_name: string;
  model_name: string;
  registry: ContentEngineAgentRegistration[];
  calendar: ContentCalendarDraftItem[];
  angles: ContentAngle[];
  script: {
    estimated_duration_seconds: number;
    scenes: ScriptSceneBeat[];
    shot_list: ShotListItem[];
  };
  caption: CaptionCtaOutput;
  footage_metadata: FootageMetadata[];
  footage_selection: FootageSelection[];
  video_draft_plan: VideoDraftPlan;
  review: VideoReviewReadiness;
};
