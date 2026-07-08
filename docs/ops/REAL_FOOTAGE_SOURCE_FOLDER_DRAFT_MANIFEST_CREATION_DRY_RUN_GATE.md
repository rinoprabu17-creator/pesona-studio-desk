# Real Footage Source Folder Draft Manifest Creation Dry-Run Gate

Phase: 2J.18

## Purpose

This document defines the controlled draft manifest creation dry-run gate for Phase 2J.18. The gate consumes Phase 2J.17 draft manifest approval output and decides whether approved fixture rows may enter a later draft-manifest creation dry-run review phase.

This phase does not create draft manifest files, export manifests, import manifests, write manifests, save manifests, persist manifests, write production manifests, write real metadata stores, mutate storage folders, render outputs, publish packages, evidence logs, or checklist closeouts.

## Allowed Input

Allowed source flow:

```text
Phase 2J.12 listing approval gate
Phase 2J.13 listing review
Phase 2J.14 metadata enrichment review
Phase 2J.15 metadata enrichment approval gate
Phase 2J.16 draft manifest review
Phase 2J.17 draft manifest approval gate
packages/content-engine/fixtures/read-only-intake-sample/
```

Denied upstream listing, review, enrichment, approval, draft manifest review, or draft manifest approval cases are not upgraded. Denied upstream cases produce zero creation gate items.

## Creation Gate Statuses

Creation gate item statuses:

- `eligible_for_creation_dry_run`
- `needs_owner_review`
- `incomplete_creation_gate`
- `blocked_creation_gate`

`eligible_for_creation_dry_run` means an item may be reviewed in a later dry-run phase. It does not mean draft manifest file creation, manifest write approval, manifest export approval, manifest import approval, production manifest write approval, metadata import approval, metadata write approval, visual quality approval, true duration approval, codec compatibility, render readiness, public readiness, upload approval, or publishing approval.

## Conservative Gate Rules

Creation dry-run eligibility requires:

- safe fixture source flow only
- dry-run mode
- read-only mode
- source approval status `approved_for_future_manifest_creation`
- creation dry-run approval record found
- owner approved
- approved by present
- approved at present
- approval scope exactly `draft_manifest_creation_dry_run_only`
- no duplicate `suggested_footage_id` issue
- no privacy, placeholder, unrelated, suspicious, non-media, or unsafe risk flags
- product family present
- visual type present
- process stage present
- orientation present
- filename present
- relative path present
- no metadata write/import, manifest write/import/export, render, upload, publish, or publish-package request

`creation_dry_run_allowed` may be `true` only when at least one item is `eligible_for_creation_dry_run`, but this still does not create any manifest file.

`metadata_write_allowed` is always `false`.

`manifest_write_allowed` is always `false`.

`manifest_file_created` is always `false`.

`manifest_export_allowed` is always `false`.

`public_ready` is always `false`.

`publish_track` is always `blocked`.

## Smoke Command

```bash
npm run ai:real-footage-source-draft-manifest-creation-gate:smoke
```

Expected controlled result:

- provider: `fake_content_engine`
- creation gate cases: at least `1`
- reviewed approval items: at least `5`
- eligible for creation dry-run count: at least `1`
- needs owner review count: at least `1`
- incomplete creation gate count: at least `1`
- blocked creation gate count: at least `1`
- duplicate ID findings count: at least `1`
- metadata write allowed count: `0`
- manifest write allowed count: `0`
- manifest file created count: `0`
- manifest export allowed count: `0`
- public ready count: `0`
- publish track: `blocked`

The current controlled fixture reports `reviewed_approval_items: 12`. This is intentional: Phase 2J.17 provides 10 manifest preview approval items, and Phase 2J.18 adds two extra creation-gate approval scenarios for the same approved future-manifest item to exercise missing-owner and incomplete creation-dry-run approval handling. These extra review items are gate-only records and do not create, write, export, import, save, or persist a manifest.

## Explicit Non-Goals

Phase 2J.18 is not:

- production manifest write
- draft manifest file creation
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
Phase 2J.19 Real Footage Source Folder Draft Manifest Creation Dry-Run Review
```
