# Real Footage Metadata Coverage Review

## Purpose

Phase 2J.6 adds a metadata-only coverage review layer for the expanded real-footage fixture from Phase 2J.5.

The review answers one planning question: is the current metadata batch broad enough to support practical content planning across products, channels, production stages, hooks, CTAs, and a 30-day calendar approximation?

This is not media QA and not publishing approval. It does not scan real media folders, open media files, run FFmpeg, render video, upload, publish, create publish packages, create evidence logs, mutate manual publish checklists, create closeout, run server commands, or run Docker Compose server commands.

## Baseline

- Baseline commit: `d652ed2`.
- Baseline tag: `phase-2j5-complete`.
- Primary fixture: `packages/content-engine/fixtures/real-footage-expanded-batch-smoke.json`.
- Fixture mode: metadata-only.
- Current expanded batch: `36` total rows, `30` usable rows, `6` blocked rows.
- Phase 2J.5 coverage gaps: `0`.
- Public-ready count remains `0`.
- Publish track remains `blocked`.

## Review Utility

Implementation:

`packages/content-engine/src/metadata-coverage-review.ts`

The review output includes:

- `review_id`.
- `source_fixture`.
- `total_rows`.
- `usable_rows`.
- `blocked_rows`.
- `coverage_score`.
- `coverage_level`.
- `product_family_coverage`.
- `process_stage_coverage`.
- `channel_coverage`.
- `school_level_coverage`.
- `color_variant_coverage`.
- `hook_asset_coverage`.
- `cta_asset_coverage`.
- `content_calendar_support`.
- `weak_spots`.
- `recommended_footage_to_capture`.
- `blocked_risk_summary`.
- `readiness_notes`.
- `public_ready`.
- `publish_track`.

`public_ready` is always `false`. `publish_track` is always `blocked`.

## Coverage Areas

The review checks metadata coverage for:

- Sampul Raport content.
- Map Ijazah content.
- Product close-up content.
- Process footage content.
- Packing + QC proof content.
- Delivery / ready-to-ship content.
- Mockup / Desain Gratis CTA content.
- Color variant content.
- School level content: SD, SMP, SMA, MI, MTs, and MA when present.
- Vertical social content for TikTok, IG Reels, FB Reels, and YouTube Shorts.
- Horizontal or flexible content for YouTube/Facebook when present.

## Process Stage Count Semantics

Phase 2J.5 reports raw process-stage availability from the expanded fixture summary. That raw fixture currently has `12` unique normalized `process_stage` values:

- `product_closeup`.
- `color_variant`.
- `foil_emboss_poly`.
- `penamaan_process`.
- `cover_assembly`.
- `inner_sheet_process`.
- `packing_qc`.
- `delivery_ready`.
- `workshop_table`.
- `mockup_preview`.
- `technical_placeholder`.
- `unrelated`.

Phase 2J.6 coverage review uses a smaller required planning-category target set for practical content planning. The required process categories are:

- `product_closeup`.
- `foil_emboss_poly`.
- `cover_assembly`.
- `inner_sheet_process`.
- `packing_qc`.
- `delivery_ready`.
- `mockup_preview`.

Therefore:

- Raw process stages available: `12`.
- Required process coverage categories covered: `7` of `7`.

Both values are valid. The raw count describes fixture breadth. The required-category count describes whether the fixture covers the process categories needed for planning coverage.

## Coverage Levels

Coverage levels are conservative metadata-only planning labels:

- `weak`: not enough usable product, process, or channel coverage.
- `partial`: enough for limited tests, but many planning gaps remain.
- `usable_for_pilot`: enough metadata variety for pilot planning, still not render-ready or public-ready.
- `strong_metadata_base`: broad metadata coverage, but still needs real media verification before render or publishing.

Even `strong_metadata_base` does not mean the video is production-ready.

## 30-Day Calendar Support Estimate

The review estimates:

- `estimated_unique_short_video_ideas`.
- `estimated_usable_30_day_slots`.
- `strongest_content_pillars`.
- `weakest_content_pillars`.
- `minimum_additional_footage_needed`.
- `suggested_capture_list`.

This is a metadata-only approximation. It does not prove final calendar quality, media readability, video quality, render quality, platform compliance, or public readiness.

## Smoke Command

```bash
npm run ai:metadata-coverage:smoke
```

Expected behavior:

- Provider: `fake_content_engine`.
- Total rows: at least `30`.
- Usable rows: at least `20`.
- Blocked rows: at least `3`.
- Coverage score: greater than `0`.
- Coverage level: not `weak` for the current broad Phase 2J.5 fixture.
- Estimated unique short video ideas: at least `10`.
- Public-ready: `false`.
- Publish track: `blocked`.

## Current Smoke Result

Current metadata coverage smoke result:

- Provider: `fake_content_engine`.
- Total rows: `36`.
- Usable rows: `30`.
- Blocked rows: `6`.
- Coverage score: `100`.
- Coverage level: `strong_metadata_base`.
- Product families covered: `2`.
- Raw process stages available: `12`.
- Required process coverage categories covered: `7` of `7`.
- Channels covered: `4`.
- Estimated unique short video ideas: `45`.
- Estimated usable 30-day slots: `30`.
- Weak spot count: `0`.
- Recommended capture count: `3`.
- Public-ready: `false`.
- Public-ready count: `0`.
- Publish track: `blocked`.

## Safety Rules

- Fake provider remains default.
- Live OpenAI is not required.
- No real media folder is scanned.
- No media file is opened, copied, moved, renamed, edited, or deleted.
- No rendered video is created.
- No FFmpeg command is executed.
- No upload or publishing occurs.
- No publish package is created.
- No public-ready approval is produced.
- No evidence log, checklist, closeout, backup, restore, cutover, migration, env, secret, credential, `scripts/prepare-test-db.mjs`, or `workers/video` change is part of this phase.
- No server command or Docker Compose server command is run.

## Known Limits

- The review is based on fixture metadata only.
- It cannot detect whether the referenced footage files exist.
- It cannot detect real image quality, motion quality, audio, OCR text, platform watermarks, faces, private data, or brand/legal risk inside actual media.
- It does not create edit manifests or render plans beyond existing fake-provider planning smoke paths.
- It does not approve public posting.

## Recommended Next Phase

`Phase 2J.7 Real Footage Intake Dry-Run Gate`

Recommended scope:

- Decide whether the metadata base is ready for a controlled real-media intake dry-run.
- Define exact folders, dry-run mode, and read-only file handling before any real scan.
- Keep rendering, upload, publishing, live AI, public-ready approval, and publish package creation disabled.
