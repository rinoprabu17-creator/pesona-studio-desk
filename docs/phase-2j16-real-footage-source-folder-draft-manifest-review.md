# Phase 2J.16 Real Footage Source Folder Draft Manifest Review

## Summary

Phase 2J.16 adds a conservative draft manifest review layer for approved fixture-only metadata suggestions from Phase 2J.15. The review assembles an in-memory manifest preview for owner review, but it does not create, write, export, import, or persist any manifest file.

## Implementation

- Draft manifest review utility: `packages/content-engine/src/source-folder-draft-manifest-review.ts`
- Draft manifest review fixture: `packages/content-engine/fixtures/source-folder-draft-manifest-review-smoke.json`
- Smoke script: `scripts/real-footage-source-draft-manifest-review-smoke.mjs`
- NPM command: `npm run ai:real-footage-source-draft-manifest-review:smoke`

The draft manifest review fixture references:

```text
packages/content-engine/fixtures/source-folder-metadata-enrichment-approval-gate-smoke.json
packages/content-engine/fixtures/source-folder-metadata-enrichment-review-smoke.json
packages/content-engine/fixtures/source-folder-listing-review-smoke.json
packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json
```

Only suggestions from the approved safe repo fixture flow may become `manifest_preview_ok`.

## Output Model

The draft manifest review result includes:

- draft manifest review identity
- source identity and root
- dry-run/read-only flags
- approval gate status
- reviewed approval item count
- manifest preview item count
- manifest status counts
- duplicate ID count
- missing required field count
- in-memory manifest preview items
- policy findings
- blocked reason summary
- recommended owner actions
- next safe actions
- `metadata_write_allowed: false`
- `manifest_write_allowed: false`
- `manifest_file_created: false`
- `public_ready: false`
- `publish_track: blocked`

Manifest review statuses:

- `manifest_preview_ok`
- `needs_owner_review`
- `blocked_manifest`
- `incomplete_manifest`

## Safety Boundary

This phase is preview/review only. It does not:

- write production manifests
- create draft manifest files
- export manifests
- import manifests
- write manifests
- write real metadata stores
- import metadata
- write metadata
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
npm run ai:real-footage-source-draft-manifest-review:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

The Phase 2J.16 smoke output reports:

- `manifest_preview_ok_count`
- `needs_owner_review_count`
- `incomplete_manifest_count`
- `blocked_manifest_count`
- `duplicate_id_count`
- `missing_required_field_count`
- `metadata_write_allowed_count`
- `manifest_write_allowed_count`
- `manifest_file_created_count`
- `recommended_owner_actions_count`

`manifest_preview_items` may exceed `reviewed_approval_items` in the smoke fixture because one controlled override intentionally duplicates a `suggested_footage_id` to verify duplicate-ID blocking. The duplicated preview item is blocked and does not create or write any manifest file.

## Recommended Next Phase

```text
Phase 2J.17 Real Footage Source Folder Draft Manifest Approval Gate
```
