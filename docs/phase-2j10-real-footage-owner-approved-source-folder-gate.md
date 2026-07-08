# Phase 2J.10 Real Footage Owner-Approved Source Folder Gate

## Summary

Phase 2J.10 adds a config-only owner approval gate for future real footage source folders.

The gate validates owner approval, approval record presence, source path allowlisting, source path safety, and forbidden action requests. It does not scan real media folders, open media files, decode media, render video, upload, publish, create publish packages, mutate checklist/evidence data, or mark any output public-ready.

## Baseline

- Baseline commit: `b88c530`
- Baseline tag: `phase-2j9-complete`
- Previous phase: read-only intake review using safe fixture candidates
- Publish track: blocked

## Changed Files

- `packages/content-engine/src/source-folder-gate.ts`
- `packages/content-engine/fixtures/source-folder-gate-smoke.json`
- `scripts/real-footage-source-folder-gate-smoke.mjs`
- `package.json`
- `packages/content-engine/src/index.ts`
- `docs/ops/REAL_FOOTAGE_OWNER_APPROVED_SOURCE_FOLDER_GATE.md`
- `docs/phase-2j10-real-footage-owner-approved-source-folder-gate.md`
- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Gate Result

The gate supports three statuses:

- `owner_approved_dry_run`
- `manual_review_required`
- `blocked`

The only source that can reach `owner_approved_dry_run` in this phase is the Phase 2J.8 safe repo fixture path with owner approval, approval record, dry-run, read-only, and no forbidden requested actions.

## Fixture Result

The smoke fixture covers:

- approved safe repo fixture root
- missing owner approval record
- absolute storage/SSD path blocked
- Google Drive path blocked
- render/upload/publish request blocked
- parent traversal plus sensitive path blocked

Real-looking paths are fixture metadata strings only.

## Safety Result

This phase does not perform:

- real media folder scan
- actual SSD access
- Google Drive access
- storage folder access
- production media folder access
- backup folder access
- upload folder access
- media content opening
- media decoding
- FFmpeg execution
- render
- upload
- publishing
- publish package creation
- public-ready approval
- server command
- Docker Compose command
- storage mutation
- env/secret/credential change
- migration
- `scripts/prepare-test-db.mjs` change
- evidence log mutation
- checklist or closeout mutation

## Smoke Command

```bash
npm run ai:real-footage-source-folder-gate:smoke
```

Expected:

- provider: `fake_content_engine`
- gate cases >= 5
- owner-approved dry-run count >= 1
- blocked count >= 3
- manual-review required count >= 1
- scan allowed count = 0
- file open allowed count = 0
- decode allowed count = 0
- render allowed count = 0
- upload allowed count = 0
- publish allowed count = 0
- public ready count = 0
- publish track = blocked

## Recommended Next Phase

`Phase 2J.11 Real Footage Source Folder Approval Review`
