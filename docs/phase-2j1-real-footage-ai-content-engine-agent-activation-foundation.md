# Phase 2J.1 Real Footage AI Content Engine Agent Activation Foundation

## Summary

Phase 2J.1 starts the real-footage AI content engine foundation.

The publishing track is parked because the current approved pilot MP4 is only a 4-second placeholder/rainbow/color-line technical smoke output, not a production-ready video. Posting is now last priority. The current priority is proving the content engine can create calendar drafts, ideas, captions, hashtags, CTAs, scripts, shot lists, footage metadata, footage selection, draft plans, and public-readiness review from real footage context.

## Files Added

- `packages/content-engine/src/types.ts`.
- `packages/content-engine/src/schema.ts`.
- `packages/content-engine/src/registry.ts`.
- `packages/content-engine/src/config.ts`.
- `packages/content-engine/src/provider.ts`.
- `packages/content-engine/src/fake-provider.ts`.
- `packages/content-engine/src/index.ts`.
- `configs/ai-content-agents.json`.
- `scripts/ai-content-engine-smoke.mjs`.
- `prompts/agents/content-calendar-agent.md`.
- `prompts/agents/content-angle-agent.md`.
- `prompts/agents/script-shot-list-agent.md`.
- `prompts/agents/caption-hashtag-cta-agent.md`.
- `prompts/agents/footage-metadata-agent.md`.
- `prompts/agents/footage-selection-agent.md`.
- `prompts/agents/video-draft-plan-agent.md`.
- `prompts/agents/video-review-readiness-agent.md`.
- `docs/ops/REAL_FOOTAGE_AI_CONTENT_ENGINE_AGENT_ACTIVATION.md`.
- `docs/phase-2j1-real-footage-ai-content-engine-agent-activation-foundation.md`.

## Files Updated

- `package.json`.
- `README.md`.
- `README.local.md`.
- `docs/ops/HANDOFF_PACK_INDEX.md`.
- `docs/ops/PENDING_FEATURES_REGISTER.md`.

## Agents Activated

1. Content Calendar Agent.
2. Content Idea / Angle Agent.
3. Script + Shot List Agent.
4. Caption / Hashtag / CTA Agent.
5. Footage Metadata Agent.
6. Footage Selection Agent.
7. Video Draft Plan Agent.
8. Video Review / Public Readiness Agent.

## Runtime Safety

- Default provider is fake/offline.
- `npm run ai:content-engine:smoke` does not require live API.
- Live OpenAI mode requires explicit env and secret handling.
- If OpenAI is requested without complete live env, config falls back to fake provider.
- Smoke uses sample relative footage paths only.
- No media file is read, copied, uploaded, rendered, or mutated.
- No scheduler, publisher, social API, upload automation, or OpenAI live runtime is enabled by default.

## Non-Goals

This phase does not publish, upload, create evidence logs, update manual publish checklist items, mark `manual_post_created`, mark `manual_url_recorded`, create closeout, cut over, run server commands, run Docker Compose up/down on server, run production backup, run restore or restore dry-run, perform storage copy, render video, commit storage media, or commit generated runtime artifacts.

## Validation

Expected validation:

- `git diff --check`.
- `npm run check`.
- `npm run ai:content-engine:smoke`.
- `git diff --name-only | grep "workers/video" || true`.
- `git status --short --ignored`.

## Next Phase

Recommended next phase:

`Phase 2J.2 Real Footage Intake & Metadata Batch Smoke`

The next phase should feed many real footage paths and owner-provided metadata through the metadata and selection agents while keeping publishing frozen and live AI off by default.
