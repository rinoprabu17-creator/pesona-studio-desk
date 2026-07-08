# Real Footage Source Folder Metadata Enrichment Approval Gate

Phase: 2J.15

## Purpose

This document defines the controlled metadata enrichment approval gate for Phase 2J.15. The gate reviews suggested metadata rows from Phase 2J.14 and decides whether individual suggestions may proceed to a future draft-manifest review phase.

This phase does not write production manifests, write real metadata stores, import metadata, create draft manifests, mutate storage folders, render outputs, publish packages, evidence logs, or checklist closeouts.

## Allowed Input

Allowed source flow:

```text
Phase 2J.12 listing approval gate
Phase 2J.13 listing review
Phase 2J.14 metadata enrichment review
packages/content-engine/fixtures/read-only-intake-sample/
```

Denied listing/review/enrichment cases are not upgraded. Denied enrichment review cases produce zero approval items.

## Approval Statuses

Approval item statuses:

- `approved_for_draft_manifest`
- `needs_owner_review`
- `blocked_approval`
- `incomplete_approval`

`approved_for_draft_manifest` means a suggestion may proceed to a later draft-manifest review only. It does not mean metadata write approval, manifest creation, visual quality approval, true duration approval, codec compatibility, render readiness, public readiness, upload approval, or publishing approval.

## Conservative Approval Rules

Approval requires:

- safe fixture source flow only
- dry-run mode
- read-only mode
- `enrichment_ready`
- approval record found
- owner approved
- `approved_by` present
- `approved_at` present
- approval scope exactly `draft_manifest_preparation_only`
- no privacy, placeholder, unrelated, suspicious, non-media, or unsafe risk flags
- product family, process stage, visual type, and orientation present
- no metadata write/import, manifest write, render, upload, publish, or publish-package request

`metadata_write_allowed` is always `false`.

`manifest_write_allowed` is always `false`.

`public_ready` is always `false`.

`publish_track` is always `blocked`.

## Smoke Command

```bash
npm run ai:real-footage-source-metadata-enrichment-approval:smoke
```

Expected controlled result:

- provider: `fake_content_engine`
- reviewed suggestions: at least `5`
- approved for draft manifest count: at least `1`
- needs owner review count: at least `1`
- incomplete approval count: at least `1`
- blocked approval count: at least `1`
- metadata write allowed count: `0`
- manifest write allowed count: `0`
- recommended owner actions count: reported as `recommended_owner_actions_count`
- `public_ready: false`
- publish track: `blocked`

## Explicit Non-Goals

Phase 2J.15 is not:

- production manifest write
- real metadata store mutation
- metadata import
- draft manifest creation
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

## Next Safe Step

Recommended next phase:

```text
Phase 2J.16 Real Footage Source Folder Draft Manifest Review
```
