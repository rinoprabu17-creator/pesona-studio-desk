# Real Footage Source Folder Approval Review

Phase: `2J.11`

## Purpose

This document records the source folder approval review layer for future real footage intake.

The review audits proposed owner-approved source folder records before any later real footage intake can be allowed. This phase is approval-review/config-only. It does not scan real media folders, stat or walk real storage paths, open files, decode media, render video, upload, publish, create publish packages, or mutate storage.

## Baseline

- Baseline commit: `d4bd74a`
- Baseline tag: `phase-2j10-complete`
- Review utility: `packages/content-engine/src/source-folder-approval-review.ts`
- Gate dependency: `packages/content-engine/src/source-folder-gate.ts`
- Smoke fixture: `packages/content-engine/fixtures/source-folder-approval-review-smoke.json`
- Smoke command: `npm run ai:real-footage-source-approval-review:smoke`
- Only approval-review OK source string: `packages/content-engine/fixtures/read-only-intake-sample/`
- Provider: `fake_content_engine`
- Live AI required: no

## Review Model

Each review result records:

- review ID and approval policy version
- reviewed, approved, manual-review, and blocked counts
- per-record approval review details
- policy findings
- missing approval fields
- unsafe path findings
- action permission findings
- recommended owner actions
- next safe actions
- `public_ready: false`
- `publish_track: blocked`

Each record review includes:

- source identity, label, and requested source root
- approval record, owner approval, approver, timestamp, and scope
- dry-run and read-only flags
- allowlisted root and path safety status
- requested and denied actions
- Phase 2J.10 gate status
- review status
- missing fields
- risk notes
- recommended action

## Review Statuses

- `approval_review_ok`: approval record exists, owner approval exists, approver/timestamp/scope are present, dry-run and read-only are true, the source root is the safe fixture, no risky actions are requested, and Phase 2J.10 gate status is `owner_approved_dry_run`.
- `needs_owner_review`: owner approval or approval record is still missing and the source is not upgraded beyond the Phase 2J.10 gate.
- `incomplete_approval`: owner approval is claimed but required approval metadata is incomplete.
- `blocked_source`: path safety failed or any denied action was requested.

## Conservative Rules

- Approval review OK requires Phase 2J.10 gate status `owner_approved_dry_run`.
- If Phase 2J.10 blocks a record, Phase 2J.11 must keep it blocked.
- The only source string that can pass approval review is `packages/content-engine/fixtures/read-only-intake-sample/`.
- Real-looking SSD, Google Drive, storage, production, backup, render, upload, and publish paths are metadata strings only.
- File open, media decode, render, upload, publish, publish package, server, Docker, env/secret, and storage mutation actions are denied.
- `public_ready` is always false.
- Publish track is always blocked.

## Fixture Cases

The smoke fixture includes:

- valid owner-approved safe repo fixture dry-run
- incomplete approval record
- missing owner approval
- unsafe absolute SSD/storage path
- Google Drive/gdrive path metadata review
- render/upload/publish/decode action request blocked
- parent traversal plus env/secrets/credentials path blocked

## Smoke Command

```bash
npm run ai:real-footage-source-approval-review:smoke
```

Expected summary:

- provider: `fake_content_engine`
- reviewed records: at least 6
- approval-review OK count: at least 1
- needs-owner-review or incomplete-approval count: at least 1
- blocked source count: at least 2
- missing approval fields count: at least 1
- denied action findings count: at least 1
- public ready: false
- public ready count: 0
- publish track: `blocked`

## Safe Behavior

This phase performs no actual filesystem access to real media roots:

- no real media folder scan
- no real file stat or walk against actual storage
- no actual SSD access
- no Google Drive access
- no storage folder access
- no production media folder access
- no backup, render, upload, or publish folder access
- no media file content opening
- no media decoding
- no FFmpeg execution
- no rendering
- no upload
- no publishing
- no publish package creation
- no evidence log or checklist mutation
- no closeout
- no server or Docker command

## Known Limitations

The review validates approval metadata and Phase 2J.10 gate outcomes only. It does not prove that a real source folder exists, is readable, contains valid media, or is safe to inspect.

## Next Phase

Recommended next phase:

`Phase 2J.12 Real Footage Source Folder Read-Only Listing Approval Gate`
