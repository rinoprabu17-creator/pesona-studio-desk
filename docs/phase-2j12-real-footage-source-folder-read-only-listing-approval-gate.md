# Phase 2J.12 Real Footage Source Folder Read-Only Listing Approval Gate

Phase 2J.12 adds a controlled read-only listing approval gate.

The gate allows directory listing/stat only after the source passes Phase 2J.10 source gate and Phase 2J.11 approval review. This phase still lists only the safe repo fixture path and does not access actual SSD, Google Drive, storage, production media, backup, render, upload, or publish folders.

## Baseline

- Baseline commit: `b2f0c73`
- Baseline tag: `phase-2j11-complete`
- Provider: `fake_content_engine`
- Public ready: false
- Publish track: blocked

## Added Files

- `packages/content-engine/src/source-folder-listing-approval-gate.ts`
- `packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json`
- `scripts/real-footage-source-listing-approval-gate-smoke.mjs`
- `docs/ops/REAL_FOOTAGE_SOURCE_FOLDER_READ_ONLY_LISTING_APPROVAL_GATE.md`

## Listing Allowed Requirements

Listing allowed requires:

- `dry_run` true
- `read_only` true
- Phase 2J.10 gate status `owner_approved_dry_run`
- Phase 2J.11 approval review status `approval_review_ok`
- source root exactly `packages/content-engine/fixtures/read-only-intake-sample/`
- no requested risky actions

If any requirement fails, listing is denied and no filesystem listing/stat is performed for that case.

## Fixture Coverage

The fixture covers:

- approved safe repo fixture where listing is allowed/performed
- incomplete approval where listing is denied
- missing owner approval where listing is denied
- unsafe absolute SSD/storage path denied before access
- Google Drive/gdrive path denied before access
- render/upload/publish/decode request denied before access

Real-looking paths are metadata strings only and are not accessed.

## Smoke Command

```bash
npm run ai:real-footage-source-listing-gate:smoke
```

Expected:

- provider = `fake_content_engine`
- listing gate cases >= 5
- listing allowed count = 1
- listing performed count = 1
- denied listing count >= 4
- scanned entries >= 10, only from safe fixture
- accepted candidates >= 8, only from safe fixture
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

`Phase 2J.13 Real Footage Source Folder Listing Review`
