# Phase 2J.4 Real Footage Draft Plan Quality Tuning

## Summary

Phase 2J.4 improves the metadata-only draft plan quality layer so planned videos can be scored before any render work.

The phase remains metadata/plan-only. It does not scan real media folders, open media files, run FFmpeg, render video, upload, publish, create publish packages, create evidence logs, mutate checklists, create closeout, run server commands, run Docker Compose server commands, or touch storage media.

## Baseline

- Baseline commit: `3e9cce9`.
- Baseline tag: `phase-2j3-complete`.
- Phase 2J.3 already provided the metadata-only script-to-draft-plan batch review.
- Phase 2J.4 builds on that foundation without push, deploy, merge, tag, server command, Docker Compose server command, real media scan, storage mutation, rendering, upload, publishing, evidence log mutation, checklist mutation, closeout, backup/restore, cutover, env/secret/credential change, migration, `scripts/prepare-test-db.mjs` change, or `workers/video` change.

## Files Added

- `packages/content-engine/src/draft-plan-quality.ts`.
- `packages/content-engine/fixtures/draft-plan-quality-tuning-smoke.json`.
- `scripts/draft-plan-quality-tuning-smoke.mjs`.
- `docs/ops/REAL_FOOTAGE_DRAFT_PLAN_QUALITY_TUNING.md`.
- `docs/phase-2j4-real-footage-draft-plan-quality-tuning.md`.

## Files Updated

- `packages/content-engine/src/index.ts`.
- `package.json`.
- `README.md`.
- `README.local.md`.
- `docs/ops/HANDOFF_PACK_INDEX.md`.
- `docs/ops/PENDING_FEATURES_REGISTER.md`.

## Draft Plan Quality Model Result

The model produces one quality review per planned content item with:

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

`readiness_level` can be `draft_plan_ok`, but that only means metadata-only draft planning is structurally usable. It does not approve public readiness.

## Quality Fixture Result

The fixture includes four planned content cases:

- Strong Sampul Raport vertical plan.
- Medium Sampul Raport plan that needs additional close-up footage.
- Map Ijazah plan with partial footage gap.
- Blocked plan due to risky/privacy/placeholder or insufficient footage.

The fixture uses metadata-only rows from:

- `packages/content-engine/fixtures/draft-plan-quality-tuning-smoke.json`.
- `packages/content-engine/fixtures/real-footage-intake-smoke.json`.

The fixture path strings are not scanned or opened.

## Scoring / Readiness Result

The scoring covers:

- Minimum selected footage count.
- Required product footage coverage.
- Hook/product match.
- Vertical orientation fit for short-form channels.
- Missing footage severity.
- Risky/privacy/placeholder flags.
- Scene count sufficiency.
- CTA or closing clarity.
- Product family relevance.

Expected smoke readiness mix:

- At least one `draft_plan_ok` or high-score item.
- At least one `needs_footage` item.
- At least one `blocked` item.
- Public-ready count remains `0`.
- Publish track remains `blocked`.

## Smoke Command

```bash
npm run ai:draft-plan-quality:smoke
```

Expected output includes:

- Provider.
- Fixture path.
- Planned content item count.
- Quality review item count.
- Readiness level breakdown.
- Max readiness score.
- Blocked count.
- Needs footage count.
- Improvement actions count.
- Missing footage priority count.
- Public-ready count.
- Publish track result.

## Validation Checklist

Run before finalization:

- `git status --short`.
- `git diff --name-only`.
- `git ls-files --others --exclude-standard`.
- `git diff --check`.
- `npm run check`.
- `npm run ai:content-engine:smoke`.
- `npm run ai:real-footage-intake:smoke`.
- `npm run ai:script-draft-review:smoke`.
- `npm run ai:draft-plan-quality:smoke`.
- `git diff --name-only | grep "workers/video" || true`.
- Forbidden path scan for env/secrets/credentials, migrations, `scripts/prepare-test-db.mjs`, storage media mutation, evidence/checklist closeout mutation, publishing/upload/render outputs, server/Docker Compose changes, FFmpeg/render command usage, accidental public-ready approval, and `workers/video`.

## Safety / Forbidden Path Result

Expected safety result:

- No `workers/video` change.
- No migration change.
- No `scripts/prepare-test-db.mjs` change.
- No env, secret, credential, API key, token, cookie, session, or generated runtime artifact.
- No storage media, rendered video, backup, dump, archive, checksum, route evidence, or production data artifact.
- No server command or Docker Compose server command.
- No evidence log, checklist, closeout, publishing, upload, backup/restore, or cutover mutation.
- No real media scan.
- No FFmpeg execution.
- No public-ready approval.

## Non-Goals

This phase does not:

- Publish.
- Upload.
- Render video.
- Run FFmpeg.
- Mutate real storage media.
- Scan real footage folders.
- Create publish packages.
- Create evidence logs.
- Update manual publish checklist items.
- Create closeout.
- Enable scheduler/publisher/social API.
- Require OpenAI/live AI.
- Run server commands.
- Run Docker Compose server commands.
- Run backup, restore, or cutover.
- Add migrations.
- Change `scripts/prepare-test-db.mjs`.
- Change `workers/video`.
- Commit env, secrets, credentials, backup artifacts, rendered videos, or generated runtime artifacts.

## Risks / Follow-Up

- This phase validates fixture metadata and deterministic scoring only.
- It does not prove real media readability, visual quality, OCR/CV, render quality, or platform public readiness.
- Owner review is still needed before real footage batch expansion or render planning.
- Public-ready review from actual rendered output remains deferred.

## Recommended Next Phase

`Phase 2J.5 Real Footage Batch Metadata Expansion`

The next phase should expand safe metadata-only fixture coverage across more products, channels, missing footage cases, and risk cases while keeping rendering, upload, publishing, and live AI disabled by default.
