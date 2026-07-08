# Real Footage Source Folder Fixture Manifest Write Dry-Run Approval Gate

Phase 2J.23 adds a fixture-only approval gate for Phase 2J.22 in-memory write-plan review rows.

Despite the name, this phase is approval-gate only. It does not create fixture manifest files, perform fixture manifest writes, create draft manifest files, write production manifests, export manifests, import manifests, write manifests, save manifests, persist manifests, write real metadata stores, mutate storage folders, render outputs, publish packages, evidence logs, or checklist closeouts.

## Inputs

- Phase 2J.22 fixture manifest write dry-run review output.
- Controlled approval fixture: `packages/content-engine/fixtures/source-folder-fixture-manifest-write-dry-run-approval-gate-smoke.json`.
- Safe repo fixture flow only through Phase 2J.12 through Phase 2J.22.

The only source flow eligible for approval review remains:

```text
packages/content-engine/fixtures/read-only-intake-sample/
```

## Approval Statuses

Approval items emit one of:

- `approved_for_future_fixture_manifest_file_creation_gate`
- `needs_owner_review`
- `incomplete_approval`
- `blocked_approval`

Only `write_plan_ok` source rows with explicit owner approval and the exact future gate scope may become `approved_for_future_fixture_manifest_file_creation_gate`.

Rows with `needs_owner_review`, `incomplete_write_plan`, `blocked_write_plan`, duplicate IDs, risky flags, unsafe paths, or denied actions are not upgraded.

## Safety Flags

- `metadata_write_allowed` is always `false`.
- `manifest_write_allowed` is always `false`.
- `fixture_manifest_file_created` is always `false`.
- `fixture_manifest_write_performed` is always `false`.
- `production_manifest_write_allowed` is always `false`.
- `manifest_export_allowed` is always `false`.
- `public_ready` is always `false`.
- `publish_track` is always `blocked`.

`fixture_manifest_write_allowed` remains inherited future dry-run eligibility only.

`fixture_manifest_file_creation_gate_allowed` may be `true` only as future eligibility for a later gate. It does not create or write a fixture manifest file.

## Smoke

Run:

```bash
npm run ai:real-footage-source-fixture-manifest-write-approval:smoke
```

Expected safety result:

- provider: `fake_content_engine`
- reviewed write plan items: at least `5`
- approved for future fixture manifest file creation gate count: at least `1`
- needs owner review count: at least `1`
- incomplete approval count: at least `1`
- blocked approval count: at least `1`
- duplicate ID findings count: at least `1`
- metadata write allowed count: `0`
- manifest write allowed count: `0`
- fixture manifest file created count: `0`
- fixture manifest write performed count: `0`
- production manifest write allowed count: `0`
- manifest export allowed count: `0`
- public ready: `false`
- public ready count: `0`
- publish track: `blocked`

## Explicit Non-Goals

Phase 2J.23 is not:

- fixture manifest file creation
- fixture manifest write execution
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
