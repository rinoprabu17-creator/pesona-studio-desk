# Real Footage Owner-Approved Source Folder Gate

Phase: `2J.10`

## Purpose

This document records the owner-approved source folder gate for future real footage intake.

The gate validates source folder approval records and source path strings before any future real footage intake can be considered. This phase is config-only and does not scan actual media folders, open files, decode media, render video, upload, publish, or mutate storage.

## Baseline

- Baseline commit: `b88c530`
- Baseline tag: `phase-2j9-complete`
- Gate utility: `packages/content-engine/src/source-folder-gate.ts`
- Smoke fixture: `packages/content-engine/fixtures/source-folder-gate-smoke.json`
- Smoke command: `npm run ai:real-footage-source-folder-gate:smoke`
- Only accepted source string: `packages/content-engine/fixtures/read-only-intake-sample/`
- Provider: `fake_content_engine`
- Live AI required: no

## Gate Model

Each gate output records:

- requested source identity, root, and label
- approval mode
- dry-run/read-only flags
- owner approval and approval record status
- allowlist and path-safety status
- scan/open/decode/render/upload/publish permissions, always false
- gate status
- passed and failed checks
- blocking reasons
- manual review notes
- next safe actions
- `public_ready: false`
- `publish_track: blocked`

## Gate Statuses

- `owner_approved_dry_run`: owner approval exists, approval record exists, source root is the safe Phase 2J.8 repo fixture, and no forbidden action is requested.
- `manual_review_required`: source is not ready because owner approval or approval record is missing, but it is not executing unsafe behavior.
- `blocked`: source path or requested actions are unsafe.

## Conservative Rules

- `owner_approved` must be true before `owner_approved_dry_run`.
- `approval_record_found` must be true before `owner_approved_dry_run`.
- `dry_run` must be true.
- `read_only` must be true.
- Source root must be allowlisted.
- Source root must be safe.
- Parent traversal is blocked.
- Absolute paths are blocked unless they are metadata-only manual review cases.
- Path strings containing storage, Google Drive, gdrive, drive, backups, dumps, secrets, env, credentials, production, render, upload, publish, SSD, or similar sensitive roots are blocked.
- File open, decode, render, upload, publish, and publish package creation are always blocked.
- Public readiness is always false.
- Publish track is always blocked.

## Fixture Cases

The smoke fixture includes config-only cases for:

- approved safe repo fixture root for dry-run only
- missing owner approval record
- absolute storage/SSD path blocked
- Google Drive path blocked
- render/upload/publish request blocked
- parent traversal and sensitive path blocked

Real-looking paths in the fixture are metadata strings only and are not accessed.

## Smoke Command

```bash
npm run ai:real-footage-source-folder-gate:smoke
```

Expected summary:

- provider: `fake_content_engine`
- gate cases: at least 5
- owner-approved dry-run count: at least 1
- blocked count: at least 3
- manual-review required count: at least 1
- scan allowed count: 0
- file open allowed count: 0
- decode allowed count: 0
- render allowed count: 0
- upload allowed count: 0
- publish allowed count: 0
- public ready: false
- public ready count: 0
- publish track: `blocked`

## Safe Behavior

This phase performs no actual filesystem access to real media roots:

- no real media folder scan
- no actual SSD access
- no Google Drive access
- no storage folder access
- no production media folder access
- no backup folder access
- no upload folder access
- no file content opening
- no media decoding
- no FFmpeg execution
- no rendering
- no upload
- no publishing
- no evidence log or checklist mutation
- no closeout
- no server or Docker command

## Known Limitations

The gate validates approval records and source path strings only. It does not prove that a real source folder exists, is readable, contains valid media, or is safe to inspect.

## Next Phase

Recommended next phase:

`Phase 2J.11 Real Footage Source Folder Approval Review`
