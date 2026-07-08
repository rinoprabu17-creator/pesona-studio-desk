# Real Footage Source Folder Draft Manifest Creation Dry-Run Review

Phase: 2J.19

## Purpose

This document defines the fixture-only draft manifest creation dry-run review. The review consumes Phase 2J.18 creation dry-run gate output and simulates the rows that a later dry-run would inspect, entirely in memory.

This phase does not create draft manifest files, fixture manifest files, export manifests, import manifests, write manifests, save manifests, persist manifests, write production manifests, write real metadata stores, mutate storage folders, render outputs, publish packages, evidence logs, or checklist closeouts.

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
packages/content-engine/fixtures/read-only-intake-sample/
```

Denied upstream cases are not upgraded. Denied source/listing/enrichment/draft-manifest/creation-gate cases produce zero dry-run preview rows.

## Review Statuses

Dry-run preview item statuses:

- `dry_run_preview_ok`
- `needs_owner_review`
- `incomplete_dry_run`
- `blocked_dry_run`

`dry_run_preview_ok` means an item may be reviewed by the next approval gate. It does not mean draft manifest file creation, fixture manifest file creation, manifest write approval, manifest export approval, manifest import approval, production manifest write approval, metadata import approval, metadata write approval, visual quality approval, true duration approval, codec compatibility, render readiness, public readiness, upload approval, or publishing approval.

## Conservative Review Rules

Dry-run preview OK requires:

- safe fixture source flow only
- dry-run mode
- read-only mode
- Phase 2J.18 source creation gate status `eligible_for_creation_dry_run`
- no duplicate suggested footage ID issue
- no privacy, placeholder, unrelated, suspicious, non-media, or unsafe risk flags
- product family present
- visual type present
- process stage present
- orientation present
- filename present
- relative path present

`creation_dry_run_performed` may be `true` only for in-memory review simulation. It does not create, write, export, import, save, or persist any manifest.

`metadata_write_allowed` is always `false`.

`manifest_write_allowed` is always `false`.

`manifest_file_created` is always `false`.

`manifest_export_allowed` is always `false`.

`public_ready` is always `false`.

`publish_track` is always `blocked`.

## Smoke Command

```bash
npm run ai:real-footage-source-draft-manifest-creation-review:smoke
```

Expected controlled result:

- provider: `fake_content_engine`
- reviewed gate items: at least `5`
- dry-run manifest preview items: at least `1`
- dry-run preview OK count: at least `1`
- needs owner review count: at least `1`
- incomplete dry-run count: at least `1`
- blocked dry-run count: at least `1`
- duplicate ID count: at least `1`
- metadata write allowed count: `0`
- manifest write allowed count: `0`
- manifest file created count: `0`
- manifest export allowed count: `0`
- public ready count: `0`
- publish track: `blocked`

## Explicit Non-Goals

Phase 2J.19 is not:

- production manifest write
- draft manifest file creation
- fixture manifest file creation
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
- migration
- server command
- Docker Compose command
- worker/video change
- cutover

Real-looking paths appear only as blocked metadata strings or safety documentation.

## Next Safe Step

Recommended next phase:

```text
Phase 2J.20 Real Footage Source Folder Draft Manifest Creation Dry-Run Approval Gate
```
