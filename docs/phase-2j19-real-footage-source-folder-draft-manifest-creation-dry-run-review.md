# Phase 2J.19 Real Footage Source Folder Draft Manifest Creation Dry-Run Review

## Summary

Phase 2J.19 adds an in-memory draft manifest creation dry-run review for Phase 2J.18 eligible rows. The review checks whether rows can be previewed by a later approval gate, and it does not create, write, export, import, save, persist, or mutate any manifest file.

## Implementation

- Draft manifest creation dry-run review utility: `packages/content-engine/src/source-folder-draft-manifest-creation-dry-run-review.ts`
- Draft manifest creation dry-run review fixture: `packages/content-engine/fixtures/source-folder-draft-manifest-creation-dry-run-review-smoke.json`
- Smoke script: `scripts/real-footage-source-draft-manifest-creation-dry-run-review-smoke.mjs`
- NPM command: `npm run ai:real-footage-source-draft-manifest-creation-review:smoke`

The review fixture references the Phase 2J.18 creation dry-run gate fixture and the safe fixture flow through Phase 2J.12 through Phase 2J.17.

Only `eligible_for_creation_dry_run` rows from the approved safe repo fixture flow may become `dry_run_preview_ok`.

## Output Model

The draft manifest creation dry-run review result includes:

- creation review identity
- source identity and root
- dry-run/read-only flags
- creation gate status
- reviewed gate item count
- dry-run manifest preview item count
- dry-run preview status counts
- duplicate ID count
- missing required field count
- dry-run preview items
- blocked reason summary
- recommended owner actions
- next safe actions
- `metadata_write_allowed: false`
- `manifest_write_allowed: false`
- `manifest_file_created: false`
- `manifest_export_allowed: false`
- `creation_dry_run_performed`
- `public_ready: false`
- `publish_track: blocked`

Dry-run review statuses:

- `dry_run_preview_ok`
- `needs_owner_review`
- `incomplete_dry_run`
- `blocked_dry_run`

## Safety Boundary

This phase is review-only. It does not:

- write production manifests
- create draft manifest files
- create fixture manifest files
- export manifests
- import manifests
- write manifests
- save manifests
- persist manifests
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

Required validation for this phase includes:

```bash
npm run check
npm run ai:real-footage-source-draft-manifest-creation-review:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

The Phase 2J.19 smoke output reports:

- `reviewed_gate_items`
- `dry_run_manifest_preview_items`
- `dry_run_preview_ok_count`
- `needs_owner_review_count`
- `incomplete_dry_run_count`
- `blocked_dry_run_count`
- `duplicate_id_count`
- `missing_required_field_count`
- `blocked_reasons_count`
- `metadata_write_allowed_count`
- `manifest_write_allowed_count`
- `manifest_file_created_count`
- `manifest_export_allowed_count`
- `creation_dry_run_performed_count`
- `recommended_owner_actions_count`

`creation_dry_run_performed` means in-memory simulation only. It does not create, write, import, export, save, or persist a manifest.

## Recommended Next Phase

```text
Phase 2J.20 Real Footage Source Folder Draft Manifest Creation Dry-Run Approval Gate
```
