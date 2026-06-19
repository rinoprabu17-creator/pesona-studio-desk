export const timezone = "Asia/Jakarta" as const;

export const channels = ["instagram", "facebook", "tiktok", "youtube", "whatsapp_status"] as const;

export const publicationFormats = [
  "reel",
  "short_video",
  "feed_video",
  "feed_image",
  "carousel",
  "status_video",
  "status_image",
  "standard_video"
] as const;

export const defaultChannelFormats: Record<(typeof channels)[number], (typeof publicationFormats)[number]> = {
  instagram: "reel",
  facebook: "reel",
  tiktok: "short_video",
  youtube: "short_video",
  whatsapp_status: "status_video"
};

export const channelFormatMatrix: Record<(typeof channels)[number], readonly (typeof publicationFormats)[number][]> = {
  instagram: ["reel", "feed_video", "feed_image", "carousel"],
  facebook: ["reel", "feed_video", "feed_image", "carousel"],
  tiktok: ["short_video"],
  youtube: ["short_video", "standard_video"],
  whatsapp_status: ["status_video", "status_image"]
};

export const audienceSegments = ["end_user_school", "agent_marketer", "mixed"] as const;

export const contentPillars = [
  "mockup_magnet",
  "desain_gratis",
  "trust_process",
  "pain_point",
  "product_proof",
  "offer",
  "agent",
  "education"
] as const;

export const schoolLevels = ["sd", "smp", "sma", "smk", "mi", "mts", "ma", "other"] as const;

export const defaultPillarDistribution: Record<(typeof contentPillars)[number], number> = {
  mockup_magnet: 7,
  desain_gratis: 5,
  trust_process: 4,
  pain_point: 5,
  product_proof: 3,
  offer: 3,
  agent: 2,
  education: 1
};

export const ctaKeywordPattern = /^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$/;

export const defaultBatchSize = 5;
export const minBatchSize = 1;
export const maxBatchSize = 10;
