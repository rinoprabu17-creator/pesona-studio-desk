# Phase 2J.8 Real Footage Read-Only Intake Dry-Run

## Summary

Phase 2J.8 adds a local-only read-only intake dry-run foundation for future real footage folders.

The phase uses only a safe repo fixture path and derives conservative candidate metadata from filenames. It does not scan real SSD media, Google Drive, production storage, rendered outputs, or customer media.

No video rendering, FFmpeg execution, media decoding, video stream open, real media folder scan, upload, publishing, publish package creation, public-ready approval, evidence log mutation, checklist mutation, closeout, server command, Docker Compose server command, backup/restore, cutover, env/secret/credential change, migration, `scripts/prepare-test-db.mjs` change, real storage media mutation, rendered output creation, or `workers/video` change is included.

## Baseline

- Baseline commit: `85609e2`.
- Baseline tag: `phase-2j7-complete`.
- Phase 2J.7 finalized the real footage intake dry-run gate.

## Files Added

- `packages/content-engine/src/read-only-intake.ts`.
- `packages/content-engine/fixtures/read-only-intake-sample/`.
- `scripts/real-footage-read-only-intake-smoke.mjs`.
- `docs/ops/REAL_FOOTAGE_READ_ONLY_INTAKE_DRY_RUN.md`.
- `docs/phase-2j8-real-footage-read-only-intake-dry-run.md`.

## Files Updated

- `packages/content-engine/src/index.ts`.
- `package.json`.
- `README.md`.
- `README.local.md`.
- `docs/ops/HANDOFF_PACK_INDEX.md`.
- `docs/ops/PENDING_FEATURES_REGISTER.md`.

## Read-Only Intake Model Result

The read-only intake output includes:

- Source mode and root.
- Dry-run/read-only flags.
- Allowlist status.
- Top-level scanned entry count.
- Accepted media-like candidate count.
- Rejected and skipped entry counts.
- Extension and orientation hint breakdowns.
- Candidate manifest rows.
- Validation errors.
- Safety warnings.
- Gate status.
- Public-ready and publish-track safety fields.

`public_ready` remains `false` and `publish_track` remains `blocked`.

## Fixture Discovery Result

The safe repo fixture contains text placeholders only. They use media-like filenames to test extension and filename parsing, but they are not rendered videos and are not generated media outputs.

Current discovery result:

- Scanned entries: `12`.
- Accepted media candidates: `9`.
- Rejected entries: `2`.
- Skipped entries: `1`.
- Candidate manifest rows: `9`.
- Extension breakdown includes `.mp4`, `.mov`, `.jpg`, `.txt`, `.tmp`, and one directory without extension.
- Orientation hints include vertical and horizontal.

## Allowlist / Gate Result

The only default allowed source root is:

`packages/content-engine/fixtures/read-only-intake-sample`

The intake respects the Phase 2J.7 dry-run gate. If the gate does not return `dry_run_allowed`, no directory listing occurs.

Blocked by default:

- Absolute paths.
- Parent traversal.
- Sensitive path tokens.
- Real storage/media roots.
- Symlinks.
- Media file contents.
- Media decoding.
- Render/upload/publish behavior.

## Candidate Metadata Result

Candidate rows are filename-only guesses:

- `footage_id`.
- `filename`.
- `relative_path`.
- `extension`.
- `product_family_guess`.
- `process_stage_guess`.
- `orientation_hint`.
- `risk_flags_guess`.
- `usable_guess`.
- `duration_sec`.
- `notes`.

`duration_sec` remains `null` because no media is decoded.

## Smoke Command

```bash
npm run ai:real-footage-read-only-intake:smoke
```

Current smoke result:

- Provider: `fake_content_engine`.
- Source mode: `safe_repo_fixture`.
- `dry_run: true`.
- `read_only: true`.
- `allowlisted_root: true`.
- Scanned entries: `12`.
- Accepted media candidates: `9`.
- Rejected/skipped entries: `3`.
- Candidate manifest rows: `9`.
- Validation error count: `0`.
- Safety warning count: `3`.
- Gate status: `dry_run_allowed`.
- Public-ready: `false`.
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
- `npm run ai:real-footage-read-only-intake:smoke`.
- `git diff --name-only | grep "workers/video" || true`.
- Forbidden path scan for env/secrets/credentials, migrations, `scripts/prepare-test-db.mjs`, storage media mutation, evidence/checklist closeout mutation, publishing/upload/render outputs, server/Docker Compose changes, FFmpeg/render command usage, accidental public-ready approval, `workers/video`, real media scan/open/decode command usage, and non-fixture file walk/stat usage.

## Safety / Forbidden Path Result

Expected safety result:

- No `workers/video` change.
- No migration change.
- No `scripts/prepare-test-db.mjs` change.
- No env, secret, credential, API key, token, cookie, session, or generated runtime artifact.
- No real storage media, rendered video, backup, dump, archive, checksum, route evidence, or production data artifact.
- No server command or Docker Compose server command.
- No evidence log, checklist, closeout, publishing, upload, backup/restore, or cutover mutation.
- No real media scan.
- No media file content open.
- No media decoding.
- No FFmpeg execution.
- No public-ready approval.

## Risks / Follow-Up

- Placeholder file discovery is not real footage QA.
- Filename guesses can be wrong.
- Real media handling still needs owner-approved source path, read-only procedure, privacy rules, and evidence rules.

## Recommended Next Phase

`Phase 2J.9 Real Footage Read-Only Intake Review`

The next phase should review this dry-run output before any real source folder is approved.
