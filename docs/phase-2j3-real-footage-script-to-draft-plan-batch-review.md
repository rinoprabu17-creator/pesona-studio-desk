# Phase 2J.3 Real Footage Script-To-Draft Plan Batch Review

## Summary

Phase 2J.3 adds a safe local-only batch review layer that converts controlled real-footage metadata and planned content items into structured script-to-draft-plan review outputs.

The phase remains metadata/plan-only. It does not scan real media folders, open media files, run FFmpeg, render video, upload, publish, create publish packages, create evidence logs, mutate checklists, create closeout, run server commands, run Docker Compose server commands, or touch storage media.

## Baseline

- Baseline commit: `03be29e`.
- Baseline tag: `phase-2j2-complete`.
- Phase 2J.2 already provided the metadata-only footage intake fixture and fake-default content-engine pipeline.
- Phase 2J.3 builds on that foundation without push, deploy, merge, tag, server command, Docker Compose server command, real media scan, storage mutation, rendering, upload, publishing, evidence log mutation, checklist mutation, closeout, backup/restore, cutover, env/secret/credential change, migration, `scripts/prepare-test-db.mjs` change, or `workers/video` change.

## Files Added

- `packages/content-engine/src/script-draft-review.ts`.
- `packages/content-engine/fixtures/script-draft-review-smoke.json`.
- `scripts/script-to-draft-plan-review-smoke.mjs`.
- `docs/ops/REAL_FOOTAGE_SCRIPT_TO_DRAFT_PLAN_BATCH_REVIEW.md`.
- `docs/phase-2j3-real-footage-script-to-draft-plan-batch-review.md`.

## Files Updated

- `packages/content-engine/src/index.ts`.
- `package.json`.
- `README.md`.
- `README.local.md`.
- `docs/ops/HANDOFF_PACK_INDEX.md`.
- `docs/ops/PENDING_FEATURES_REGISTER.md`.

## Script-To-Draft Review Model Result

The review model produces one structured review per planned content item with:

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

The model is deterministic, fake-provider compatible, and conservative. It scores draft readiness only. It does not approve public publishing.

## Fixture / Batch Result

The fixture includes three planned content items:

- Strong Sampul Raport draft plan.
- Map Ijazah draft plan with partial footage gap.
- Blocked low-readiness draft plan with risky placeholder/privacy footage dependency.

The review uses metadata-only rows from:

- `packages/content-engine/fixtures/script-draft-review-smoke.json`.
- `packages/content-engine/fixtures/real-footage-intake-smoke.json`.

The fixture path strings are not scanned or opened.

## Review Output Result

Expected review behavior:

- At least `3` planned content items.
- At least `3` review outputs.
- At least one item includes missing footage notes.
- At least one item is low-readiness or blocked.
- `public_ready` count remains `0`.
- `publish_track` remains `blocked`.

## Smoke Command

```bash
npm run ai:script-draft-review:smoke
```

Expected output includes:

- Provider.
- Source fixture path.
- Planned content item count.
- Review item count.
- Selected footage count.
- Missing footage notes count.
- Blocked/low-readiness count.
- Max readiness score.
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
- `git diff --name-only | grep "workers/video" || true`.
- Forbidden path scan for env/secrets/credentials, migrations, `scripts/prepare-test-db.mjs`, storage media mutation, evidence/checklist closeout mutation, publishing/upload/render outputs, server/Docker Compose changes, FFmpeg/render command usage, and accidental public-ready approval.

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

- This phase validates fixture metadata and plan review structure only.
- It does not prove real media readability, visual quality, OCR/CV, render quality, or platform public readiness.
- The readiness scoring is intentionally simple and should be tuned with owner review.
- Public-ready review from actual rendered output remains deferred.

## Recommended Next Phase

`Phase 2J.4 Real Footage Draft Plan Quality Tuning`

The next phase should tune script outlines, scene beats, footage matching, missing-footage notes, and draft-plan quality while keeping rendering, upload, publishing, and live AI disabled by default.
