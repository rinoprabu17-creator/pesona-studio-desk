# Phase 2J.28 Real Footage Source Folder Fixture Manifest File Creation Dry-Run Execution Review

## Summary

Phase 2J.28 adds a fixture-only execution review layer for Phase 2J.27 eligible fixture manifest file creation dry-run execution gate rows. It builds only an in-memory execution review result for later owner approval.

This phase does not execute file creation and does not create, write, import, export, persist, or save any manifest file.

## Implementation

- Utility: `packages/content-engine/src/source-folder-fixture-manifest-file-creation-dry-run-execution-review.ts`
- Fixture: `packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-review-smoke.json`
- Smoke: `scripts/real-footage-source-fixture-manifest-file-creation-dry-run-execution-review-smoke.mjs`
- Command: `npm run ai:real-footage-source-fixture-manifest-file-creation-execution-review:smoke`

## Review Rules

`execution_review_ok` requires:

- safe fixture source flow only
- `dry_run: true`
- `read_only: true`
- source execution gate status `eligible_for_fixture_manifest_file_creation_dry_run_execution_review`
- target fixture manifest path present as a safe repo fixture path string
- no duplicate suggested footage ID issue
- no risky flags
- required metadata present
- no denied action

Other outcomes:

- `needs_owner_review` for otherwise eligible items needing owner/manual confirmation.
- `incomplete_execution_review` for missing required metadata or missing/unsafe target path.
- `blocked_execution_review` for duplicate ID, blocked upstream execution gate, risky flags, unsafe source, or requested write/import/export/render/upload/publish actions.

## Safety

The following remain false:

- `metadata_write_allowed`
- `manifest_write_allowed`
- `fixture_manifest_file_created`
- `fixture_manifest_write_performed`
- `fixture_manifest_file_creation_performed`
- `fixture_manifest_file_creation_execution_performed`
- `fixture_manifest_execution_review_persisted`
- `production_manifest_write_allowed`
- `manifest_export_allowed`
- `public_ready`

`publish_track` remains `blocked`.

`in_memory_execution_preview` is review evidence only. It is not persisted, and it does not execute a gate, create a file, write a manifest, export a manifest, import a manifest, or persist a manifest.

The smoke output reports both `in_memory_execution_preview_count` and `in_memory_execution_preview_persisted_count`; persisted preview count must remain `0`.

## Validation

Required smoke:

```bash
npm run ai:real-footage-source-fixture-manifest-file-creation-execution-review:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

## Non-Goals

This phase does not:

- create fixture manifest files
- perform fixture manifest writes
- perform fixture manifest file creation
- execute fixture manifest file creation gates
- execute fixture manifest file creation execution gates
- execute fixture manifest file creation
- persist fixture manifest execution review output
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
