# Phase 2J.14 Real Footage Source Folder Metadata Enrichment Review

## Summary

Phase 2J.14 adds a conservative metadata enrichment review layer. It consumes the approved safe fixture listing/review flow from Phase 2J.12 and Phase 2J.13, then emits suggested metadata rows only.

## Implementation

- Review utility: `packages/content-engine/src/source-folder-metadata-enrichment-review.ts`
- Review fixture: `packages/content-engine/fixtures/source-folder-metadata-enrichment-review-smoke.json`
- Smoke script: `scripts/real-footage-source-metadata-enrichment-review-smoke.mjs`
- NPM command: `npm run ai:real-footage-source-metadata-enrichment:smoke`

The enrichment fixture references:

```text
packages/content-engine/fixtures/source-folder-listing-review-smoke.json
packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json
```

Only entries from the approved safe repo fixture listing/review flow may produce enrichment candidates.

## Output Model

The enrichment review result includes:

- enrichment review identity
- source identity and root
- dry-run/read-only flags
- listing review status
- reviewed entries
- enrichment candidates
- enrichment status counts
- field coverage
- missing required metadata
- suggested metadata rows
- recommended manual fields
- recommended owner actions
- next safe actions
- `public_ready: false`
- `publish_track: blocked`

Candidate statuses:

- `enrichment_ready`
- `needs_manual_metadata`
- `blocked_enrichment`
- `low_confidence`

## Safety Boundary

This phase produces suggestions only. It does not:

- write to production manifests
- write to real metadata stores
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
npm run ai:real-footage-source-metadata-enrichment:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

The Phase 2J.14 smoke output also reports these completeness counters:

- `missing_required_metadata_count`
- `recommended_manual_fields_count`
- `recommended_owner_actions_count`

## Recommended Next Phase

```text
Phase 2J.15 Real Footage Source Folder Metadata Enrichment Approval Gate
```
