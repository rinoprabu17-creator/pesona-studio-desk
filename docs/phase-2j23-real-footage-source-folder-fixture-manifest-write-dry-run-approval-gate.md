# Phase 2J.23 Real Footage Source Folder Fixture Manifest Write Dry-Run Approval Gate

## Summary

Phase 2J.23 adds a fixture-only approval gate for Phase 2J.22 write-plan review output. It decides whether rows may proceed to a future fixture-manifest file creation gate review.

Approval here means future eligibility only. This phase does not create, write, import, export, persist, or save any manifest file.

## Implementation

- Utility: `packages/content-engine/src/source-folder-fixture-manifest-write-dry-run-approval-gate.ts`
- Fixture: `packages/content-engine/fixtures/source-folder-fixture-manifest-write-dry-run-approval-gate-smoke.json`
- Smoke: `scripts/real-footage-source-fixture-manifest-write-dry-run-approval-gate-smoke.mjs`
- Command: `npm run ai:real-footage-source-fixture-manifest-write-approval:smoke`

## Gate Rules

`approved_for_future_fixture_manifest_file_creation_gate` requires:

- safe fixture source flow only
- `dry_run: true`
- `read_only: true`
- source write-plan status `write_plan_ok`
- approval record found
- owner approved
- `approved_by` present
- `approved_at` present
- approval scope exactly `future_fixture_manifest_file_creation_gate_review_only`
- no duplicate suggested footage ID issue
- no risky flags
- required metadata and target fixture manifest path present
- no denied action

Other outcomes:

- `needs_owner_review` for rows that need explicit owner approval.
- `incomplete_approval` for missing approval metadata.
- `blocked_approval` for blocked or incomplete upstream write plans, duplicate IDs, risky flags, unsafe paths, or denied actions.

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

`fixture_manifest_file_creation_gate_allowed` is future eligibility only and does not create a file.

## Validation

Required smoke:

```bash
npm run ai:real-footage-source-fixture-manifest-write-approval:smoke
```

The full Phase 2J smoke chain should remain green with fake provider output and blocked publish track.

## Non-Goals

This phase does not:

- create fixture manifest files
- perform fixture manifest writes
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
