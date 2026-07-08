# Real Footage Source Folder Listing Review

Phase: 2J.13

## Purpose

This document defines the controlled source folder listing review layer for Phase 2J.13. The review evaluates only the approved safe repo fixture listing produced by the Phase 2J.12 listing approval gate.

The review does not access actual SSD, Google Drive, storage, production media, backup, render, upload, or publish folders. Real-looking paths remain blocked metadata strings or safety documentation only.

## Allowed Input

The only reviewable listing is the Phase 2J.12 approved safe fixture listing:

```text
packages/content-engine/fixtures/read-only-intake-sample/
```

The review depends on:

- Phase 2J.10 source folder gate
- Phase 2J.11 approval review
- Phase 2J.12 listing approval gate

If Phase 2J.12 does not allow and perform listing, Phase 2J.13 reviews no entries.

## Review Statuses

Entry review statuses:

- `listing_review_ok`
- `needs_manual_metadata`
- `blocked_entry`
- `low_confidence`

`listing_review_ok` means filename signals are sufficient for metadata enrichment only. It is not render readiness, visual quality approval, codec approval, duration verification, public readiness, upload approval, or publishing approval.

## Conservative Rules

`listing_review_ok` requires:

- accepted candidate from the approved safe fixture listing
- product family guess present
- process stage guess present
- orientation hint present
- no privacy, placeholder, unrelated, suspicious, non-media, or unsafe risk flags

`needs_manual_metadata` applies to horizontal entries, still-image entries, blurry filename signals, or entries that need explicit owner metadata review.

`blocked_entry` applies to privacy, placeholder, unrelated, suspicious, non-media, or unsafe entries.

`low_confidence` applies when naming signals are weak but not blocked.

The review never claims:

- visual quality
- true duration
- codec compatibility
- render readiness
- public readiness

## Smoke Command

```bash
npm run ai:real-footage-source-listing-review:smoke
```

Expected controlled result:

- provider: `fake_content_engine`
- listing allowed count: `1`
- listing performed count: `1`
- reviewed entries: at least `8`
- at least `3` entries with `listing_review_ok`
- at least `1` entry needing manual metadata
- at least `1` blocked entry
- `public_ready: false`
- publish track: `blocked`

## Explicit Non-Goals

Phase 2J.13 is not:

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
Phase 2J.14 Real Footage Source Folder Metadata Enrichment Review
```
