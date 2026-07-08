# Phase 2J.22 Real Footage Source Folder Fixture Manifest Write Dry-Run Review

## Summary

Phase 2J.22 adds a fixture manifest write dry-run review layer for Phase 2J.21 eligible fixture manifest write gate rows. The review builds an in-memory write-plan preview only, and it does not create, write, export, import, save, persist, or mutate any manifest file.

## Implementation

- Fixture manifest write dry-run review utility: `packages/content-engine/src/source-folder-fixture-manifest-write-dry-run-review.ts`
- Fixture manifest write dry-run review fixture: `packages/content-engine/fixtures/source-folder-fixture-manifest-write-dry-run-review-smoke.json`
- Smoke script: `scripts/real-footage-source-fixture-manifest-write-dry-run-review-smoke.mjs`
- NPM command: `npm run ai:real-footage-source-fixture-manifest-write-review:smoke`

The review fixture references the Phase 2J.21 fixture manifest write gate fixture and the safe fixture flow through Phase 2J.12 through Phase 2J.20.

Only `eligible_for_fixture_manifest_write_dry_run` rows from the approved safe repo fixture flow may become `write_plan_ok`.

## Output Model

The fixture manifest write dry-run review result includes:

- fixture manifest write dry-run review identity
- source identity and root
- dry-run/read-only flags
- source write gate status
- reviewed write gate item count
- write plan items
- write plan status counts
- duplicate ID count
- missing required field count
- blocked reason summary
- denied action summary
- recommended owner actions
- next safe actions
- `metadata_write_allowed: false`
- `manifest_write_allowed: false`
- `fixture_manifest_write_allowed`
- `fixture_manifest_file_created: false`
- `fixture_manifest_write_performed: false`
- `production_manifest_write_allowed: false`
- `manifest_export_allowed: false`
- `public_ready: false`
- `publish_track: blocked`

Write plan statuses:

- `write_plan_ok`
- `needs_owner_review`
- `incomplete_write_plan`
- `blocked_write_plan`

## Safety Boundary

This phase is review-only. It does not:

- create fixture manifest files
- perform fixture manifest writes
- create draft manifest files
- write production manifests
- create production manifest files
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

Real-looking paths appear only as blocked metadata strings or safety documentation. Target fixture manifest paths are strings for future planning only and are not created or written.

## Validation

Required validation for this phase includes:

```bash
npm run check
npm run ai:real-footage-source-fixture-manifest-write-review:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

The Phase 2J.22 smoke output reports:

- `fixture_manifest_write_dry_run_review_cases`
- `reviewed_write_gate_items`
- `write_plan_items`
- `write_plan_ok_count`
- `needs_owner_review_count`
- `incomplete_write_plan_count`
- `blocked_write_plan_count`
- `duplicate_id_count`
- `missing_required_field_count`
- `blocked_reasons_count`
- `denied_action_count`
- `metadata_write_allowed_count`
- `manifest_write_allowed_count`
- `fixture_manifest_write_allowed`
- `fixture_manifest_write_allowed_count`
- `fixture_manifest_file_created_count`
- `fixture_manifest_write_performed_count`
- `production_manifest_write_allowed_count`
- `manifest_export_allowed_count`
- `recommended_owner_actions_count`
- `public_ready_count`

`fixture_manifest_write_allowed` means inherited future dry-run eligibility only. It does not create, write, import, export, save, or persist a manifest.

## Recommended Next Phase

```text
Phase 2J.23 Real Footage Source Folder Fixture Manifest Write Dry-Run Approval Gate
```
