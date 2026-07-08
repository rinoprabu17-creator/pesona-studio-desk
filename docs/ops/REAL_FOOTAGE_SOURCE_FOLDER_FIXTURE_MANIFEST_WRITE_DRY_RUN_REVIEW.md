# Real Footage Source Folder Fixture Manifest Write Dry-Run Review

Phase: 2J.22

## Purpose

This document defines the fixture-only manifest write dry-run review. The review consumes Phase 2J.21 fixture manifest write gate output and builds an in-memory write-plan review only.

Despite the name, this phase is review-only. It does not create fixture manifest files, draft manifest files, production manifest files, export manifests, import manifests, write manifests, save manifests, persist manifests, write real metadata stores, mutate storage folders, render outputs, publish packages, evidence logs, or checklist closeouts.

## Allowed Input

Allowed source flow:

```text
Phase 2J.12 listing approval gate
Phase 2J.13 listing review
Phase 2J.14 metadata enrichment review
Phase 2J.15 metadata enrichment approval gate
Phase 2J.16 draft manifest review
Phase 2J.17 draft manifest approval gate
Phase 2J.18 draft manifest creation dry-run gate
Phase 2J.19 draft manifest creation dry-run review
Phase 2J.20 draft manifest creation dry-run approval gate
Phase 2J.21 fixture manifest write gate
packages/content-engine/fixtures/read-only-intake-sample/
```

Denied upstream cases are not upgraded. Denied source/listing/enrichment/draft-manifest/creation-gate/creation-review/creation-approval/write-gate cases produce zero write-plan approvals for file creation.

## Write Plan Statuses

Write plan item statuses:

- `write_plan_ok`
- `needs_owner_review`
- `incomplete_write_plan`
- `blocked_write_plan`

`write_plan_ok` means the row is acceptable for in-memory write-plan review only. It does not mean fixture manifest file creation, draft manifest file creation, production manifest write approval, manifest write approval, manifest export approval, manifest import approval, metadata import approval, metadata write approval, render readiness, public readiness, upload approval, or publishing approval.

## Conservative Review Rules

In-memory write-plan OK requires:

- safe fixture source flow only
- dry-run mode
- read-only mode
- Phase 2J.21 source write gate status `eligible_for_fixture_manifest_write_dry_run`
- no duplicate suggested footage ID issue
- no privacy, placeholder, unrelated, suspicious, non-media, or unsafe risk flags
- product family, visual type, process stage, orientation, filename, and relative path present
- target fixture manifest path is a safe repo fixture path string only
- no denied requested action

`fixture_manifest_write_allowed` may be `true` only as inherited future dry-run eligibility. It does not create, write, export, import, save, or persist any manifest.

`fixture_manifest_write_performed` is always `false`.

`fixture_manifest_file_created` is always `false`.

`metadata_write_allowed` is always `false`.

`manifest_write_allowed` is always `false`.

`production_manifest_write_allowed` is always `false`.

`manifest_export_allowed` is always `false`.

`public_ready` is always `false`.

`publish_track` is always `blocked`.

## Smoke Command

```bash
npm run ai:real-footage-source-fixture-manifest-write-review:smoke
```

Expected controlled result:

- provider: `fake_content_engine`
- fixture manifest write dry-run review cases: at least `1`
- reviewed write gate items: at least `5`
- write plan items: at least `1`
- write plan OK count: at least `1`
- needs owner review count: at least `1`
- incomplete write plan count: at least `1`
- blocked write plan count: at least `1`
- duplicate ID count: at least `1`
- metadata write allowed count: `0`
- manifest write allowed count: `0`
- fixture manifest file created count: `0`
- fixture manifest write performed count: `0`
- production manifest write allowed count: `0`
- manifest export allowed count: `0`
- public ready count: `0`
- publish track: `blocked`

## Explicit Non-Goals

Phase 2J.22 is not:

- fixture manifest file creation
- fixture manifest write performed
- draft manifest file creation
- production manifest file creation or write
- manifest export
- manifest import
- manifest write
- manifest save
- manifest persistence
- real metadata store mutation
- metadata import
- metadata write
- real media folder scan
- file stat/walk against actual storage
- actual SSD access
- Google Drive access
- storage, production, backup, render, upload, or publish folder access
- file content open
- media decoding
- FFmpeg execution
- rendering
- upload
- publishing
- publish package creation
- evidence log mutation
- checklist closeout mutation
- server command
- Docker Compose command
