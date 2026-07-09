# Real Footage Source Folder Fixture Manifest File Creation Dry-Run Execution Gate Review Approval Gate

Phase 2J.31 adds a controlled fixture-only approval gate for Phase 2J.30 in-memory execution gate review rows. The gate decides whether any `execution_gate_review_ok` item is approved for a future fixture-manifest file creation dry-run execution gate approval/review stage only.

This phase does not execute a gate, create a fixture manifest file, perform fixture manifest writes, persist execution gate review approval output, import/export/write manifests, mutate metadata, scan real media folders, open media streams, decode media, render, upload, publish, or set `public_ready` true.

## Smoke Command

```bash
npm run ai:real-footage-source-fixture-manifest-file-creation-execution-gate-review-approval:smoke
```

## Controlled Fixture Flow

- Utility: `packages/content-engine/src/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-review-approval-gate.ts`
- Fixture: `packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-review-approval-gate-smoke.json`
- Source dependency: `packages/content-engine/src/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-review.ts`
- Only safe repo fixture rows from `packages/content-engine/fixtures/read-only-intake-sample/` may be reviewed.
- Only Phase 2J.30 `execution_gate_review_ok` rows may become `approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review`.

## Required Safety Invariants

- `metadata_write_allowed` is always `false`.
- `manifest_write_allowed` is always `false`.
- `fixture_manifest_file_created` is always `false`.
- `fixture_manifest_write_performed` is always `false`.
- `fixture_manifest_file_creation_performed` is always `false`.
- `fixture_manifest_file_creation_execution_performed` is always `false`.
- `fixture_manifest_execution_review_persisted` is always `false`.
- `fixture_manifest_execution_gate_review_persisted` is always `false`.
- `fixture_manifest_execution_gate_review_approval_persisted` is always `false`.
- `production_manifest_write_allowed` is always `false`.
- `manifest_export_allowed` is always `false`.
- `public_ready` is always `false`.
- `publish_track` is always `blocked`.

Approval here means future approval/review eligibility only. It is not fixture manifest file creation, fixture manifest write performed, fixture manifest file creation gate execution, fixture manifest file creation execution gate execution, fixture manifest file creation execution performed, draft manifest file creation, production manifest write, manifest export/import/write, metadata import/write, rendering, upload, publishing, or real storage/media access.
