# Phase 2J.25 Real Footage Source Folder Fixture Manifest File Creation Dry-Run Review

## Summary

Phase 2J.25 adds a fixture-only dry-run review layer for Phase 2J.24 file creation gate output. It builds an in-memory file creation plan and manifest preview object for review only.

This phase does not create, write, import, export, persist, or save any manifest file.

## Implementation

- Utility: `packages/content-engine/src/source-folder-fixture-manifest-file-creation-dry-run-review.ts`
- Fixture: `packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-review-smoke.json`
- Smoke: `scripts/real-footage-source-fixture-manifest-file-creation-dry-run-review-smoke.mjs`
- Command: `npm run ai:real-footage-source-fixture-manifest-file-creation-review:smoke`

## Review Rules

`file_creation_plan_ok` requires:

- safe fixture source flow only
- `dry_run: true`
- `read_only: true`
- source file creation gate status `eligible_for_fixture_manifest_file_creation_dry_run`
- target fixture manifest path present as a safe repo fixture path string
- no duplicate suggested footage ID issue
- no risky flags
- required metadata present
- no denied action

Other outcomes:

- `needs_owner_review` for otherwise eligible rows that need owner/manual confirmation.
- `incomplete_file_creation_plan` for missing required metadata or missing/unsafe target path.
- `blocked_file_creation_plan` for blocked upstream gate rows, duplicate IDs, risky flags, unsafe paths, or denied actions.

The smoke reports a transient `in_memory_manifest_preview`. It is not persisted and it does not create or write a file.
The smoke also reports `in_memory_manifest_preview_count`, `in_memory_manifest_preview_persisted_count`, and `in_memory_manifest_preview_item_count` so the review-only behavior is directly auditable.

## Safety

The following remain false:

- `metadata_write_allowed`
- `manifest_write_allowed`
- `fixture_manifest_file_created`
- `fixture_manifest_write_performed`
- `fixture_manifest_file_creation_performed`
- `production_manifest_write_allowed`
- `manifest_export_allowed`
- `public_ready`

`publish_track` remains `blocked`.

`fixture_manifest_file_creation_dry_run_allowed` is inherited future dry-run review eligibility only and does not create a file.

## Validation

Required smoke:

```bash
npm run ai:real-footage-source-fixture-manifest-file-creation-review:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

## Non-Goals

This phase does not:

- create fixture manifest files
- perform fixture manifest writes
- perform fixture manifest file creation
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
