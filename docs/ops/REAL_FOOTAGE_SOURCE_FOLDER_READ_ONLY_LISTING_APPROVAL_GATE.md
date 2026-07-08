# Real Footage Source Folder Read-Only Listing Approval Gate

Phase: `2J.12`

## Purpose

This document records the read-only listing approval gate for future real footage source folders.

The gate allows controlled directory listing/stat only after a source passes the Phase 2J.10 owner-approved source folder gate and the Phase 2J.11 approval review. In Phase 2J.12, the only source that may be listed is the safe repo fixture path. Real SSD, Google Drive, storage, production, backup, render, upload, and publish paths remain metadata strings only.

## Baseline

- Baseline commit: `b2f0c73`
- Baseline tag: `phase-2j11-complete`
- Listing gate utility: `packages/content-engine/src/source-folder-listing-approval-gate.ts`
- Source gate dependency: `packages/content-engine/src/source-folder-gate.ts`
- Approval review dependency: `packages/content-engine/src/source-folder-approval-review.ts`
- Safe listing dependency: `packages/content-engine/src/read-only-intake.ts`
- Smoke fixture: `packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json`
- Smoke command: `npm run ai:real-footage-source-listing-gate:smoke`
- Only listable source string: `packages/content-engine/fixtures/read-only-intake-sample/`
- Provider: `fake_content_engine`
- Live AI required: no

## Gate Model

Each listing gate output records:

- listing gate ID
- source identity, label, and requested source root
- dry-run and read-only flags
- Phase 2J.11 approval review status
- Phase 2J.10 source gate status
- listing allowed/performed flags
- allowlisted root flag
- scanned, accepted, rejected, and skipped counts
- listing summary
- denied listing reasons
- safety warnings
- next safe actions
- `public_ready: false`
- `publish_track: blocked`

## Conservative Rules

Listing is allowed only when:

- `dry_run` is true
- `read_only` is true
- Phase 2J.10 source gate status is `owner_approved_dry_run`
- Phase 2J.11 approval review status is `approval_review_ok`
- source root is exactly `packages/content-engine/fixtures/read-only-intake-sample/`
- no risky actions are requested

Denied cases must not perform filesystem listing/stat.

## Fixture Cases

The smoke fixture includes:

- approved safe repo fixture where listing is allowed/performed
- incomplete approval where listing is denied
- missing owner approval where listing is denied
- unsafe absolute SSD/storage path denied before access
- Google Drive path denied before access
- render/upload/publish/decode request denied before access

Real-looking paths in the fixture are metadata strings only and are not accessed.

## Smoke Command

```bash
npm run ai:real-footage-source-listing-gate:smoke
```

Expected summary:

- provider: `fake_content_engine`
- listing gate cases: at least 5
- listing allowed count: 1
- listing performed count: 1
- denied listing count: at least 4
- scanned entries: at least 10, only from the approved safe fixture case
- accepted candidates: at least 8, only from the approved safe fixture case
- public ready: false
- public ready count: 0
- publish track: `blocked`

## Safe Behavior

This phase performs no real media folder access:

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

The only controlled filesystem operation is the existing Phase 2J.8 directory listing/stat against the safe repo fixture path, after approval passes.

## Known Limitations

The listing still uses placeholder fixture filenames only. It does not prove that a real source folder exists, is readable, contains valid media, or is safe to inspect.

## Next Phase

Recommended next phase:

`Phase 2J.13 Real Footage Source Folder Listing Review`
