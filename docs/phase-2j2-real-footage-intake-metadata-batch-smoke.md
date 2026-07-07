# Phase 2J.2 Real Footage Intake & Metadata Batch Smoke

## Summary

Phase 2J.2 adds a safe local-only real footage intake and metadata batch smoke foundation.

The phase uses a repo fixture manifest to represent real-footage-like metadata. It does not scan real footage folders, open media files, render video, upload, publish, create evidence logs, mutate checklists, create closeout, run server commands, or touch storage media.

## Baseline

- Baseline commit: `185eb08`.
- Baseline tag: `phase-2j1-complete`.
- Phase 2J.1 already provided the safe fake-default content-engine foundation.
- Phase 2J.2 builds on that foundation without push, deploy, merge, tag, server command, Docker Compose server command, real media scan, storage mutation, rendering, upload, publishing, evidence log mutation, checklist mutation, closeout, backup/restore, cutover, env/secret/credential change, migration, or `scripts/prepare-test-db.mjs` change.

## Files Added

- `packages/content-engine/src/intake.ts`.
- `packages/content-engine/fixtures/real-footage-intake-smoke.json`.
- `scripts/real-footage-intake-smoke.mjs`.
- `docs/ops/REAL_FOOTAGE_INTAKE_METADATA_BATCH_SMOKE.md`.
- `docs/phase-2j2-real-footage-intake-metadata-batch-smoke.md`.

## Files Updated

- `packages/content-engine/src/index.ts`.
- `package.json`.
- `README.md`.
- `README.local.md`.
- `docs/ops/HANDOFF_PACK_INDEX.md`.
- `docs/ops/PENDING_FEATURES_REGISTER.md`.

## Intake Format

The manifest format includes:

- `footage_id`.
- `filename`.
- `relative_path`.
- `product_family`.
- `visual_type`.
- `duration_sec`.
- `orientation`.
- `location`.
- `school_level`.
- `content_tags`.
- `notes`.
- `usable`.
- `risk_flags`.

Fixture rows are metadata records only. The `relative_path` values are not scanned or opened.

## Intake Fixture Result

Expected fixture smoke result:

- Total fixture rows: `10`.
- Usable rows: `7`.
- Blocked rows: `3`.
- Missing required fields: `0`.
- Orientation breakdown: `vertical = 9`, `horizontal = 1`.
- Product family breakdown: `sampul_raport = 7`, `map_ijazah = 2`, `technical_placeholder = 1`.
- Risk flags include privacy/blur, low-light/reshoot, and placeholder/not-production-ready cases.

## Pipeline Integration

Usable fixture rows are converted into the existing content-engine fake pipeline input and passed through:

- Footage Metadata Agent.
- Footage Selection Agent.
- Video Draft Plan Agent.

The fake provider remains default. Live OpenAI is not required. `public_ready` remains `false`, and publish track remains blocked.

## Content Engine Integration Result

The fixture smoke produces:

- Metadata rows produced: `7`.
- Footage selections produced: `3`.
- Draft plan scenes produced: `3`.
- `public_ready: false`.
- Publish track: `blocked`.

## Smoke Command

```bash
npm run ai:real-footage-intake:smoke
```

Expected output includes:

- Provider.
- Source fixture path.
- Total footage rows.
- Usable footage rows.
- Blocked footage rows.
- Metadata rows produced.
- Selections produced.
- Draft plan scenes produced.
- `public_ready`.
- Publish track.

## Smoke Result

Expected smoke result:

- Provider: `fake_content_engine`.
- Source fixture path: `packages/content-engine/fixtures/real-footage-intake-smoke.json`.
- Total footage rows: `10`.
- Usable footage rows: `7`.
- Blocked footage rows: `3`.
- Metadata rows produced: `7`.
- Selections produced: `3`.
- Draft plan scenes produced: `3`.
- `public_ready: false`.
- `publish_track: blocked`.

## Validation Checklist

Run before finalization:

- `git status --short`.
- `git diff --name-only`.
- `git ls-files --others --exclude-standard`.
- `git diff --check`.
- `npm run check`.
- `npm run ai:content-engine:smoke`.
- `npm run ai:real-footage-intake:smoke`.
- `git diff --name-only | grep "workers/video" || true`.
- Forbidden path scan for env/secrets/credentials, migrations, `scripts/prepare-test-db.mjs`, storage media mutation, evidence/checklist closeout mutation, publishing/upload/render outputs, server/Docker Compose changes.

## Safety / Forbidden Path Result

Expected safety result:

- No `workers/video` change.
- No migration change.
- No `scripts/prepare-test-db.mjs` change.
- No env, secret, credential, API key, token, cookie, session, or generated runtime artifact.
- No storage media, rendered video, backup, dump, archive, checksum, route evidence, or production data artifact.
- No server command or Docker Compose server command.
- No evidence log, checklist, closeout, publishing, upload, backup/restore, or cutover mutation.

## Non-Goals

This phase does not:

- Publish.
- Upload.
- Render video.
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
- Commit env, secrets, credentials, backup artifacts, rendered videos, or generated runtime artifacts.

## Risks / Follow-Up

- This phase validates fixture metadata and fake pipeline structure only.
- It does not prove real media readability, visual quality, OCR/CV, render quality, or public readiness.
- Real footage folder scanning remains intentionally deferred.
- Public-ready review from rendered output remains deferred.

## Recommended Next Phase

`Phase 2J.3 Real Footage Script-To-Draft Plan Batch Review`

The next phase should review script-to-draft-plan quality across the fixture batch while keeping rendering, upload, publishing, and live AI disabled by default.
