# Real Footage Read-Only Intake Dry-Run

## Purpose

Phase 2J.8 adds a safe read-only intake dry-run foundation for future real footage folders.

This phase proves controlled discovery and filename-only candidate metadata generation against a repo fixture. It does not scan real SSD media folders, Google Drive, production storage, rendered outputs, or customer media.

This phase is read-only/dry-run only. It does not decode media, open video streams, run FFmpeg, render video, upload, publish, create publish packages, create evidence logs, mutate manual publish checklists, create closeout, run server commands, or run Docker Compose server commands.

## Baseline

- Baseline commit: `85609e2`.
- Baseline tag: `phase-2j7-complete`.
- Phase 2J.7 dry-run gate finalized and blocks real media scan/open/render/upload/publish by default.

## Read-Only Utility

Implementation:

`packages/content-engine/src/read-only-intake.ts`

The output includes:

- `intake_id`.
- `source_mode`.
- `source_root`.
- `dry_run`.
- `read_only`.
- `allowlisted_root`.
- `scanned_entries`.
- `accepted_media_candidates`.
- `rejected_entries`.
- `skipped_entries`.
- `extension_breakdown`.
- `orientation_hint_breakdown`.
- `candidate_manifest_rows`.
- `validation_errors`.
- `safety_warnings`.
- `gate_status`.
- `public_ready`.
- `publish_track`.

`public_ready` is always `false`. `publish_track` is always `blocked`.

## Safe Fixture

Fixture root:

`packages/content-engine/fixtures/read-only-intake-sample/`

The fixture contains small text placeholders with media-like filenames. They are not rendered videos and are not generated media outputs. They exist only to validate safe directory listing, extension filtering, and filename-derived metadata.

Current fixture result:

- `12` scanned top-level entries.
- `9` accepted media-like candidates.
- `2` rejected entries.
- `1` skipped directory entry.
- Extensions include `.mp4`, `.mov`, `.jpg`, `.txt`, `.tmp`, and a directory with no extension.
- Sampul Raport and Map Ijazah naming patterns.
- Vertical and horizontal filename hints.
- Risk-like filename hints: privacy, blurry, placeholder, unrelated.

## Allowlist Rules

Default allowlist:

`packages/content-engine/fixtures/read-only-intake-sample`

Rules:

- Only the safe repo fixture path is allowed by default.
- Absolute paths are blocked by default.
- Parent traversal `..` is blocked.
- Paths containing sensitive root tokens are blocked, including storage, Google Drive, gdrive, drive, backups, dumps, secrets, env, credentials, production, render, upload, and publish.
- Symlinks are not followed.
- File contents are not read.
- Media streams are not opened.
- Directory listing/stat is limited to the safe repo fixture path.
- Future real paths must return manual review or blocked until explicitly owner-approved.

## Gate Integration

Read-only intake respects the Phase 2J.7 dry-run gate:

- Gate is evaluated before fixture listing.
- If the gate does not allow dry-run, no directory listing occurs.
- The safe repo fixture uses gate status `dry_run_allowed`.
- Operational media scan/open/render/upload/publish flags remain false.
- Controlled fixture listing/stat is explicitly separated from real media scanning.

## Candidate Metadata

Candidate rows are derived from filenames only:

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

`duration_sec` is always `null` because no media decoding occurs. The dry-run does not claim visual quality or true duration.

## Smoke Command

```bash
npm run ai:real-footage-read-only-intake:smoke
```

Expected behavior:

- Provider: `fake_content_engine`.
- `dry_run: true`.
- `read_only: true`.
- `allowlisted_root: true`.
- Scanned entries: at least `10`.
- Accepted media candidates: at least `8`.
- Rejected/skipped entries: at least `3`.
- Candidate manifest rows: at least `8`.
- Public-ready: `false`.
- Public-ready count: `0`.
- Publish track: `blocked`.

## Current Smoke Result

Current smoke result:

- Provider: `fake_content_engine`.
- Fixture path: `packages/content-engine/fixtures/read-only-intake-sample`.
- Source mode: `safe_repo_fixture`.
- `dry_run: true`.
- `read_only: true`.
- `allowlisted_root: true`.
- Scanned entries: `12`.
- Accepted media candidates: `9`.
- Rejected entries: `2`.
- Skipped entries: `1`.
- Candidate manifest rows: `9`.
- Validation error count: `0`.
- Safety warning count: `3`.
- Gate status: `dry_run_allowed`.
- Public-ready: `false`.
- Public-ready count: `0`.
- Publish track: `blocked`.

## Safety Rules

- Fake provider remains default.
- Live OpenAI is not required.
- No real media folder is scanned.
- No media file content is opened.
- No media stream is decoded.
- No rendered video is created.
- No FFmpeg command is executed.
- No upload or publishing occurs.
- No publish package is created.
- No public-ready approval is produced.
- No evidence log, checklist, closeout, backup, restore, cutover, migration, env, secret, credential, `scripts/prepare-test-db.mjs`, or `workers/video` change is part of this phase.
- No server command or Docker Compose server command is run.

## Known Limits

- This phase validates safe fixture discovery only.
- It does not prove real footage path safety, real file existence, codec compatibility, duration, orientation, visual quality, audio quality, privacy safety, render readiness, or platform readiness.
- Future real-media intake still needs explicit owner approval and a strict read-only procedure before touching any real source folder.

## Recommended Next Phase

`Phase 2J.9 Real Footage Read-Only Intake Review`

Recommended scope:

- Review the dry-run output and candidate metadata format.
- Decide whether and how to approve a single real source folder for a later read-only scan.
- Keep rendering, upload, publishing, public-ready approval, publish package creation, evidence log creation, checklist mutation, closeout, server/Docker commands, and storage mutation blocked.
