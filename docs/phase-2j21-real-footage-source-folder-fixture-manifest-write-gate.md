# Phase 2J.21 Real Footage Source Folder Fixture Manifest Write Gate

## Summary

Phase 2J.21 adds a fixture manifest write gate for Phase 2J.20 approved-for-future fixture manifest write gate rows. The gate approves only future fixture manifest write dry-run eligibility, and it does not create, write, export, import, save, persist, or mutate any manifest file.

## Implementation

- Fixture manifest write gate utility: `packages/content-engine/src/source-folder-fixture-manifest-write-gate.ts`
- Fixture manifest write gate fixture: `packages/content-engine/fixtures/source-folder-fixture-manifest-write-gate-smoke.json`
- Smoke script: `scripts/real-footage-source-fixture-manifest-write-gate-smoke.mjs`
- NPM command: `npm run ai:real-footage-source-fixture-manifest-write-gate:smoke`

The gate fixture references the Phase 2J.20 creation dry-run approval gate fixture and the safe fixture flow through Phase 2J.12 through Phase 2J.19.

Only `approved_for_future_fixture_manifest_write_gate` rows from the approved safe repo fixture flow may become `eligible_for_fixture_manifest_write_dry_run`.

## Output Model

The fixture manifest write gate result includes:

- fixture manifest write gate identity
- source identity and root
- dry-run/read-only flags
- source creation approval status
- reviewed creation approval item count
- write gate status counts
- write gate items
- write policy findings
- duplicate ID findings
- missing required field count
- missing approval fields
- blocked reason summary
- denied action summary
- recommended owner actions
- next safe actions
- `metadata_write_allowed: false`
- `manifest_write_allowed: false`
- `fixture_manifest_write_allowed`
- `fixture_manifest_file_created: false`
- `production_manifest_write_allowed: false`
- `manifest_export_allowed: false`
- `public_ready: false`
- `publish_track: blocked`

Write gate statuses:

- `eligible_for_fixture_manifest_write_dry_run`
- `needs_owner_review`
- `incomplete_write_gate`
- `blocked_write_gate`

## Safety Boundary

This phase is gate-only. It does not:

- create fixture manifest files
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

Real-looking paths appear only as blocked metadata strings or safety documentation.

## Validation

Required validation for this phase includes:

```bash
npm run check
npm run ai:real-footage-source-fixture-manifest-write-gate:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

The Phase 2J.21 smoke output reports:

- `fixture_manifest_write_gate_cases`
- `reviewed_creation_approval_items`
- `eligible_for_fixture_manifest_write_dry_run_count`
- `needs_owner_review_count`
- `incomplete_write_gate_count`
- `blocked_write_gate_count`
- `duplicate_id_findings_count`
- `missing_required_field_count`
- `missing_approval_fields_count`
- `blocked_reasons_count`
- `denied_action_count`
- `metadata_write_allowed_count`
- `manifest_write_allowed_count`
- `fixture_manifest_write_allowed`
- `fixture_manifest_write_allowed_count`
- `fixture_manifest_file_created_count`
- `production_manifest_write_allowed_count`
- `manifest_export_allowed_count`
- `recommended_owner_actions_count`
- `public_ready_count`

`fixture_manifest_write_allowed` means future dry-run eligibility only. It does not create, write, import, export, save, or persist a manifest.

## Recommended Next Phase

```text
Phase 2J.22 Real Footage Source Folder Fixture Manifest Write Dry-Run Review
```
