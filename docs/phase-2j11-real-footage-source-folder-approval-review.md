# Phase 2J.11 Real Footage Source Folder Approval Review

Phase 2J.11 adds a config-only approval review layer for proposed real footage source folder records.

The layer audits owner approval metadata and reuses the Phase 2J.10 source folder gate. It does not scan real media folders, stat or walk real storage paths, open files, decode media, render video, upload, publish, create publish packages, or mutate storage.

## Baseline

- Baseline commit: `d4bd74a`
- Baseline tag: `phase-2j10-complete`
- Prior phase: Phase 2J.10 owner-approved source folder gate
- Provider: `fake_content_engine`
- Public ready: false
- Publish track: blocked

## Added Files

- `packages/content-engine/src/source-folder-approval-review.ts`
- `packages/content-engine/fixtures/source-folder-approval-review-smoke.json`
- `scripts/real-footage-source-folder-approval-review-smoke.mjs`
- `docs/ops/REAL_FOOTAGE_SOURCE_FOLDER_APPROVAL_REVIEW.md`

## Review Statuses

- `approval_review_ok`
- `needs_owner_review`
- `incomplete_approval`
- `blocked_source`

## Approval Review OK Requirements

Approval review OK requires:

- approval record found
- owner approved
- approved by present
- approved at present
- approval scope present
- dry-run true
- read-only true
- allowlisted source root
- safe source root
- all risky actions denied
- Phase 2J.10 gate status `owner_approved_dry_run`

The only source string that can pass is:

`packages/content-engine/fixtures/read-only-intake-sample/`

## Fixture Coverage

The fixture covers:

- valid owner-approved safe repo fixture dry-run
- incomplete approval record
- missing owner approval
- unsafe absolute storage/SSD path
- Google Drive/gdrive metadata path
- render/upload/publish/decode request blocked
- parent traversal plus env/secrets/credentials path blocked

Real-looking paths are metadata strings only and are not accessed.

## Smoke Command

```bash
npm run ai:real-footage-source-approval-review:smoke
```

Expected:

- provider = `fake_content_engine`
- reviewed records >= 6
- approval-review OK count >= 1
- needs-owner-review or incomplete-approval count >= 1
- blocked source count >= 2
- missing approval fields count >= 1
- denied action findings count >= 1
- public ready = false
- public ready count = 0
- publish track = blocked

## Explicit Non-Goals

This phase is not:

- real media folder scan
- file stat or walk against actual storage
- actual SSD access
- Google Drive access
- storage folder access
- production media access
- backup/render/upload/publish folder access
- media file open
- media decoding
- FFmpeg execution
- video rendering
- upload
- publishing
- publish package creation
- public-ready approval
- evidence log mutation
- checklist or closeout mutation
- migration
- `scripts/prepare-test-db.mjs` change
- server command
- Docker Compose command
- deployment
- cutover
- tag

## Recommended Next Phase

`Phase 2J.12 Real Footage Source Folder Read-Only Listing Approval Gate`
