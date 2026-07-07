# Real Footage AI Content Engine Agent Activation Foundation

## Purpose

Phase 2J.1 starts the real-footage AI content engine foundation after the publishing track was parked.

The previous approved pilot MP4 is only a 4-second technical placeholder/rainbow/color-line smoke output. It is not production-ready and must not be treated as a publishable video. Posting is now deferred. The priority is proving that Pesona Studio Desk can generate content plans, captions, scripts, footage metadata, footage selection, draft plans, and public-readiness review from many real footage files.

## Scope

This phase activates/registers the content-engine agent foundation only.

It does not publish, upload, create evidence logs, update manual publish checklist items, mark `manual_post_created`, mark `manual_url_recorded`, create closeout, enable scheduler/publisher/social API, enable OpenAI live runtime by default, run server commands, run Docker Compose up/down on server, run backup/restore/cutover, render video, or commit storage media.

## Registered Agents

The registry is recorded in `configs/ai-content-agents.json` and mirrored by `packages/content-engine/src/registry.ts`.

Registered agents:

1. Content Calendar Agent.
2. Content Idea / Angle Agent.
3. Script + Shot List Agent.
4. Caption / Hashtag / CTA Agent.
5. Footage Metadata Agent.
6. Footage Selection Agent.
7. Video Draft Plan Agent.
8. Video Review / Public Readiness Agent.

Prompt templates are under `prompts/agents/`.

## Implementation Notes

- New module: `packages/content-engine`.
- Default provider: fake/offline.
- Smoke script: `npm run ai:content-engine:smoke`.
- Smoke fixture uses Pesona product context:
  - Product: Sampul Raport.
  - Offer: Desain Gratis after cocok penawaran.
  - Audience: SD/SMP/SMA/MI/MTs/MA.
  - CTA: `MOCKUP`.
  - Channels: Facebook, Instagram, TikTok, YouTube.
- Fake output includes calendar draft, content angles, script, shot list, caption, hashtags, CTA, metadata tags, footage selection, EDL-style draft plan, and public-readiness review.
- Smoke paths are sample relative paths only. The script does not read, copy, upload, render, or mutate files.

## Live AI Safety

No live provider is required by default.

Default local smoke uses fake provider. OpenAI/live AI must be explicitly enabled later with:

```text
AI_PROVIDER=openai
AI_LIVE_ENABLED=true
OPENAI_MODEL=<approved-model>
OPENAI_API_KEY_FILE=<path-to-secret-file>
```

or:

```text
OPENAI_API_KEY=<secret>
```

Secrets must stay outside git. Do not commit env files, API keys, tokens, cookies, sessions, credentials, or logs containing secrets. If OpenAI is requested without complete live env, the content-engine config falls back to fake provider.

## Public Caption Safety

The Caption / Hashtag / CTA Agent must avoid internal/pilot wording, including:

- `pilot smoke`.
- `belum upload`.
- `tidak untuk produksi`.
- Evidence log language.
- Manual checklist status language.
- Closeout/cutover language.

## Publish Track Freeze

Publishing/posting is frozen for now.

Blocked:

- Actual publish.
- Upload to Facebook/Instagram/TikTok/YouTube.
- Manual publish evidence log creation.
- Manual publish checklist mutation.
- `manual_post_created`.
- `manual_url_recorded`.
- Closeout.
- Scheduler/publisher/social API activation.
- Public exposure.
- Cutover.

## Validation Target

Phase 2J.1 validation should confirm:

- Agent registry contains all 8 required agents.
- Fake provider smoke returns realistic structured output.
- Output remains offline and does not require live API.
- No storage media or rendered video is generated.
- No server command is run.
- No publishing path is touched.

## Recommended Next Phase

`Phase 2J.2 Real Footage Intake & Metadata Batch Smoke`

Recommended scope:

- Feed many real footage file paths and owner notes into metadata-only smoke.
- Validate structured tags and quality/use-case labels.
- Confirm placeholder/smoke MP4 is rejected for production use.
- Keep publish track frozen.
- Keep live AI optional and off by default.
