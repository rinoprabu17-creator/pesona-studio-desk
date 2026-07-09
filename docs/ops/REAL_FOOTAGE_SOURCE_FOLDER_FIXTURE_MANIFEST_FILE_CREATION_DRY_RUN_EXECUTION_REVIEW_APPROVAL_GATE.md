# Real Footage Source Folder Fixture Manifest File Creation Dry-Run Execution Review Approval Gate

Phase 2J.29 adds a fixture-only approval gate for Phase 2J.28 in-memory execution review rows.

Despite the name, this phase is still approval-gate only. It does not create fixture manifest files, perform fixture manifest writes, perform fixture manifest file creation, execute fixture manifest file creation, persist execution review output, create draft manifest files, write production manifests, export manifests, import manifests, write manifests, save manifests, persist manifests, write real metadata stores, mutate storage folders, render outputs, upload, publish, create publish packages, mutate evidence logs, or mutate checklist closeouts.

## Inputs

- Phase 2J.28 fixture manifest file creation dry-run execution review output.
- Controlled approval gate fixture: `packages/content-engine/fixtures/source-folder-fixture-manifest-file-creation-dry-run-execution-review-approval-gate-smoke.json`.
- Safe repo fixture flow only through Phase 2J.12 through Phase 2J.28.

The only source flow eligible for approval remains:

```text
packages/content-engine/fixtures/read-only-intake-sample/
```

## Approval Statuses

Approval items emit one of:

- `approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate`
- `needs_owner_review`
- `incomplete_approval`
- `blocked_approval`

Only Phase 2J.28 rows with `execution_review_ok`, safe fixture source flow, `dry_run: true`, `read_only: true`, explicit owner approval, a matching future execution-gate review approval scope, safe fixture target path string, required metadata, no duplicate ID issue, no risky flags, and no denied action may become `approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate`.

Rows with upstream `needs_owner_review`, `incomplete_execution_review`, `blocked_execution_review`, duplicate IDs, risky flags, unsafe paths, missing target paths, or denied actions are not upgraded.

## Future Eligibility Only

`fixture_manifest_file_creation_dry_run_execution_gate_allowed` means a later phase may review the approved row for a future dry-run execution gate. It is not execution.

Inherited flags remain future eligibility only:

- `fixture_manifest_write_allowed`
- `fixture_manifest_file_creation_gate_allowed`
- `fixture_manifest_file_creation_dry_run_allowed`
- `fixture_manifest_file_creation_execution_gate_allowed`
- `fixture_manifest_file_creation_dry_run_execution_review_allowed`

## Safety Flags

- `metadata_write_allowed` is always `false`.
- `manifest_write_allowed` is always `false`.
- `fixture_manifest_file_created` is always `false`.
- `fixture_manifest_write_performed` is always `false`.
- `fixture_manifest_file_creation_performed` is always `false`.
- `fixture_manifest_file_creation_execution_performed` is always `false`.
- `fixture_manifest_execution_review_persisted` is always `false`.
- `production_manifest_write_allowed` is always `false`.
- `manifest_export_allowed` is always `false`.
- `public_ready` is always `false`.
- `publish_track` is always `blocked`.

## Smoke

Run:

```bash
npm run ai:real-footage-source-fixture-manifest-file-creation-execution-review-approval:smoke
```

Expected safety result:

- provider: `fake_content_engine`
- reviewed execution review items: at least `5`
- approved for future fixture manifest file creation dry-run execution gate count: at least `1`
- needs owner review count: at least `1`
- incomplete approval count: at least `1`
- blocked approval count: at least `1`
- duplicate ID findings count: at least `1`
- metadata write allowed count: `0`
- manifest write allowed count: `0`
- fixture manifest file created count: `0`
- fixture manifest write performed count: `0`
- fixture manifest file creation performed count: `0`
- fixture manifest file creation execution performed count: `0`
- fixture manifest execution review persisted count: `0`
- production manifest write allowed count: `0`
- manifest export allowed count: `0`
- public ready: `false`
- public ready count: `0`
- publish track: `blocked`

## Explicit Non-Goals

Phase 2J.29 is not:

- fixture manifest file creation
- fixture manifest write execution
- fixture manifest file creation performed
- fixture manifest file creation gate execution
- fixture manifest file creation execution gate execution
- fixture manifest file creation execution performed
- persisted fixture manifest execution review
- draft manifest file creation
- production manifest file creation or write
- manifest import/export/write/save/persist
- metadata import/write
- real metadata store mutation
- real media folder scan
- real file stat/walk against actual storage
- actual SSD, Google Drive, storage, production media, backup, render, upload, or publish folder access
- media content opening
- media decoding
- FFmpeg execution
- rendering
- upload
- publishing
- publish package creation
- evidence log or checklist closeout mutation
- migration
- server or Docker Compose operation
