# Real Footage Batch Metadata Expansion

## Purpose

Phase 2J.5 expands the controlled real-footage metadata batch so the content engine can be tested with broader Sampul Raport and Map Ijazah coverage before any real media scan or render work.

This phase is metadata-only. It does not scan real media folders, open media files, run FFmpeg, render video, upload, publish, create publish packages, create evidence logs, mutate manual publish checklists, create closeout, run server commands, or run Docker Compose server commands.

## Scope

Included:

- Expanded metadata fixture in `packages/content-engine/fixtures/real-footage-expanded-batch-smoke.json`.
- Strict expanded-batch validation in `packages/content-engine/src/expanded-batch.ts`.
- Compatibility projection into the existing Phase 2J.2 footage intake path.
- Expanded batch summary:
  - Total rows.
  - Usable rows.
  - Blocked rows.
  - Missing required field count.
  - Product family breakdown.
  - Process stage breakdown.
  - Visual type breakdown.
  - Orientation breakdown.
  - Channel fit breakdown.
  - School level breakdown.
  - Color variant breakdown.
  - Risk flag breakdown.
  - Average quality score.
  - Low quality count.
  - Metadata coverage gaps.
- Coverage gap detection for product, process, vertical-social, delivery, CTA/mockup, and high-quality usable footage.
- Smoke script: `npm run ai:real-footage-expanded:smoke`.

Excluded:

- Real media scanning.
- Media read/copy/move/rename/delete.
- FFmpeg execution.
- Render execution.
- Upload.
- Publishing.
- Publish package creation.
- Evidence log creation.
- Manual publish checklist mutation.
- Closeout.
- Scheduler/publisher/social API activation.
- OpenAI live runtime requirement.
- Server or Docker Compose command.
- `workers/video` changes.

## Expanded Fixture

Fixture path:

`packages/content-engine/fixtures/real-footage-expanded-batch-smoke.json`

The fixture is metadata-only. The `relative_path` values are strings and are not scanned or opened.

Current fixture coverage:

- `36` total rows.
- Sampul Raport and Map Ijazah product families.
- Cover colors: maroon, navy, black, green, gray, light blue, brown, and orange.
- Product close-up rows.
- Foil emboss / poly process rows.
- Penamaan process row.
- Cover assembly rows.
- Isian / inner sheet rows.
- Packing + QC rows.
- Delivery / ready-to-ship rows.
- Workshop / production table rows.
- Before-after or mockup-style metadata rows.
- Risk/blocked samples for privacy, blurry footage, placeholder footage, wrong orientation, too short, and unrelated content.

## Required Metadata Fields

Every expanded row requires:

- `footage_id`.
- `filename`.
- `relative_path`.
- `product_family`.
- `visual_type`.
- `process_stage`.
- `duration_sec`.
- `orientation`.
- `location`.
- `school_level`.
- `color_variant`.
- `content_tags`.
- `notes`.
- `usable`.
- `risk_flags`.
- `recommended_use`.
- `channel_fit`.
- `quality_score`.

Validation keeps Phase 2J.2 compatibility by projecting expanded rows into the existing footage intake row shape for downstream fake-provider use.

## Coverage Gap Detection

The expanded summary reports gaps if the metadata batch is weak in:

- Map Ijazah usable footage.
- Packing + QC footage.
- Close-up product footage.
- Vertical social footage.
- Process footage.
- Delivery footage.
- CTA/mockup-related footage.
- Usable high-quality footage.
- Product family breadth.

The current fixture reports no metadata coverage gaps.

## Content Engine Integration

Usable expanded rows are fed into:

- Footage metadata path.
- Footage selection path.
- Video draft plan path.
- Draft plan quality path.

The fake provider remains default. Live OpenAI is not required. `public_ready` remains false and publish track remains blocked.

## Smoke Command

```bash
npm run ai:real-footage-expanded:smoke
```

Expected behavior:

- Provider: `fake_content_engine`.
- Total rows: at least `30`.
- Usable rows: at least `20`.
- Blocked rows: at least `3`.
- At least `2` product families.
- At least `5` process stages.
- Vertical rows: at least `20`.
- Selections: at least `3`.
- Public-ready count: `0`.
- Publish track: `blocked`.

## Current Result

The smoke currently produces:

- `36` total rows.
- `30` usable rows.
- `6` blocked rows.
- `4` product family values, including Sampul Raport and Map Ijazah.
- `12` process stage values.
- `33` vertical rows.
- `30` metadata rows produced by fake provider path.
- `3` selections.
- `3` draft plan scenes.
- `4` quality review items.
- `0` coverage gaps.
- `public_ready` count: `0`.
- `publish_track: blocked`.

## Safety Rules

- Fake provider remains default.
- Live OpenAI is not required.
- No rendered video is created.
- No FFmpeg command is executed.
- No storage media is scanned or mutated.
- No server command is run.
- No Docker Compose server command is run.
- No evidence log, checklist, closeout, publishing, upload, backup, restore, cutover, migration, env, secret, credential, or `scripts/prepare-test-db.mjs` change is part of this phase.

## Known Limitations

- This phase validates metadata breadth only.
- It does not prove real media readability, visual quality, OCR/CV, render quality, platform suitability, or public readiness.
- Real footage paths remain metadata strings only.
- Real media folder scanning remains deferred.

## Recommended Next Phase

`Phase 2J.6 Real Footage Metadata Coverage Review`

Recommended scope:

- Review whether the expanded metadata coverage is balanced enough for the first real media dry-run.
- Keep rendering, upload, publishing, live AI, and public-ready approval disabled by default.
