# Real Footage Intake Metadata Batch Smoke

## Purpose

Phase 2J.2 proves the content engine can read a controlled batch of real-footage-like metadata records, validate and summarize them, filter risky/unusable rows, and pass usable rows through the fake content-engine metadata, selection, and draft-plan pipeline.

This is a local-only metadata fixture smoke. It does not scan real media folders and does not touch media files.

## Scope

Included:

- Controlled JSON intake manifest format.
- Fixture manifest with at least 10 metadata rows.
- Parser and validator utilities in `packages/content-engine/src/intake.ts`.
- Tag normalization.
- Risk/unusable filtering.
- Intake summary:
  - Total rows.
  - Usable rows.
  - Blocked rows.
  - Missing required fields.
  - Orientation breakdown.
  - Product family breakdown.
  - Risk flag breakdown.
- Fake provider integration through:
  - Footage Metadata Agent.
  - Footage Selection Agent.
  - Video Draft Plan Agent.
- Smoke script: `npm run ai:real-footage-intake:smoke`.

Excluded:

- Real media scanning.
- Media read/copy/move/rename/delete.
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

## Fixture Manifest

Fixture path:

`packages/content-engine/fixtures/real-footage-intake-smoke.json`

The manifest is metadata-only and human-editable. It includes:

- `footage_id`: stable row identifier for the fixture.
- `filename`: media filename as metadata only.
- `relative_path`: safe relative path string; not scanned or opened.
- `product_family`: product grouping such as `Sampul Raport` or `Map Ijazah`.
- `visual_type`: shot category such as close-up, detail, process, stack, or placeholder.
- `duration_sec`: expected clip duration in seconds.
- `orientation`: `vertical`, `horizontal`, or `square`.
- `location`: owner-provided filming/location context.
- `school_level`: school level when known, or `null`.
- `content_tags`: human tags for use-case and content planning.
- `notes`: owner/operator note describing the clip.
- `usable`: whether the row can enter the fake content-engine pipeline.
- `risk_flags`: reasons to block or review the row, such as privacy, low light, reshoot, or placeholder-smoke concerns.

The `relative_path` values are strings only. They are not scanned or opened.

## Intake Validation And Filtering

Validation rules:

- Manifest version must be `real-footage-intake-smoke-v1`.
- Mode must be `metadata_only_fixture`.
- Required fields must be present.
- `relative_path` must be relative and must not contain `..`.
- `duration_sec` must be positive.
- `orientation` must be one of `vertical`, `horizontal`, or `square`.
- `content_tags` and `risk_flags` are normalized to lowercase snake-case tokens.

Filtering rules:

- A row is usable only when `usable` is `true` and `risk_flags` is empty.
- Rows with privacy, blur, low-light, reshoot, placeholder, or not-production-ready flags are blocked from pipeline input.
- Blocked rows still appear in the intake summary for review.

## Smoke Command

```bash
npm run ai:real-footage-intake:smoke
```

Expected behavior:

- Provider: `fake_content_engine`.
- Total rows: at least `10`.
- Usable rows: at least `5`.
- Selections produced: at least `3`.
- Draft plan scenes produced: at least `3`.
- `public_ready`: `false`.
- Publish track: `blocked`.

## Safety Rules

- Fake provider remains default.
- Live OpenAI is not required.
- If live provider env is incomplete, content-engine config falls back to fake provider.
- No rendered video is created.
- No storage media is mutated.
- No server command is run.
- No Docker Compose server command is run.
- No evidence log, checklist, closeout, publishing, upload, backup, restore, cutover, migration, env, secret, credential, or `scripts/prepare-test-db.mjs` change is part of this phase.

## Current Result

The smoke currently produces:

- `10` total fixture rows.
- `7` usable rows.
- `3` blocked rows.
- `0` missing required fields.
- `7` metadata rows from the usable fixture rows.
- `3` footage selections.
- `3` draft plan scenes.
- `public_ready: false`.
- `publish_track: blocked`.

## Recommended Next Phase

`Phase 2J.3 Real Footage Script-To-Draft Plan Batch Review`

Recommended scope:

- Review multiple script/shot-list/draft-plan outputs from the fixture batch.
- Confirm missing footage notes are useful.
- Keep publish track frozen.
- Keep live AI optional and off by default.
- Still no rendering, upload, or publishing.
