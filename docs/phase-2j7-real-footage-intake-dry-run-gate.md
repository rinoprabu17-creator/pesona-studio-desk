# Phase 2J.7 Real Footage Intake Dry-Run Gate

## Summary

Phase 2J.7 adds a local-only dry-run gate for the future transition from metadata fixtures to real footage intake.

The gate classifies proposed intake requests as `dry_run_allowed`, `blocked`, or `manual_review_required`. It remains dry-run/gate-only and does not touch real media.

No video rendering, FFmpeg execution, real media scan, media file open, storage folder walk, file metadata lookup, upload, publishing, publish package creation, public-ready approval, evidence log mutation, checklist mutation, closeout, server command, Docker Compose server command, backup/restore, cutover, env/secret/credential change, migration, `scripts/prepare-test-db.mjs` change, storage media mutation, rendered output creation, or `workers/video` change is included.

## Baseline

- Baseline commit: `a75dc99`.
- Baseline tag: `phase-2j6-complete`.
- Phase 2J.6 metadata coverage review result:
  - `36` rows.
  - `30` usable rows.
  - Coverage score `100`.
  - Coverage level `strong_metadata_base`.
  - `public_ready: false`.
  - `publish_track: blocked`.

## Files Added

- `packages/content-engine/src/intake-dry-run-gate.ts`.
- `packages/content-engine/fixtures/real-footage-intake-dry-run-gate-smoke.json`.
- `scripts/real-footage-intake-dry-run-gate-smoke.mjs`.
- `docs/ops/REAL_FOOTAGE_INTAKE_DRY_RUN_GATE.md`.
- `docs/phase-2j7-real-footage-intake-dry-run-gate.md`.

## Files Updated

- `packages/content-engine/src/index.ts`.
- `package.json`.
- `README.md`.
- `README.local.md`.
- `docs/ops/HANDOFF_PACK_INDEX.md`.
- `docs/ops/PENDING_FEATURES_REGISTER.md`.

## Dry-Run Gate Model Result

The gate output includes:

- Gate identity and source mode.
- Dry-run flag.
- Allowed booleans for media scan/open/render/upload/publish.
- Gate status.
- Gate score.
- Passed and failed checks.
- Blocking reasons.
- Manual review notes.
- Next safe actions.
- Public-ready and publish-track safety fields.

All media and publish action allow flags remain `false`.

## Gate Fixture Result

The fixture contains four cases:

- Safe expanded metadata fixture dry-run.
- Blocked real-media folder scan request.
- Blocked render/upload/publish request.
- Manual-review future real-footage config represented as metadata strings only.

Absolute and storage-root paths appear only as metadata strings in blocked/manual-review examples and are not accessed.

## Gate Rule Result

The gate blocks requests for:

- Real media folder scan.
- Media file open.
- File walk/stat behavior.
- Render.
- Upload.
- Publish.
- Publish package creation.
- Storage mutation.
- Env/secret access.
- Server command.
- Docker command.

`public_ready` remains `false` and `publish_track` remains `blocked`.

## Smoke Command

```bash
npm run ai:real-footage-dry-run-gate:smoke
```

Current smoke result:

- Provider: `fake_content_engine`.
- Gate cases: `4`.
- Dry-run allowed count: `1`.
- Blocked count: `2`.
- Manual-review-required count: `1`.
- Failed check count: `10`.
- Blocking reason count: `10`.
- Media scan allowed count: `0`.
- Media open allowed count: `0`.
- Render allowed count: `0`.
- Upload allowed count: `0`.
- Publish allowed count: `0`.
- Public-ready count: `0`.
- Publish track: `blocked`.

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
- `npm run ai:metadata-coverage:smoke`.
- `npm run ai:real-footage-dry-run-gate:smoke`.
- `git diff --name-only | grep "workers/video" || true`.
- Forbidden path scan for env/secrets/credentials, migrations, `scripts/prepare-test-db.mjs`, storage media mutation, evidence/checklist closeout mutation, publishing/upload/render outputs, server/Docker Compose changes, FFmpeg/render command usage, accidental public-ready approval, `workers/video`, and real media scan/open/walk/stat command usage.

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
- No media file open.
- No FFmpeg execution.
- No public-ready approval.

## Risks / Follow-Up

- The gate validates proposed behavior only.
- It does not verify real media files, codecs, duration, visual quality, privacy risk, or render readiness.
- Future real-media intake needs owner approval for exact folders and read-only procedure.

## Recommended Next Phase

`Phase 2J.8 Real Footage Read-Only Intake Dry-Run`

The next phase should be read-only and owner-approved before any actual source folder is touched.
