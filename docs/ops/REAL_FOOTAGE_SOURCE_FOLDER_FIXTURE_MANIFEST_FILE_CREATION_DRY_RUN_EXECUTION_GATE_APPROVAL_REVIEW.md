# Real Footage Source Folder Fixture Manifest File Creation Dry-Run Execution Gate Approval Review

Phase 2J.32 adds a controlled fixture-only, in-memory review layer for Phase 2J.31 execution gate review approval rows. The review decides whether any `approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review` item can become `execution_gate_approval_review_ok` for a later approval stage.

This phase does not execute a gate, create a fixture manifest file, perform fixture manifest writes, persist execution gate approval review output, import/export/write manifests, mutate metadata, scan real media folders, open media streams, decode media, render, upload, publish, or set `public_ready` true.

## Smoke Command

```bash
npm run ai:real-footage-source-fixture-manifest-file-creation-execution-gate-approval-review:smoke
```

## Controlled Fixture Flow

- Utility: `packages/content-engine/src/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-approval-review.ts`
- Fixture: `packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-approval-review-smoke.json`
- Source dependency: `packages/content-engine/src/source-folder-fixture-manifest-file-creation-dry-run-execution-gate-review-approval-gate.ts`
- Only safe repo fixture rows from `packages/content-engine/fixtures/read-only-intake-sample/` may be reviewed.
- Only Phase 2J.31 `approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review` rows may become `execution_gate_approval_review_ok`.

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
- `fixture_manifest_execution_gate_approval_review_persisted` is always `false`.
- `production_manifest_write_allowed` is always `false`.
- `manifest_export_allowed` is always `false`.
- `public_ready` is always `false`.
- `publish_track` is always `blocked`.

`in_memory_execution_gate_approval_review_preview` is review-only evidence and is not persisted. Approval review here means future review eligibility only. It is not fixture manifest file creation, fixture manifest write performed, fixture manifest file creation gate execution, fixture manifest file creation execution gate execution, fixture manifest file creation execution performed, draft manifest file creation, production manifest write, manifest export/import/write, metadata import/write, rendering, upload, publishing, or real storage/media access.
