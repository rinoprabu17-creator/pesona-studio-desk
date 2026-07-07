# Real Footage Draft Plan Quality Tuning

## Purpose

Phase 2J.4 improves the metadata-only draft plan quality layer so planned videos can be judged before any render work.

This phase is local-only and plan-only. It does not scan real media folders, open media files, run FFmpeg, render video, upload, publish, create publish packages, create evidence logs, mutate manual publish checklists, create closeout, run server commands, or run Docker Compose server commands.

## Scope

Included:

- Draft plan quality model in `packages/content-engine/src/draft-plan-quality.ts`.
- Controlled quality tuning fixture in `packages/content-engine/fixtures/draft-plan-quality-tuning-smoke.json`.
- Reuse of Phase 2J.2 metadata-only footage fixture.
- Reuse of Phase 2J.3 script-to-draft-plan review output.
- Deterministic readiness scoring and readiness levels:
  - `blocked`.
  - `needs_footage`.
  - `review_required`.
  - `draft_plan_ok`.
- Smoke script: `npm run ai:draft-plan-quality:smoke`.

Excluded:

- Real media scanning.
- Media read/copy/move/rename/delete.
- FFmpeg execution.
- Render execution.
- Upload.
- Publishing.
- Publish package creation.
- Evidence log creation.
- Manual publish checklist mutation.
- Closeout.
- Scheduler/publisher/social API activation.
- OpenAI live runtime requirement.
- Server or Docker Compose command.
- `workers/video` changes.

## Fixtures

Quality fixture:

`packages/content-engine/fixtures/draft-plan-quality-tuning-smoke.json`

Footage metadata fixture reused from Phase 2J.2:

`packages/content-engine/fixtures/real-footage-intake-smoke.json`

Both fixtures are metadata-only. The path values inside them are strings and are not scanned or opened.

The quality fixture includes:

- Strong Sampul Raport vertical plan.
- Medium Sampul Raport plan that needs additional close-up footage.
- Map Ijazah plan with partial footage gap.
- Blocked plan due to risky/privacy/placeholder or insufficient footage.

## Quality Output

Each quality output includes:

- `content_id`.
- `readiness_level`.
- `readiness_score`.
- `score_components`.
- `blocking_reasons`.
- `improvement_actions`.
- `footage_coverage`.
- `missing_footage_priority`.
- `channel_fit_notes`.
- `product_relevance_notes`.
- `hook_strength_notes`.
- `scene_flow_notes`.
- `risk_notes`.
- `public_ready`.
- `publish_track`.

`draft_plan_ok` means the metadata-only draft plan is structurally usable for future planning review. It does not mean public-ready, approved, rendered, published, or safe for cutover.

## Scoring Rules

The scoring is deterministic and conservative. It scores:

- Minimum selected footage count.
- Required product footage coverage.
- Hook/product match.
- Vertical orientation fit for TikTok, Instagram Reels, and YouTube Shorts style plans.
- Missing footage severity.
- Risky/privacy/placeholder flags for required missing visuals.
- Scene count sufficiency.
- CTA or closing clarity.
- Product family relevance.

Every Phase 2J.4 output keeps `public_ready` false and `publish_track` blocked.

## Smoke Command

```bash
npm run ai:draft-plan-quality:smoke
```

Expected behavior:

- Provider: `fake_content_engine`.
- Planned content items: at least `4`.
- Quality review items: at least `4`.
- At least one `draft_plan_ok` or high-score plan.
- At least one `needs_footage` plan.
- At least one `blocked` plan.
- Improvement actions count at least `3`.
- Missing footage priority count at least `1`.
- Public-ready count: `0`.
- Publish track: `blocked`.

## Current Result

The smoke currently produces:

- `4` planned content items.
- `4` quality review items.
- Readiness breakdown:
  - `draft_plan_ok = 1`.
  - `needs_footage = 2`.
  - `blocked = 1`.
- Improvement actions are generated.
- Missing footage priorities are generated.
- `public_ready` count: `0`.
- `publish_track: blocked`.

## Safety Rules

- Fake provider remains default.
- Live OpenAI is not required.
- No rendered video is created.
- No FFmpeg command is executed.
- No storage media is scanned or mutated.
- No server command is run.
- No Docker Compose server command is run.
- No evidence log, checklist, closeout, publishing, upload, backup, restore, cutover, migration, env, secret, credential, or `scripts/prepare-test-db.mjs` change is part of this phase.

## Known Limitations

- This phase validates fixture metadata and draft-plan quality scoring only.
- It does not prove real media readability, visual quality, OCR/CV, render quality, platform suitability, or public readiness.
- Readiness scoring is deterministic and useful for smoke review, but it still needs owner review against real footage batches.
- Public-ready review from rendered output remains deferred.

## Recommended Next Phase

`Phase 2J.5 Real Footage Batch Metadata Expansion`

Recommended scope:

- Expand safe metadata-only fixture coverage before any render work.
- Add more product families, channel cases, missing footage cases, and risk cases.
- Keep rendering, upload, publishing, live AI, and public-ready approval disabled by default.
