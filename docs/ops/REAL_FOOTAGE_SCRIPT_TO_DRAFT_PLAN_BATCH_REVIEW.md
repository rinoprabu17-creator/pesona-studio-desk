# Real Footage Script-To-Draft Plan Batch Review

## Purpose

Phase 2J.3 proves the content engine can convert controlled real-footage metadata into script-to-draft-plan review outputs before any render work.

This is a local-only metadata and plan review smoke. It does not scan real media folders, open media files, run FFmpeg, render video, upload, publish, create publish packages, create evidence logs, mutate manual publish checklists, create closeout, run server commands, or run Docker Compose server commands.

## Scope

Included:

- Structured script-to-draft review model in `packages/content-engine/src/script-draft-review.ts`.
- Controlled planned-content fixture in `packages/content-engine/fixtures/script-draft-review-smoke.json`.
- Reuse of the Phase 2J.2 metadata-only footage fixture.
- Deterministic readiness scoring for planned content items.
- Conservative review output that always keeps `public_ready` false and `publish_track` blocked.
- Smoke script: `npm run ai:script-draft-review:smoke`.

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

Planned-content fixture:

`packages/content-engine/fixtures/script-draft-review-smoke.json`

Footage metadata fixture reused from Phase 2J.2:

`packages/content-engine/fixtures/real-footage-intake-smoke.json`

Both fixtures are metadata-only. The path values inside them are strings and are not scanned or opened.

The planned-content fixture includes three cases:

- Strong Sampul Raport draft plan.
- Map Ijazah draft plan with a partial footage gap.
- Blocked low-readiness draft plan that depends on risky placeholder/privacy footage.

## Review Model

Each review output includes:

- `content_id`.
- `content_goal`.
- `product_family`.
- `target_channel`.
- `hook`.
- `script_outline`.
- `shot_list`.
- `selected_footage_ids`.
- `selection_reasons`.
- `missing_footage_notes`.
- `risk_notes`.
- `draft_plan_scenes`.
- `readiness_score`.
- `public_ready`.
- `publish_track`.

The output is plan-only. It is not a render manifest, publish package, approval record, or public-readiness approval.

## Readiness Rules

The scoring is deterministic and conservative:

- Start from a high draft-readiness score.
- Penalize missing required footage.
- Penalize risky related footage.
- Penalize wrong orientation for vertical social video.
- Penalize insufficient selected footage.
- Penalize insufficient scene count.
- Penalize weak product relevance.

`public_ready` remains false for every Phase 2J.3 smoke output, even when a draft plan has a stronger score. `publish_track` remains blocked.

## Smoke Command

```bash
npm run ai:script-draft-review:smoke
```

Expected behavior:

- Provider: `fake_content_engine`.
- Planned content items: at least `3`.
- Review items produced: at least `3`.
- At least one item includes missing footage notes.
- At least one item is low-readiness or blocked.
- Public-ready count: `0`.
- Publish track: `blocked`.

## Current Result

The smoke currently produces:

- `3` planned content items.
- `3` review items.
- Missing footage notes for the partial/blocked cases.
- At least one low-readiness or blocked item.
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

- This phase reviews fixture metadata and draft-plan structure only.
- It does not prove visual quality, real media readability, OCR/CV, render quality, platform suitability, or public readiness.
- The scoring is intentionally simple and should be expanded only after real footage batch testing.
- All public-ready decisions remain blocked until an owner-approved review and later rendered-output review path exists.

## Recommended Next Phase

`Phase 2J.4 Real Footage Draft Plan Quality Tuning`

Recommended scope:

- Tune script outline, shot list, missing-footage notes, and scene plan quality.
- Keep rendering, upload, publishing, live AI, and public-ready approval disabled by default.
- Continue using metadata-only fixtures unless the owner explicitly approves a real media dry-run.
