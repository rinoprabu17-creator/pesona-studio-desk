# Real Footage Source Folder Metadata Enrichment Review

Phase: 2J.14

## Purpose

This document defines the controlled metadata enrichment review layer for Phase 2J.14. The review consumes only the approved safe repo fixture listing/review flow from Phase 2J.12 and Phase 2J.13, then produces suggested metadata rows for owner review.

This phase does not write to production manifests, real metadata stores, storage folders, rendered outputs, publish packages, evidence logs, or checklist closeouts.

## Allowed Input

Allowed source flow:

```text
Phase 2J.12 listing approval gate
Phase 2J.13 listing review
packages/content-engine/fixtures/read-only-intake-sample/
```

Denied listing or listing-review cases are not enriched.

## Enrichment Statuses

Candidate statuses:

- `enrichment_ready`
- `needs_manual_metadata`
- `blocked_enrichment`
- `low_confidence`

`enrichment_ready` means the filename signals are sufficient to propose a metadata row in a controlled fixture context only. It does not mean visual quality, true duration, codec compatibility, render readiness, public readiness, upload approval, or publishing approval.

## Metadata Fields

Suggested rows may include:

- footage_id
- filename
- relative_path
- product_family
- visual_type
- process_stage
- orientation
- school_level
- color_variant
- content_tags
- risk_flags
- recommended_use
- channel_fit
- usable_guess
- notes

`duration_sec` remains `null` unless explicitly encoded by a fixture. Phase 2J.14 does not infer duration, codec, visual quality, actual content, render readiness, or public readiness.

## Smoke Command

```bash
npm run ai:real-footage-source-metadata-enrichment:smoke
```

Expected controlled result:

- provider: `fake_content_engine`
- reviewed entries: at least `8`
- enrichment candidates: at least `8`
- enrichment ready count: at least `3`
- needs manual metadata count: at least `1`
- blocked enrichment count: at least `1`
- missing required metadata count: reported as `missing_required_metadata_count`
- suggested metadata rows count: at least `3`
- recommended manual fields count: reported as `recommended_manual_fields_count`
- recommended owner actions count: reported as `recommended_owner_actions_count`
- `public_ready: false`
- publish track: `blocked`

## Explicit Non-Goals

Phase 2J.14 is not:

- real media folder scan
- file stat/walk against actual storage
- actual SSD access
- Google Drive access
- storage, production, backup, render, upload, or publish folder access
- production manifest mutation
- real metadata store mutation
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
Phase 2J.15 Real Footage Source Folder Metadata Enrichment Approval Gate
```
