# Phase 2J.24 Real Footage Source Folder Fixture Manifest File Creation Gate

## Summary

Phase 2J.24 adds a fixture-only file creation gate for Phase 2J.23 approval output. It decides whether rows may proceed to a future fixture-manifest file creation dry-run review.

Eligibility here is future dry-run review only. This phase does not create, write, import, export, persist, or save any manifest file.

## Implementation

- Utility: `packages/content-engine/src/source-folder-fixture-manifest-file-creation-gate.ts`
- Fixture: `packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-gate-smoke.json`
- Smoke: `scripts/real-footage-source-fixture-manifest-file-creation-gate-smoke.mjs`
- Command: `npm run ai:real-footage-source-fixture-manifest-file-creation-gate:smoke`

## Gate Rules

`eligible_for_fixture_manifest_file_creation_dry_run` requires:

- safe fixture source flow only
- `dry_run: true`
- `read_only: true`
- source file creation approval status `approved_for_future_fixture_manifest_file_creation_gate`
- approval record found
- owner approved
- `approved_by` present
- `approved_at` present
- approval scope exactly `future_fixture_manifest_file_creation_dry_run_review_only`
- target fixture manifest path present as a safe repo fixture path string
- no duplicate suggested footage ID issue
- no risky flags
- required metadata present
- no denied action

Other outcomes:

- `needs_owner_review` for rows that need explicit owner approval.
- `incomplete_file_creation_gate` for missing required fields, missing approval metadata, or missing/unsafe target path.
- `blocked_file_creation_gate` for blocked upstream approval, duplicate IDs, risky flags, unsafe paths, or denied actions.

The smoke reports `missing_required_field_count` from explicit per-item `missing_required_fields`; it is not inferred from file access or manifest writes.

## Safety

The following remain false:

- `metadata_write_allowed`
- `manifest_write_allowed`
- `fixture_manifest_file_created`
- `fixture_manifest_write_performed`
- `production_manifest_write_allowed`
- `manifest_export_allowed`
- `public_ready`

`publish_track` remains `blocked`.

`fixture_manifest_file_creation_dry_run_allowed` is future dry-run review eligibility only and does not create a file.

## Validation

Required smoke:

```bash
npm run ai:real-footage-source-fixture-manifest-file-creation-gate:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

## Non-Goals

This phase does not:

- create fixture manifest files
- perform fixture manifest writes
- execute a fixture manifest file creation gate
- create draft manifest files
- create or write production manifest files
- import/export/write/save/persist manifests
- import/write metadata
- mutate real metadata stores
- access real storage paths
- scan real media folders
- open or decode media
- render video
- upload
- publish
- create publish packages
- mutate env, secrets, credentials, evidence logs, checklist closeouts, migrations, backups, restore state, or cutover state
