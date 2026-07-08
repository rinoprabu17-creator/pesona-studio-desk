# Real Footage Source Folder Draft Manifest Creation Dry-Run Approval Gate

Phase: 2J.20

## Purpose

This document defines the fixture-only draft manifest creation dry-run approval gate. The gate consumes Phase 2J.19 in-memory dry-run review output and decides whether approved rows may enter a future fixture manifest-write gate review.

This approval is future gate eligibility only. This phase does not create draft manifest files, fixture manifest files, export manifests, import manifests, write manifests, save manifests, persist manifests, write production manifests, write real metadata stores, mutate storage folders, render outputs, publish packages, evidence logs, or checklist closeouts.

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
packages/content-engine/fixtures/read-only-intake-sample/
```

Denied upstream cases are not upgraded. Denied source/listing/enrichment/draft-manifest/creation-gate/creation-review cases produce zero approval items.

## Approval Statuses

Approval item statuses:

- `approved_for_future_fixture_manifest_write_gate`
- `needs_owner_review`
- `incomplete_approval`
- `blocked_approval`

`approved_for_future_fixture_manifest_write_gate` means an item may be reviewed by a later fixture manifest-write gate. It does not mean draft manifest file creation, fixture manifest file creation, manifest write approval, manifest export approval, manifest import approval, production manifest write approval, metadata import approval, metadata write approval, visual quality approval, true duration approval, codec compatibility, render readiness, public readiness, upload approval, or publishing approval.

## Conservative Approval Rules

Future fixture manifest-write gate eligibility requires:

- safe fixture source flow only
- dry-run mode
- read-only mode
- Phase 2J.19 source dry-run review status `dry_run_preview_ok`
- approval record found
- owner approved
- approved by present
- approved at present
- approval scope exactly `future_fixture_manifest_write_gate_review_only`
- no duplicate suggested footage ID issue
- no privacy, placeholder, unrelated, suspicious, non-media, or unsafe risk flags
- no denied requested action

`fixture_manifest_write_gate_allowed` may be `true` only for future gate eligibility. It does not create, write, export, import, save, or persist any manifest.

`metadata_write_allowed` is always `false`.

`manifest_write_allowed` is always `false`.

`manifest_file_created` is always `false`.

`manifest_export_allowed` is always `false`.

`public_ready` is always `false`.

`publish_track` is always `blocked`.

## Smoke Command

```bash
npm run ai:real-footage-source-draft-manifest-creation-approval:smoke
```

Expected controlled result:

- provider: `fake_content_engine`
- reviewed dry-run items: at least `5`
- approved for future fixture manifest-write gate count: at least `1`
- needs owner review count: at least `1`
- incomplete approval count: at least `1`
- blocked approval count: at least `1`
- duplicate ID findings count: at least `1`
- metadata write allowed count: `0`
- manifest write allowed count: `0`
- manifest file created count: `0`
- manifest export allowed count: `0`
- public ready count: `0`
- publish track: `blocked`

## Explicit Non-Goals

Phase 2J.20 is not:

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
Phase 2J.21 Real Footage Source Folder Fixture Manifest Write Gate
```
