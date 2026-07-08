# Phase 2J.13 Real Footage Source Folder Listing Review

## Summary

Phase 2J.13 adds a conservative listing review layer for the approved safe fixture listing from Phase 2J.12. It reviews filename-derived candidate metadata only and keeps all real media access, render, upload, and publishing paths blocked.

## Implementation

- Review utility: `packages/content-engine/src/source-folder-listing-review.ts`
- Review fixture: `packages/content-engine/fixtures/source-folder-listing-review-smoke.json`
- Smoke script: `scripts/real-footage-source-listing-review-smoke.mjs`
- NPM command: `npm run ai:real-footage-source-listing-review:smoke`

The review consumes the Phase 2J.12 listing gate fixture:

```text
packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json
```

Only the allowed safe fixture listing is reviewed:

```text
packages/content-engine/fixtures/read-only-intake-sample/
```

Denied Phase 2J.12 listing cases produce no entry reviews.

## Output Model

The review result includes:

- listing review identity
- source identity and root
- dry-run/read-only flags
- listing gate status
- listing allowed/performed flags
- total listed entries
- reviewed entry counts
- entry reviews
- filename signal summary
- extension summary
- risk summary
- missing metadata summary
- recommended metadata fields
- recommended owner actions
- next safe actions
- `public_ready: false`
- `publish_track: blocked`

Entry review statuses:

- `listing_review_ok`
- `needs_manual_metadata`
- `blocked_entry`
- `low_confidence`

## Safety Boundary

This phase does not:

- access actual SSD, Google Drive, storage, production media, backup, render, upload, or publish folders
- scan real media folders
- stat/walk files against actual storage
- open file contents or video streams
- decode media
- execute FFmpeg
- render video
- upload
- publish
- create publish packages
- set `public_ready` true
- change `workers/video`
- mutate env, secrets, credentials, evidence logs, checklist closeouts, migrations, backups, restore state, or cutover state
- run server or Docker Compose commands

Real-looking paths appear only as blocked metadata strings or safety documentation.

## Validation

Required validation for the phase includes:

```bash
npm run check
npm run ai:real-footage-source-listing-review:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

## Recommended Next Phase

```text
Phase 2J.14 Real Footage Source Folder Metadata Enrichment Review
```
