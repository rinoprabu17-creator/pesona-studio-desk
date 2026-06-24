# Phase 2E.6 Approved Video Library / Handoff Board

## Baseline

- Branch: `phase-2e6-approved-video-handoff-board`
- Baseline tag: `phase-2e5-complete`
- Scope: DB-only Approved Video Library / Handoff Board for succeeded approved render promotions.
- Runtime date: 2026-06-24

## Implementation Summary

- Added migration `migrations/015_phase2e_approved_video_handoff_board.sql`.
- Added table `video_approved_handoff_records`.
- Added service, validation, and typed error modules:
  - `apps/web/src/approved-video-handoff-service.ts`
  - `apps/web/src/approved-video-handoff-errors.ts`
  - `apps/web/src/validation/approved-video-handoff-validation.ts`
- Added approved video page/API routes and views:
  - `GET /approved-videos`
  - `GET /approved-videos/:promotionId`
  - `POST /approved-videos/:promotionId/handoff/ready`
  - `POST /approved-videos/:promotionId/handoff/hold`
  - `POST /approved-videos/:promotionId/handoff/needs-revision`
  - `POST /approved-videos/:promotionId/handoff/archive`
  - `GET /api/approved-videos`
  - `GET /api/approved-videos/:promotionId`
  - `POST /api/approved-videos/:promotionId/handoff/ready`
  - `POST /api/approved-videos/:promotionId/handoff/hold`
  - `POST /api/approved-videos/:promotionId/handoff/needs-revision`
  - `POST /api/approved-videos/:promotionId/handoff/archive`

## Table / Constraints / Indexes

`video_approved_handoff_records` stores one DB-only handoff row per approved promotion.

- `promotion_id` is unique and references `video_render_approved_promotions(id)`.
- Handoff statuses: `pending_handoff`, `ready_for_manual_publish`, `hold`, `needs_revision`, `archived`.
- Snapshot path must be guarded `smoke/*.mp4`, with no absolute path, backslash, or traversal.
- Size snapshot is nullable or non-negative.
- SHA-256 snapshot is nullable or 64 lowercase hex chars.
- Indexes were added for promotion, attempt, review, manifest, job, content item, handoff status, and created time.

## Lifecycle Behavior

- List/context reads do not create handoff rows.
- Only `promotion_status = succeeded` can enter handoff.
- Handoff actions insert one row for a promotion, then update the same row for later status changes.
- Handoff never mutates promotion, review, attempt, draft output, approved output, or source footage.
- `ready_for_manual_publish` requires a safe approved smoke MP4 path, existing regular non-empty file under `storage/approved-videos/smoke`, non-empty DB size, and matching SHA-256 when DB hash exists.
- This phase does not execute publishing. Status is only a manual handoff marker.

## Runtime Smoke Evidence

- Promotion id: `c40e7f07-13b1-4dbf-b5e8-a294252d0eea`
- Reviewed attempt id: `f087e2eb-9df8-4161-a4e2-31f125d57534`
- Review row id: `19d3949b-1126-4b8d-b7d6-99d406fd8463`
- Handoff row id: `0aa5fea7-6d61-44be-8326-07c68fc2c7d3`
- Handoff status: `ready_for_manual_publish`
- Approved output snapshot:
  - `smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4`
  - Size: `5,032,913` bytes
  - SHA-256: `0a4dc26de2222f4814c0409021ebd21bb346e09c353ad9ca998ca94fe90f7cb7`

Runtime route checks:

- `GET /approved-videos` returned `200`.
- `GET /approved-videos/c40e7f07-13b1-4dbf-b5e8-a294252d0eea` returned `200`.
- `GET /api/approved-videos/c40e7f07-13b1-4dbf-b5e8-a294252d0eea` returned eligible context.
- `POST /api/approved-videos/c40e7f07-13b1-4dbf-b5e8-a294252d0eea/handoff/ready` created the handoff row.
- `GET /api/approved-videos` returned `200` after the handoff.

## File / Row Safety Evidence

Approved output stat before and after:

- `storage/approved-videos/smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4`
- Before: `size=5032913 mtime=1782284600 mode=81a4`
- After: `size=5032913 mtime=1782284600 mode=81a4`

Draft output stat before and after:

- `storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4`
- Before: `size=5032913 mtime=1782280811 mode=81a4`
- After: `size=5032913 mtime=1782280811 mode=81a4`

Source footage stats before and after were unchanged:

- `storage/footage/smoke/pesona-smoke-001.mp4 size=3784328`
- `storage/footage/smoke/pesona-smoke-002.mp4 size=1350453`
- `storage/footage/smoke/pesona-smoke-003.mp4 size=1203310`

DB row safety:

- Promotion row stayed `succeeded`; `updated_at` stayed `2026-06-24T07:03:20.121Z`.
- Attempt row stayed `succeeded`; `updated_at` stayed `2026-06-24T06:00:11.098Z`.
- Review row stayed `approved`; `updated_at` stayed `2026-06-24T06:36:52.995Z`.
- Handoff row was the only runtime DB row created by the smoke action.

No MP4 was created, copied, moved, renamed, deleted, or edited in Phase 2E.6.

## Validation Results

- `docker compose --env-file .env.local -f docker-compose.dev.yml config`: passed.
- `docker compose --env-file .env.local -f docker-compose.dev.yml ps`: expected services running.
- Postgres health: passed.
- Redis health: passed.
- `npm run db:migrate`: applied `015_phase2e_approved_video_handoff_board.sql`.
- Migration 015 verified in `schema_migrations`.
- Handoff table verified with `to_regclass`.
- `npm run test:footage-catalog`: passed, 81 tests.
- `npm run check`: passed.
- `git diff --check`: passed.
- `git diff --name-only | grep "workers/video" || true`: no output.

## Safety Confirmation

- No OpenAI live call.
- No upload, scheduler, publisher, auto-posting, queue, or worker daemon was added.
- `workers/video` was not modified.
- Runtime handoff service performs read-only approved output stat/hash checks and DB writes only to `video_approved_handoff_records`.
- Safety grep findings were non-blocking:
  - `createReadStream` is used only for read-only SHA-256.
  - `upload`, `scheduler`, `publisher`, and `OpenAI` appear in UI safety notices.
  - `mkdir`, `writeFile`, and `rm` appear in tests for temporary fixtures and cleanup only.
  - Existing skeleton checks still mention prior OpenAI-related files.

## Warnings

- Non-blocking: one follow-up `curl` to `/api/approved-videos` failed transiently immediately after runtime smoke, while the web-app container remained running. A repeat request returned `200`.
- No blocking warnings.

## Final Summary

Phase 2E.6 passed. The approved video library and DB-only handoff board are implemented, tested, and smoke-validated against the existing Phase 2E.5 approved promotion. The runtime smoke inserted one handoff row with status `ready_for_manual_publish` and did not mutate any MP4 files or parent render/review/promotion rows.

Next phase can build on this board as the manual handoff source of truth. Any future publisher, scheduler, upload, or automation should remain a separately approved phase.
