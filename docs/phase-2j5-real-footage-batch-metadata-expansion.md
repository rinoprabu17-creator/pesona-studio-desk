# Phase 2J.5 Real Footage Batch Metadata Expansion

## Summary

Phase 2J.5 expands the metadata-only footage batch so the content engine can be tested with broader Sampul Raport and Map Ijazah coverage before any real media scan or render work.

The phase remains metadata-only. It does not scan real media folders, open media files, run FFmpeg, render video, upload, publish, create publish packages, create evidence logs, mutate checklists, create closeout, run server commands, run Docker Compose server commands, or touch storage media.

## Baseline

- Baseline commit: `9f3beef`.
- Baseline tag: `phase-2j4-complete`.
- Phase 2J.4 already provided metadata-only draft plan quality tuning.
- Phase 2J.5 builds on that foundation without push, deploy, merge, tag, server command, Docker Compose server command, real media scan, storage mutation, rendering, upload, publishing, evidence log mutation, checklist mutation, closeout, backup/restore, cutover, env/secret/credential change, migration, `scripts/prepare-test-db.mjs` change, or `workers/video` change.

## Files Added

- `packages/content-engine/src/expanded-batch.ts`.
- `packages/content-engine/fixtures/real-footage-expanded-batch-smoke.json`.
- `scripts/real-footage-expanded-batch-smoke.mjs`.
- `docs/ops/REAL_FOOTAGE_BATCH_METADATA_EXPANSION.md`.
- `docs/phase-2j5-real-footage-batch-metadata-expansion.md`.

## Files Updated

- `packages/content-engine/src/index.ts`.
- `package.json`.
- `README.md`.
- `README.local.md`.
- `docs/ops/HANDOFF_PACK_INDEX.md`.
- `docs/ops/PENDING_FEATURES_REGISTER.md`.

## Expanded Metadata Fixture Result

The expanded fixture contains:

- `36` metadata-only rows.
- `30` usable rows.
- `6` blocked/risk rows.
- Sampul Raport and Map Ijazah coverage.
- Required color variants: maroon, navy, black, green, gray, light blue, brown, and orange.
- Product close-up, foil/poly, penamaan, assembly, inner sheet, packing/QC, delivery, workshop, and mockup/CTA rows.
- Blocked examples for privacy, blur, placeholder, wrong orientation, too short, and unrelated content.

The `relative_path` values remain strings only and are not scanned or opened.

## Validation / Intake Rules Result

The expanded schema validates:

- Required fields.
- Safe relative paths.
- Supported orientation values.
- Boolean `usable`.
- Array `risk_flags`.
- Array `content_tags`.
- Positive `duration_sec`.
- `quality_score` range from `0` to `100`.
- Supported `channel_fit` values.

The Phase 2J.2 fixture remains compatible because the expanded schema is separate from the original intake schema.

## Batch Coverage Summary Result

The expanded smoke reports:

- Product family breakdown.
- Process stage breakdown.
- Visual type breakdown.
- Orientation breakdown.
- Channel fit breakdown.
- School level breakdown.
- Color variant breakdown.
- Risk flag breakdown.
- Average quality score.
- Low quality count.

Current smoke result:

- Total rows: `36`.
- Usable rows: `30`.
- Blocked rows: `6`.
- Vertical rows: `33`.
- Average quality score: `74.61`.
- Low quality count: `6`.

## Coverage Gap Detection Result

Coverage gap detection checks for weak coverage in:

- Map Ijazah footage.
- Packing + QC footage.
- Close-up product footage.
- Vertical social footage.
- Process footage.
- Delivery footage.
- CTA/mockup-related footage.
- Usable high-quality footage.

Current fixture coverage gap count is `0`.

## Content Engine Integration Result

Usable expanded rows feed into:

- Fake-provider footage metadata path.
- Fake-provider footage selection path.
- Fake-provider video draft plan path.
- Draft plan quality path.

Current smoke result:

- Metadata rows produced: `30`.
- Selections produced: `3`.
- Draft plan scenes produced: `3`.
- Quality review items produced: `4`.
- Public-ready count: `0`.
- Publish track: `blocked`.

## Smoke Command

```bash
npm run ai:real-footage-expanded:smoke
```

Expected output includes:

- Provider.
- Fixture path.
- Total rows.
- Usable rows.
- Blocked rows.
- Product family breakdown.
- Process stage breakdown.
- Orientation breakdown.
- Channel fit breakdown.
- Average quality score.
- Low quality count.
- Coverage gap count.
- Metadata rows produced.
- Selections produced.
- Quality review items produced.
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
- `npm run ai:real-footage-expanded:smoke`.
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

- This phase validates expanded metadata coverage only.
- It does not prove real media readability, visual quality, OCR/CV, render quality, or platform public readiness.
- A human coverage review is still needed before any real media dry-run.
- Public-ready review from actual rendered output remains deferred.

## Recommended Next Phase

`Phase 2J.6 Real Footage Metadata Coverage Review`

The next phase should review whether the expanded metadata batch is balanced enough for first real media dry-run planning while keeping rendering, upload, publishing, and live AI disabled by default.
