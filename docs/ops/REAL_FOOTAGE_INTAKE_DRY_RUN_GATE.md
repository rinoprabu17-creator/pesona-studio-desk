# Real Footage Intake Dry-Run Gate

## Purpose

Phase 2J.7 adds a gate before any transition from metadata fixtures to real footage intake.

The gate decides whether a proposed intake request is safe as metadata-only dry-run work, blocked, or requires manual owner review before any real-media handling can be considered.

This phase is gate-only. It does not scan real media folders, open video files, walk or inspect storage folders, run FFmpeg, render video, upload, publish, create publish packages, create evidence logs, mutate manual publish checklists, create closeout, run server commands, or run Docker Compose server commands.

## Baseline

- Baseline commit: `a75dc99`.
- Baseline tag: `phase-2j6-complete`.
- Phase 2J.6 metadata coverage review result:
  - `36` total rows.
  - `30` usable rows.
  - Coverage score `100`.
  - Coverage level `strong_metadata_base`.
  - `public_ready: false`.
  - `publish_track: blocked`.

## Gate Utility

Implementation:

`packages/content-engine/src/intake-dry-run-gate.ts`

The gate output includes:

- `gate_id`.
- `source_mode`.
- `source_fixture`.
- `dry_run`.
- `media_scan_allowed`.
- `media_open_allowed`.
- `render_allowed`.
- `upload_allowed`.
- `publish_allowed`.
- `gate_status`.
- `gate_score`.
- `passed_checks`.
- `failed_checks`.
- `blocking_reasons`.
- `manual_review_notes`.
- `next_safe_actions`.
- `public_ready`.
- `publish_track`.

Allowed gate statuses:

- `dry_run_allowed`.
- `blocked`.
- `manual_review_required`.

`media_scan_allowed`, `media_open_allowed`, `render_allowed`, `upload_allowed`, and `publish_allowed` are always `false` in this phase. `public_ready` is always `false`. `publish_track` is always `blocked`.

## Fixture

Fixture path:

`packages/content-engine/fixtures/real-footage-intake-dry-run-gate-smoke.json`

The fixture includes four gate cases:

1. Safe metadata-only fixture dry-run allowed.
2. Blocked case requesting real media folder scan and file walk/stat behavior.
3. Blocked case requesting render, upload, publish, publish package creation, and storage mutation.
4. Manual-review case for a future real-footage intake config represented as metadata strings only.

Absolute or storage-root path strings in the fixture are evidence of future request shape only. They are not accessed by this phase.

## Conservative Gate Rules

The gate requires:

- `dry_run` must be `true`.
- Provider must remain `fake_content_engine`.
- Media scan is not allowed.
- Media open is not allowed.
- File walk/stat behavior is not allowed.
- Render is not allowed.
- Upload is not allowed.
- Publish is not allowed.
- Publish package creation is not allowed.
- Storage mutation is not allowed.
- Env/secret access is not allowed.
- Server command is not allowed.
- Docker command is not allowed.
- `public_ready` remains `false`.
- `publish_track` remains `blocked`.

Any request to scan real media folders, open media, render, upload, publish, mutate storage, use env/secrets, or use server/Docker commands is blocked.

## Smoke Command

```bash
npm run ai:real-footage-dry-run-gate:smoke
```

Expected behavior:

- Provider: `fake_content_engine`.
- Gate cases: at least `4`.
- Dry-run allowed count: at least `1`.
- Blocked count: at least `2`.
- Manual-review-required count: at least `1`.
- Media scan allowed count: `0`.
- Media open allowed count: `0`.
- Render allowed count: `0`.
- Upload allowed count: `0`.
- Publish allowed count: `0`.
- Public-ready count: `0`.
- Publish track: `blocked`.

## Current Smoke Result

Current dry-run gate smoke result:

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

## Safety Rules

- Fake provider remains default.
- Live OpenAI is not required.
- No real media folder is scanned.
- No media file is opened.
- No real storage folder walk or file metadata lookup is performed.
- No rendered video is created.
- No FFmpeg command is executed.
- No upload or publishing occurs.
- No publish package is created.
- No public-ready approval is produced.
- No evidence log, checklist, closeout, backup, restore, cutover, migration, env, secret, credential, `scripts/prepare-test-db.mjs`, or `workers/video` change is part of this phase.
- No server command or Docker Compose server command is run.

## Known Limits

- This phase only evaluates proposed intake behavior.
- It does not prove real file existence, codec compatibility, visual quality, privacy safety, render readiness, or public readiness.
- Future real-media intake still needs explicit owner approval and a read-only procedure before any real folder is touched.

## Recommended Next Phase

`Phase 2J.8 Real Footage Read-Only Intake Dry-Run`

This should happen only after owner approves exact allowed source folders, read-only handling, output format, and evidence rules. Rendering, upload, publishing, public-ready approval, publish package creation, evidence log creation, checklist mutation, closeout, server/Docker commands, and storage mutation should remain blocked.
