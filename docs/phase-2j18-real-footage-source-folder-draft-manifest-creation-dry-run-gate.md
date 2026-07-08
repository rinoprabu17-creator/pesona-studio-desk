# Phase 2J.18 Real Footage Source Folder Draft Manifest Creation Dry-Run Gate

## Summary

Phase 2J.18 adds a conservative draft manifest creation dry-run gate for Phase 2J.17 approved future-manifest rows. The gate allows eligible fixture rows to enter a later dry-run review phase only, and it does not create, write, export, import, save, persist, or mutate any manifest file.

## Implementation

- Draft manifest creation dry-run gate utility: `packages/content-engine/src/source-folder-draft-manifest-creation-dry-run-gate.ts`
- Draft manifest creation dry-run gate fixture: `packages/content-engine/fixtures/source-folder-draft-manifest-creation-dry-run-gate-smoke.json`
- Smoke script: `scripts/real-footage-source-draft-manifest-creation-dry-run-gate-smoke.mjs`
- NPM command: `npm run ai:real-footage-source-draft-manifest-creation-gate:smoke`

The creation dry-run gate fixture references:

```text
packages/content-engine/fixtures/source-folder-draft-manifest-approval-gate-smoke.json
packages/content-engine/fixtures/source-folder-draft-manifest-review-smoke.json
packages/content-engine/fixtures/source-folder-metadata-enrichment-approval-gate-smoke.json
packages/content-engine/fixtures/source-folder-metadata-enrichment-review-smoke.json
packages/content-engine/fixtures/source-folder-listing-review-smoke.json
packages/content-engine/fixtures/source-folder-listing-approval-gate-smoke.json
```

Only `approved_for_future_manifest_creation` rows from the approved safe repo fixture flow may become `eligible_for_creation_dry_run`.

## Output Model

The draft manifest creation dry-run gate result includes:

- creation gate identity
- source identity and root
- dry-run/read-only flags
- source approval status
- reviewed approval item count
- creation gate item counts
- creation gate items
- creation policy findings
- duplicate ID findings
- missing required field count
- missing approval fields
- blocked reason summary
- denied action summary
- recommended owner actions
- next safe actions
- `metadata_write_allowed: false`
- `manifest_write_allowed: false`
- `manifest_file_created: false`
- `manifest_export_allowed: false`
- `creation_dry_run_allowed`
- `public_ready: false`
- `publish_track: blocked`

Creation gate statuses:

- `eligible_for_creation_dry_run`
- `needs_owner_review`
- `incomplete_creation_gate`
- `blocked_creation_gate`

## Safety Boundary

This phase is gate-only. It does not:

- write production manifests
- create draft manifest files
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

Required validation for the phase includes:

```bash
npm run check
npm run ai:real-footage-source-draft-manifest-creation-gate:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

The Phase 2J.18 smoke output reports:

- `eligible_for_creation_dry_run_count`
- `needs_owner_review_count`
- `incomplete_creation_gate_count`
- `blocked_creation_gate_count`
- `duplicate_id_findings_count`
- `missing_required_field_count`
- `missing_approval_fields_count`
- `blocked_reasons_count`
- `denied_action_count`
- `metadata_write_allowed_count`
- `manifest_write_allowed_count`
- `manifest_file_created_count`
- `manifest_export_allowed_count`
- `creation_dry_run_allowed`
- `creation_dry_run_allowed_count`
- `recommended_owner_actions_count`

Creation dry-run eligibility remains separate from actual draft manifest creation. The fixture intentionally includes duplicate-ID and denied-action records to verify blocking without creating, writing, importing, exporting, saving, or persisting any manifest.

The smoke currently reports `reviewed_approval_items: 12`. That count is valid because the Phase 2J.18 fixture starts from the 10 Phase 2J.17 manifest preview approval items and adds two additional creation-gate approval scenarios for the same approved future-manifest item. Those extra records exercise missing-owner and incomplete creation-dry-run approval states only; they are not draft manifest rows and do not create or persist a manifest.

## Recommended Next Phase

```text
Phase 2J.19 Real Footage Source Folder Draft Manifest Creation Dry-Run Review
```
