# Phase 2J.20 Real Footage Source Folder Draft Manifest Creation Dry-Run Approval Gate

## Summary

Phase 2J.20 adds an approval gate for Phase 2J.19 in-memory draft manifest creation dry-run review rows. The gate approves only future fixture manifest-write gate review eligibility, and it does not create, write, export, import, save, persist, or mutate any manifest file.

## Implementation

- Draft manifest creation dry-run approval gate utility: `packages/content-engine/src/source-folder-draft-manifest-creation-dry-run-approval-gate.ts`
- Draft manifest creation dry-run approval gate fixture: `packages/content-engine/fixtures/source-folder-draft-manifest-creation-dry-run-approval-gate-smoke.json`
- Smoke script: `scripts/real-footage-source-draft-manifest-creation-dry-run-approval-gate-smoke.mjs`
- NPM command: `npm run ai:real-footage-source-draft-manifest-creation-approval:smoke`

The approval gate fixture references the Phase 2J.19 review fixture, the Phase 2J.18 creation dry-run gate fixture, and the safe fixture flow through Phase 2J.12 through Phase 2J.17.

Only `dry_run_preview_ok` rows from the approved safe repo fixture flow may become `approved_for_future_fixture_manifest_write_gate`.

## Output Model

The draft manifest creation dry-run approval gate result includes:

- creation review approval gate identity
- source identity and root
- dry-run/read-only flags
- reviewed dry-run item count
- approval status counts
- approval items
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
- `fixture_manifest_write_gate_allowed`
- `public_ready: false`
- `publish_track: blocked`

Approval statuses:

- `approved_for_future_fixture_manifest_write_gate`
- `needs_owner_review`
- `incomplete_approval`
- `blocked_approval`

## Safety Boundary

This phase is approval-gate-only. It does not:

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
npm run ai:real-footage-source-draft-manifest-creation-approval:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

The Phase 2J.20 smoke output reports:

- `reviewed_dry_run_items`
- `approved_for_future_fixture_manifest_write_gate_count`
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
- `fixture_manifest_write_gate_allowed`
- `fixture_manifest_write_gate_allowed_count`
- `recommended_owner_actions_count`

`fixture_manifest_write_gate_allowed` means future gate eligibility only. It does not create, write, import, export, save, or persist a manifest.

## Recommended Next Phase

```text
Phase 2J.21 Real Footage Source Folder Fixture Manifest Write Gate
```
