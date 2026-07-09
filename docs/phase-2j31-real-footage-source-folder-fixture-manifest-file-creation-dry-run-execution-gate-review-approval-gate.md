# Phase 2J.31 Real Footage Source Folder Fixture Manifest File Creation Dry-Run Execution Gate Review Approval Gate

Phase 2J.31 consumes Phase 2J.30 in-memory execution gate review output and builds a fixture-only approval gate for future fixture-manifest file creation dry-run execution gate approval/review eligibility.

## Scope

- Adds `source-folder-fixture-manifest-file-creation-dry-run-execution-gate-review-approval-gate.ts`.
- Adds a controlled smoke fixture for approved, owner-review, incomplete, duplicate, blocked upstream, denied action, and production-manifest-write metadata-only cases.
- Adds `npm run ai:real-footage-source-fixture-manifest-file-creation-execution-gate-review-approval:smoke`.
- Exports the utility from `packages/content-engine/src/index.ts`.

## Gate Rules

`approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review` requires safe fixture source flow, dry-run/read-only mode, upstream `execution_gate_review_ok`, explicit owner approval, complete approval metadata, correct approval scope, safe repo fixture target path string, no duplicate ID issue, no risky flags, required metadata fields, and no denied action request.

Rows become `needs_owner_review`, `incomplete_approval`, or `blocked_approval` when explicit owner approval is missing, approval fields are incomplete, upstream review is not eligible, duplicate/risky/unsafe cases exist, or any write/import/export/render/upload/publish action is requested.

## Safety

This phase is approval-gate only. It does not execute the gate, create or write fixture manifests, perform file creation, persist execution review or execution gate review approval output, create draft or production manifests, mutate real metadata stores, scan real media folders, stat/walk actual storage, open/decode media, run FFmpeg, render, upload, publish, create a publish package, or set `public_ready` true.

The smoke output must keep metadata and manifest write counts at zero, all performed/persisted counts at zero, `public_ready: false`, and `publish_track: blocked`.

## Recommended Next Phase

Phase 2J.32 Real Footage Source Folder Fixture Manifest File Creation Dry-Run Execution Gate Approval Review.
