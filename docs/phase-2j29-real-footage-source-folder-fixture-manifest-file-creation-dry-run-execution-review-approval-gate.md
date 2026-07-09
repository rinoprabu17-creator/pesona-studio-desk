# Phase 2J.29 Real Footage Source Folder Fixture Manifest File Creation Dry-Run Execution Review Approval Gate

## Summary

Phase 2J.29 adds a fixture-only approval gate for Phase 2J.28 in-memory fixture manifest file creation dry-run execution review rows.

This phase only decides whether an `execution_review_ok` row is approved for a future fixture-manifest file creation dry-run execution gate review. It does not execute file creation and does not create, write, import, export, persist, save, or execute any manifest file.

## Implementation

- Utility: `packages/content-engine/src/source-folder-fixture-manifest-file-creation-dry-run-execution-review-approval-gate.ts`
- Fixture: `packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-review-approval-gate-smoke.json`
- Smoke: `scripts/real-footage-source-fixture-manifest-file-creation-dry-run-execution-review-approval-gate-smoke.mjs`
- Command: `npm run ai:real-footage-source-fixture-manifest-file-creation-execution-review-approval:smoke`

## Approval Rules

`approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate` requires:

- safe fixture source flow only
- `dry_run: true`
- `read_only: true`
- source execution review status `execution_review_ok`
- explicit approval record
- owner approval
- `approved_by`
- `approved_at`
- approval scope `future_fixture_manifest_file_creation_dry_run_execution_gate_review_only`
- safe repo fixture target path string
- no duplicate suggested footage ID issue
- no risky flags
- required metadata present
- no denied action

Other outcomes:

- `needs_owner_review` for rows that still require explicit owner/manual confirmation.
- `incomplete_approval` for incomplete approval metadata or upstream incomplete execution review rows.
- `blocked_approval` for blocked execution review rows, duplicate IDs, risky flags, unsafe source/path strings, or requested write/import/export/render/upload/publish actions.

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

Inherited future-eligibility flags remain planning metadata only:

- `fixture_manifest_write_allowed`
- `fixture_manifest_file_creation_gate_allowed`
- `fixture_manifest_file_creation_dry_run_allowed`
- `fixture_manifest_file_creation_execution_gate_allowed`
- `fixture_manifest_file_creation_dry_run_execution_review_allowed`

The new `fixture_manifest_file_creation_dry_run_execution_gate_allowed` flag means future execution gate review eligibility only. It does not execute a gate, create a file, write a manifest, export a manifest, import a manifest, or persist a manifest.

## Validation

Required smoke:

```bash
npm run ai:real-footage-source-fixture-manifest-file-creation-execution-review-approval:smoke
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
