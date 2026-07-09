# Phase 2J.27 Real Footage Source Folder Fixture Manifest File Creation Dry-Run Execution Gate

## Summary

Phase 2J.27 adds a fixture-only execution gate for Phase 2J.26 approved fixture manifest file creation dry-run approval rows. It decides only whether a later fixture-manifest file creation dry-run execution review may evaluate an item.

This phase does not execute creation and does not create, write, import, export, persist, or save any manifest file.

## Implementation

- Utility: `packages/content-engine/src/source-folder-fixture-manifest-file-creation-dry-run-execution-gate.ts`
- Fixture: `packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-smoke.json`
- Smoke: `scripts/real-footage-source-fixture-manifest-file-creation-dry-run-execution-gate-smoke.mjs`
- Command: `npm run ai:real-footage-source-fixture-manifest-file-creation-execution-gate:smoke`

## Gate Rules

`eligible_for_fixture_manifest_file_creation_dry_run_execution_review` requires:

- safe fixture source flow only
- `dry_run: true`
- `read_only: true`
- source file creation approval status `approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate`
- explicit owner approval
- `approved_by` present
- `approved_at` present
- approval scope allowing future fixture-manifest file creation dry-run execution review only
- target fixture manifest path present as a safe repo fixture path string
- no duplicate suggested footage ID issue
- no risky flags
- required metadata present
- no denied action

Other outcomes:

- `needs_owner_review` for otherwise eligible items missing explicit owner approval for future execution review.
- `incomplete_execution_gate` for missing required fields, missing approval fields, or missing/unsafe target path.
- `blocked_execution_gate` for duplicate ID, blocked upstream approval, risky flags, unsafe source, or requested write/import/export/render/upload/publish actions.

## Safety

The following remain false:

- `metadata_write_allowed`
- `manifest_write_allowed`
- `fixture_manifest_file_created`
- `fixture_manifest_write_performed`
- `fixture_manifest_file_creation_performed`
- `fixture_manifest_file_creation_execution_performed`
- `production_manifest_write_allowed`
- `manifest_export_allowed`
- `public_ready`

`publish_track` remains `blocked`.

`fixture_manifest_file_creation_dry_run_execution_review_allowed` is future review eligibility only. It does not execute a gate, create a file, write a manifest, export a manifest, import a manifest, or persist a manifest.

## Validation

Required smoke:

```bash
npm run ai:real-footage-source-fixture-manifest-file-creation-execution-gate:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

## Non-Goals

This phase does not:

- create fixture manifest files
- perform fixture manifest writes
- perform fixture manifest file creation
- execute fixture manifest file creation gates
- execute fixture manifest file creation execution gates
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
