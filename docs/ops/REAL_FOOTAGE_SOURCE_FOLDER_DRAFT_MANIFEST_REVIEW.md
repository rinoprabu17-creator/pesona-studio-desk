# Real Footage Source Folder Draft Manifest Review

Phase: 2J.16

## Purpose

This document defines the controlled draft manifest review for Phase 2J.16. The review consumes approved-for-draft-manifest suggestions from Phase 2J.15 and produces an in-memory manifest preview only.

This phase does not create draft manifest files, export manifests, import manifests, write production manifests, write real metadata stores, mutate storage folders, render outputs, publish packages, evidence logs, or checklist closeouts.

## Allowed Input

Allowed source flow:

```text
Phase 2J.12 listing approval gate
Phase 2J.13 listing review
Phase 2J.14 metadata enrichment review
Phase 2J.15 metadata enrichment approval gate
packages/content-engine/fixtures/read-only-intake-sample/
```

Denied upstream listing, review, enrichment, or approval cases are not upgraded. Denied upstream cases produce zero manifest preview items.

## Manifest Review Statuses

Manifest preview item statuses:

- `manifest_preview_ok`
- `needs_owner_review`
- `blocked_manifest`
- `incomplete_manifest`

`manifest_preview_ok` means an item may appear in the in-memory preview for owner review. It does not mean draft manifest creation, production manifest write approval, metadata import approval, visual quality approval, true duration approval, codec compatibility, render readiness, public readiness, upload approval, or publishing approval.

## Conservative Review Rules

Preview OK requires:

- safe fixture source flow only
- dry-run mode
- read-only mode
- source approval status `approved_for_draft_manifest`
- `metadata_write_allowed: false`
- `manifest_write_allowed: false`
- `manifest_file_created: false`
- product family present
- visual type present
- process stage present
- orientation present
- filename present
- relative path present
- no privacy, placeholder, unrelated, suspicious, non-media, or unsafe risk flags
- no metadata write/import, manifest write/import/export, render, upload, publish, or publish-package request

`duration_sec` remains null unless explicitly encoded in fixture metadata.

`metadata_write_allowed` is always `false`.

`manifest_write_allowed` is always `false`.

`manifest_file_created` is always `false`.

`public_ready` is always `false`.

`publish_track` is always `blocked`.

## Smoke Command

```bash
npm run ai:real-footage-source-draft-manifest-review:smoke
```

Expected controlled result:

- provider: `fake_content_engine`
- reviewed approval items: at least `5`
- manifest preview items: at least `1`
- manifest preview items may be higher than reviewed approval items when the controlled fixture intentionally duplicates a `suggested_footage_id` to exercise duplicate-ID blocking
- manifest preview OK count: at least `1`
- needs owner review or incomplete manifest count: at least `1`
- blocked manifest count: at least `1`
- metadata write allowed count: `0`
- manifest write allowed count: `0`
- manifest file created count: `0`
- recommended owner actions count: reported as `recommended_owner_actions_count`
- `public_ready: false`
- publish track: `blocked`

## Explicit Non-Goals

Phase 2J.16 is not:

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
Phase 2J.17 Real Footage Source Folder Draft Manifest Approval Gate
```
