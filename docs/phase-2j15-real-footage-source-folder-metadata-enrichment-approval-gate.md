# Phase 2J.15 Real Footage Source Folder Metadata Enrichment Approval Gate

## Summary

Phase 2J.15 adds a conservative approval gate for metadata enrichment suggestions from Phase 2J.14. It can approve individual fixture-only suggestions for a future draft-manifest review, but it does not write metadata, import metadata, or create any manifest.

## Implementation

- Approval gate utility: `packages/content-engine/src/source-folder-metadata-enrichment-approval-gate.ts`
- Approval gate fixture: `packages/content-engine/fixtures/source-folder-metadata-enrichment-approval-gate-smoke.json`
- Smoke script: `scripts/real-footage-source-metadata-enrichment-approval-gate-smoke.mjs`
- NPM command: `npm run ai:real-footage-source-metadata-enrichment-approval:smoke`

The approval gate fixture references:

```text
packages/content-engine/fixtures/source-folder-metadata-enrichment-review-smoke.json
packages/content-engine/fixtures/source-folder-listing-review-smoke.json
packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json
```

Only suggestions from the approved safe repo fixture listing/review/enrichment flow may produce approval items.

## Output Model

The approval gate result includes:

- approval gate identity
- source identity and root
- dry-run/read-only flags
- enrichment review status
- reviewed suggestions
- approval status counts
- approval items
- policy findings
- missing approval fields
- blocked reason summary
- denied action summary
- recommended owner actions
- next safe actions
- `metadata_write_allowed: false`
- `manifest_write_allowed: false`
- `public_ready: false`
- `publish_track: blocked`

Approval item statuses:

- `approved_for_draft_manifest`
- `needs_owner_review`
- `blocked_approval`
- `incomplete_approval`

## Safety Boundary

This phase is an approval gate only. It does not:

- write production manifests
- write real metadata stores
- import metadata
- create draft manifests
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
npm run ai:real-footage-source-metadata-enrichment-approval:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

The Phase 2J.15 smoke output also reports this completeness counter:

- `recommended_owner_actions_count`

## Recommended Next Phase

```text
Phase 2J.16 Real Footage Source Folder Draft Manifest Review
```
