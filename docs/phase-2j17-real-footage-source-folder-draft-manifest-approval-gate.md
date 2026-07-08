# Phase 2J.17 Real Footage Source Folder Draft Manifest Approval Gate

## Summary

Phase 2J.17 adds a conservative draft manifest approval gate for in-memory manifest preview items from Phase 2J.16. The gate approves eligible rows only for a future draft-manifest creation review phase, and it does not create, write, export, import, or persist any manifest file.

## Implementation

- Draft manifest approval gate utility: `packages/content-engine/src/source-folder-draft-manifest-approval-gate.ts`
- Draft manifest approval gate fixture: `packages/content-engine/fixtures/source-folder-draft-manifest-approval-gate-smoke.json`
- Smoke script: `scripts/real-footage-source-draft-manifest-approval-gate-smoke.mjs`
- NPM command: `npm run ai:real-footage-source-draft-manifest-approval:smoke`

The draft manifest approval gate fixture references:

```text
packages/content-engine/fixtures/source-folder-draft-manifest-review-smoke.json
packages/content-engine/fixtures/source-folder-metadata-enrichment-approval-gate-smoke.json
packages/content-engine/fixtures/source-folder-metadata-enrichment-review-smoke.json
packages/content-engine/fixtures/source-folder-listing-review-smoke.json
packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json
```

Only `manifest_preview_ok` rows from the approved safe repo fixture flow may become `approved_for_future_manifest_creation`.

## Output Model

The draft manifest approval gate result includes:

- draft manifest approval gate identity
- source identity and root
- dry-run/read-only flags
- draft manifest review status
- reviewed manifest preview item count
- approval item counts
- approval items
- approval policy findings
- duplicate ID findings
- missing approval fields
- blocked reason summary
- denied action summary
- recommended owner actions
- next safe actions
- `metadata_write_allowed: false`
- `manifest_write_allowed: false`
- `manifest_file_created: false`
- `manifest_export_allowed: false`
- `public_ready: false`
- `publish_track: blocked`

Draft manifest approval statuses:

- `approved_for_future_manifest_creation`
- `needs_owner_review`
- `incomplete_approval`
- `blocked_approval`

## Safety Boundary

This phase is approval-gate only. It does not:

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
npm run ai:real-footage-source-draft-manifest-approval:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

The Phase 2J.17 smoke output reports:

- `approved_for_future_manifest_creation_count`
- `needs_owner_review_count`
- `incomplete_approval_count`
- `blocked_approval_count`
- `duplicate_id_findings_count`
- `missing_approval_fields_count`
- `blocked_reasons_count`
- `denied_action_count`
- `metadata_write_allowed_count`
- `manifest_write_allowed_count`
- `manifest_file_created_count`
- `manifest_export_allowed_count`
- `recommended_owner_actions_count`

Approval for future manifest creation remains separate from actual draft manifest creation. The fixture intentionally includes duplicate-ID and denied-action approval records to verify blocking without creating, writing, importing, exporting, or persisting any manifest.

## Recommended Next Phase

```text
Phase 2J.18 Real Footage Source Folder Draft Manifest Creation Dry-Run Gate
```
