# Real Footage Read-Only Intake Review

Phase: `2J.9`

## Purpose

This document records the safe local read-only intake review layer for candidate rows produced by Phase 2J.8.

The review evaluates filename-derived candidate manifest rows before any future real footage intake is allowed. It does not inspect media content and does not approve any candidate for render, upload, publish, or public readiness.

## Baseline

- Baseline commit: `c576349`
- Baseline tag: `phase-2j8-complete`
- Source fixture: `packages/content-engine/fixtures/read-only-intake-sample/`
- Intake utility reused: `packages/content-engine/src/read-only-intake.ts`
- Review utility: `packages/content-engine/src/read-only-intake-review.ts`
- Smoke command: `npm run ai:real-footage-read-only-review:smoke`
- Provider: `fake_content_engine`
- Live AI required: no

## Review Behavior

The review consumes candidate manifest rows generated from the Phase 2J.8 safe repo fixture. It only reviews metadata strings derived from filenames:

- product family guess
- product family confidence
- process stage guess
- process stage confidence
- orientation hint
- orientation confidence
- risk flags
- missing metadata fields
- recommended manual action

It never claims actual visual quality, true duration, codec compatibility, production readiness, public readiness, or publish readiness.

## Candidate Statuses

- `metadata_review_ok`: filename signals are adequate for manual metadata enrichment.
- `needs_manual_metadata`: candidate needs human metadata or channel-fit review.
- `blocked_candidate`: candidate has blocking risk signals such as privacy, placeholder, unrelated, or suspicious.
- `low_confidence`: candidate has weak filename signals or quality-risk wording that needs manual review.

## Conservative Rules

- Privacy, unrelated, placeholder, or suspicious candidates are blocked.
- Blurry or weak-signal candidates are not treated as ready.
- Product family and process stage must be known for `metadata_review_ok`.
- Orientation must be known for vertical social planning.
- Horizontal and still-image candidates require manual channel-fit review.
- Public readiness is always false.
- Publish track is always blocked.

## Safe Behavior

This phase remains review-only:

- no real media folder scan
- no media content opening
- no media decoding
- no FFmpeg execution
- no rendering
- no upload
- no publishing
- no publish package creation
- no evidence log or checklist mutation
- no closeout
- no server or Docker command

Only the controlled Phase 2J.8 fixture listing/stat path is reused.

## Expected Smoke Summary

Expected `npm run ai:real-footage-read-only-review:smoke` result:

- provider: `fake_content_engine`
- dry run: true
- read only: true
- total candidates: at least 8
- reviewed candidates: at least 8
- accepted for metadata review: at least 3
- needs manual metadata: at least 1
- blocked candidates: at least 1
- public ready: false
- public ready count: 0
- publish track: `blocked`

## Known Limitations

- Candidate rows come from safe fixture filenames only.
- Duration remains unknown.
- Codec compatibility remains unknown.
- Visual quality remains unknown.
- OCR/CV is not used.
- Real source folder review still needs owner approval and a separate gate.

## Next Phase

Recommended next phase:

`Phase 2J.10 Real Footage Owner-Approved Source Folder Gate`
