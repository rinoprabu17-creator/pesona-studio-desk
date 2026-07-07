import { ContentEngineAgentRegistrationSchema } from "./schema.ts";
import type { ContentEngineAgentRegistration } from "./types.ts";

export const contentEnginePromptVersion = "content-engine-v1";

export const contentEngineAgentRegistry: ContentEngineAgentRegistration[] = [
  {
    id: "content_calendar",
    name: "Content Calendar Agent",
    enabled: true,
    promptPath: "prompts/agents/content-calendar-agent.md",
    mode: "fake_default",
    description: "Drafts 7/14/30-day content calendars with pillars, topics, hooks, and channel recommendations."
  },
  {
    id: "content_angle",
    name: "Content Idea / Angle Agent",
    enabled: true,
    promptPath: "prompts/agents/content-angle-agent.md",
    mode: "fake_default",
    description: "Creates content angles, hooks, emotional drivers, objections, and proof points."
  },
  {
    id: "script_shot_list",
    name: "Script + Shot List Agent",
    enabled: true,
    promptPath: "prompts/agents/script-shot-list-agent.md",
    mode: "fake_default",
    description: "Turns a selected angle and footage metadata into script beats, overlay text, and shot list."
  },
  {
    id: "caption_hashtag_cta",
    name: "Caption / Hashtag / CTA Agent",
    enabled: true,
    promptPath: "prompts/agents/caption-hashtag-cta-agent.md",
    mode: "fake_default",
    description: "Creates public-facing captions, hashtags, CTAs, and platform variants without pilot/internal wording."
  },
  {
    id: "footage_metadata",
    name: "Footage Metadata Agent",
    enabled: true,
    promptPath: "prompts/agents/footage-metadata-agent.md",
    mode: "fake_default",
    description: "Normalizes owner-provided footage notes into product, shot type, angle, color, school level, quality, and use-case tags."
  },
  {
    id: "footage_selection",
    name: "Footage Selection Agent",
    enabled: true,
    promptPath: "prompts/agents/footage-selection-agent.md",
    mode: "fake_default",
    description: "Matches shot list needs to footage metadata and records selected clips, fallbacks, and missing footage notes."
  },
  {
    id: "video_draft_plan",
    name: "Video Draft Plan Agent",
    enabled: true,
    promptPath: "prompts/agents/video-draft-plan-agent.md",
    mode: "fake_default",
    description: "Builds an EDL-style render plan proposal for future render workers without rendering."
  },
  {
    id: "video_review_readiness",
    name: "Video Review / Public Readiness Agent",
    enabled: true,
    promptPath: "prompts/agents/video-review-readiness-agent.md",
    mode: "fake_default",
    description: "Reviews the draft plan for public readiness, issues, revisions, caption fit, and product clarity."
  }
].map((agent) => ContentEngineAgentRegistrationSchema.parse(agent));

export function listEnabledContentEngineAgents(): ContentEngineAgentRegistration[] {
  return contentEngineAgentRegistry.filter((agent) => agent.enabled);
}
