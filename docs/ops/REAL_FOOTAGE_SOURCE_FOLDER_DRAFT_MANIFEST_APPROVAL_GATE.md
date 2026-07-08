# Real Footage Source Folder Draft Manifest Approval Gate

Phase: 2J.17

## Purpose

This document defines the controlled draft manifest approval gate for Phase 2J.17. The gate consumes in-memory manifest preview items from Phase 2J.16 and decides whether individual preview rows are approved only for a future draft-manifest creation review phase.

This phase does not create draft manifest files, export manifests, import manifests, write manifests, write production manifests, write real metadata stores, mutate storage folders, render outputs, publish packages, evidence logs, or checklist closeouts.

## Allowed Input

Allowed source flow:

```text
Phase 2J.12 listing approval gate
Phase 2J.13 listing review
Phase 2J.14 metadata enrichment review
Phase 2J.15 metadata enrichment approval gate
Phase 2J.16 draft manifest review
packages/content-engine/fixtures/read-only-intake-sample/
```

Denied upstream listing, review, enrichment, approval, or draft manifest review cases are not upgraded. Denied upstream cases produce zero draft manifest approval items.

## Approval Statuses

Draft manifest approval item statuses:

- `approved_for_future_manifest_creation`
- `needs_owner_review`
- `incomplete_approval`
- `blocked_approval`

`approved_for_future_manifest_creation` means a preview row is eligible for owner review in a later draft-manifest creation phase. It does not mean draft manifest file creation, manifest write approval, manifest export approval, manifest import approval, production manifest write approval, metadata import approval, metadata write approval, visual quality approval, true duration approval, codec compatibility, render readiness, public readiness, upload approval, or publishing approval.

## Conservative Approval Rules

Approval for future manifest creation requires:

- safe fixture source flow only
- dry-run mode
- read-only mode
- source manifest review status `manifest_preview_ok`
- approval record found
- owner approved
- approved by present
- approved at present
- approval scope exactly `future_draft_manifest_creation_only`
- no duplicate `suggested_footage_id` issue
- no privacy, placeholder, unrelated, suspicious, non-media, or unsafe risk flags
- product family present
- visual type present
- process stage present
- orientation present
- filename present
- relative path present
- no metadata write/import, manifest write/import/export, render, upload, publish, or publish-package request

`metadata_write_allowed` is always `false`.

`manifest_write_allowed` is always `false`.

`manifest_file_created` is always `false`.

`manifest_export_allowed` is always `false`.

`public_ready` is always `false`.

`publish_track` is always `blocked`.

## Smoke Command

```bash
npm run ai:real-footage-source-draft-manifest-approval:smoke
```

Expected controlled result:

- provider: `fake_content_engine`
- draft manifest approval gate cases: at least `1`
- reviewed manifest preview items: at least `5`
- approved for future manifest creation count: at least `1`
- needs owner review count: at least `1`
- incomplete approval count: at least `1`
- blocked approval count: at least `1`
- duplicate ID findings count: at least `1`
- metadata write allowed count: `0`
- manifest write allowed count: `0`
- manifest file created count: `0`
- manifest export allowed count: `0`
- recommended owner actions count: reported as `recommended_owner_actions_count`
- `public_ready: false`
- publish track: `blocked`

## Explicit Non-Goals

Phase 2J.17 is not:

- production manifest write
- draft manifest file creation
- manifest export
- manifest import
- manifest write
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
Phase 2J.18 Real Footage Source Folder Draft Manifest Creation Dry-Run Gate
```
