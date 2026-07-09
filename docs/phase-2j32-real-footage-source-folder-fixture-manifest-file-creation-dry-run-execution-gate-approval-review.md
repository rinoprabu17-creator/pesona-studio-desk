# Phase 2J.32 Real Footage Source Folder Fixture Manifest File Creation Dry-Run Execution Gate Approval Review

Phase 2J.32 consumes Phase 2J.31 execution gate review approval gate output and builds a fixture-only, in-memory approval review result for future fixture-manifest file creation dry-run execution gate approval review eligibility.

## Scope

- Adds `source-folder-fixture-manifest-file-creation-dry-run-execution-gate-approval-review.ts`.
- Adds a controlled smoke fixture for approved, owner-review, incomplete, duplicate, blocked upstream, denied action, and production-manifest-write metadata-only cases.
- Adds `npm run ai:real-footage-source-fixture-manifest-file-creation-execution-gate-approval-review:smoke`.
- Exports the utility from `packages/content-engine/src/index.ts`.

## Review Rules

`execution_gate_approval_review_ok` requires safe fixture source flow, dry-run/read-only mode, upstream `approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review`, safe repo fixture target path string, no duplicate ID issue, no risky flags, required metadata fields, and no denied action request.

Rows become `needs_owner_review`, `incomplete_execution_gate_approval_review`, or `blocked_execution_gate_approval_review` when manual confirmation is needed, required metadata/path fields are incomplete, upstream approval is not eligible, duplicate/risky/unsafe cases exist, or any write/import/export/render/upload/publish action is requested.

## Safety

This phase is review-only. It does not execute a gate, create or write fixture manifests, perform file creation, persist execution review, execution gate review, execution gate review approval, or execution gate approval review output, create draft or production manifests, mutate real metadata stores, scan real media folders, stat/walk actual storage, open/decode media, run FFmpeg, render, upload, publish, create a publish package, or set `public_ready` true.

The smoke output must keep metadata and manifest write counts at zero, all performed/persisted counts at zero, `in_memory_execution_gate_approval_review_preview_persisted_count: 0`, `public_ready: false`, and `publish_track: blocked`.

## Recommended Next Phase

Phase 2J.33 Real Footage Source Folder Fixture Manifest File Creation Dry-Run Execution Gate Approval Review Approval Gate.
