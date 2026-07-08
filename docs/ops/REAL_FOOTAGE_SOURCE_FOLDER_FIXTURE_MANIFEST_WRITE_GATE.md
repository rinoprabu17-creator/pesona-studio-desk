# Real Footage Source Folder Fixture Manifest Write Gate

Phase: 2J.21

## Purpose

This document defines the fixture-only manifest write gate. The gate consumes Phase 2J.20 creation dry-run approval output and decides whether approved rows may enter a future fixture manifest write dry-run review.

Despite the name, this phase is a gate only. It does not create fixture manifest files, draft manifest files, production manifest files, export manifests, import manifests, write manifests, save manifests, persist manifests, write real metadata stores, mutate storage folders, render outputs, publish packages, evidence logs, or checklist closeouts.

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
packages/content-engine/fixtures/read-only-intake-sample/
```

Denied upstream cases are not upgraded. Denied source/listing/enrichment/draft-manifest/creation-gate/creation-review/creation-approval cases produce zero write-gate items.

## Write Gate Statuses

Write gate item statuses:

- `eligible_for_fixture_manifest_write_dry_run`
- `needs_owner_review`
- `incomplete_write_gate`
- `blocked_write_gate`

`eligible_for_fixture_manifest_write_dry_run` means an item may be reviewed by a later fixture manifest write dry-run phase. It does not mean fixture manifest file creation, draft manifest file creation, production manifest write approval, manifest write approval, manifest export approval, manifest import approval, metadata import approval, metadata write approval, visual quality approval, true duration approval, codec compatibility, render readiness, public readiness, upload approval, or publishing approval.

## Conservative Gate Rules

Future fixture manifest write dry-run eligibility requires:

- safe fixture source flow only
- dry-run mode
- read-only mode
- Phase 2J.20 source creation approval status `approved_for_future_fixture_manifest_write_gate`
- approval record found
- owner approved
- approved by present
- approved at present
- approval scope exactly `future_fixture_manifest_write_dry_run_review_only`
- no duplicate suggested footage ID issue
- no privacy, placeholder, unrelated, suspicious, non-media, or unsafe risk flags
- product family, visual type, process stage, orientation, filename, and relative path present
- no denied requested action

`fixture_manifest_write_allowed` may be `true` only for future dry-run eligibility. It does not create, write, export, import, save, or persist any manifest.

`metadata_write_allowed` is always `false`.

`manifest_write_allowed` is always `false`.

`fixture_manifest_file_created` is always `false`.

`production_manifest_write_allowed` is always `false`.

`manifest_export_allowed` is always `false`.

`public_ready` is always `false`.

`publish_track` is always `blocked`.

## Smoke Command

```bash
npm run ai:real-footage-source-fixture-manifest-write-gate:smoke
```

Expected controlled result:

- provider: `fake_content_engine`
- fixture manifest write gate cases: at least `1`
- reviewed creation approval items: at least `5`
- eligible for fixture manifest write dry-run count: at least `1`
- needs owner review count: at least `1`
- incomplete write gate count: at least `1`
- blocked write gate count: at least `1`
- duplicate ID findings count: at least `1`
- metadata write allowed count: `0`
- manifest write allowed count: `0`
- fixture manifest file created count: `0`
- production manifest write allowed count: `0`
- manifest export allowed count: `0`
- public ready count: `0`
- publish track: `blocked`

## Explicit Non-Goals

Phase 2J.21 is not:

- fixture manifest file creation
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
