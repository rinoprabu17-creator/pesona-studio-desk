# Phase 2E.5 Controlled Approved Draft Promotion

## Baseline

- Phase: Phase 2E.5 Controlled Approved Draft Promotion + Tests + Runtime Smoke Evidence.
- Branch: `phase-2e5-controlled-approved-promotion`.
- Baseline tag: `phase-2e4-complete`.
- Baseline check: `phase-2e4-complete` is reachable from `HEAD`.

## Manual Approved Promotion

Phase 2E.5 adds a manual local-only promotion path for render attempts that already have terminal DB review status `approved`. The promotion copies one approved draft MP4 from `storage/draft-videos/smoke` to `storage/approved-videos/smoke` and records the result in DB.

Promotion does not mutate:

- Source footage.
- Draft output MP4.
- Render attempt row.
- Render review row.
- Workers.
- Any scheduler, publisher, upload, or OpenAI path.

## Migration

Migration added:

- `migrations/014_phase2e_approved_render_promotions.sql`

Table:

- `video_render_approved_promotions`

Key columns:

- `render_attempt_review_id`
- `render_attempt_id`
- `render_manifest_id`
- `video_draft_job_id`
- `content_item_id`
- `promotion_status`
- `promotion_mode`
- `source_output_relative_path`
- `approved_output_relative_path`
- source and approved file sizes
- source and approved SHA-256 hashes
- promoter fields, note, error, timestamps

Constraints and indexes:

- Unique promotion per review.
- Unique promotion per attempt.
- `promotion_status` limited to `requested`, `running`, `succeeded`, `failed`, `blocked`, `archived`.
- `promotion_mode` limited to `manual_copy`.
- Source and approved output paths must be guarded `smoke/*.mp4` relative paths.
- Source and approved sizes must be null or non-negative.
- Hashes must be null or 64 lowercase hex characters.
- Indexes on review, attempt, manifest, draft job, content item, status, and created time.

Lifecycle behavior:

- Read/context routes never create promotion rows.
- `POST promote` creates one promotion row with `running`, performs one guarded copy, verifies the destination, then marks the row `succeeded`.
- Copy uses no overwrite behavior.
- Duplicate promotion attempts are blocked in this phase, including failed/blocked/succeeded duplicates.

## Routes And UI

API routes added:

- `GET /api/render-attempts/:attemptId/promotion`
- `POST /api/render-attempts/:attemptId/promotion/promote`

Page routes added:

- `GET /content-items/:id/video-draft/:jobId/manifest/:manifestId/render-attempts/:attemptId/promotion`
- `POST /content-items/:id/video-draft/:jobId/manifest/:manifestId/render-attempts/:attemptId/promotion/promote`

UI integration:

- Render attempt review page shows promotion status.
- Approved and eligible review shows “Promote to Approved Smoke”.
- Promotion page shows attempt, review, source draft, approved destination preview, promotion row, eligibility, and safety notice.

## Runtime Smoke Evidence

Runtime setup:

- Docker Compose config resolved.
- `web-app` rebuilt and restarted only.
- Web app reachable: HTTP `200` for `/content-items`.
- Postgres health: accepting connections.
- Redis health: `PONG`.
- `npm run db:migrate` applied migration 014.
- `video_render_approved_promotions` exists.

Reviewed attempt:

- Render attempt id: `f087e2eb-9df8-4161-a4e2-31f125d57534`.
- Review row id: `19d3949b-1126-4b8d-b7d6-99d406fd8463`.
- Review status: `approved`.
- Attempt status: `succeeded`.
- Source draft output: `storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4`.
- Source draft relative path: `smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4`.
- Source draft size: `5,032,913` bytes.
- FFmpeg exit code: `0`.

Promotion result:

- API promotion returned HTTP `201`.
- Promotion row id: `c40e7f07-13b1-4dbf-b5e8-a294252d0eea`.
- Promotion status: `succeeded`.
- Promotion mode: `manual_copy`.
- Approved output relative path: `smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4`.
- Approved output path: `storage/approved-videos/smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4`.
- Approved output size: `5,032,913` bytes.
- Source SHA-256 equals approved SHA-256: `0a4dc26de2222f4814c0409021ebd21bb346e09c353ad9ca998ca94fe90f7cb7`.
- Completed at: `2026-06-24T07:03:20.121Z`.

Duplicate behavior:

- Duplicate API promotion returned HTTP `400`.
- Error code: `render_not_promotable`.
- Error message: `Render attempt ini sudah memiliki promotion row.`
- Promotion row count for the attempt stayed `1`.

## File Safety Evidence

Before/after source footage stats:

- `storage/footage/smoke/pesona-smoke-001.mp4`: size `3,784,328`, mtime `1782278276`, mode `755`.
- `storage/footage/smoke/pesona-smoke-002.mp4`: size `1,350,453`, mtime `1782280287`, mode `755`.
- `storage/footage/smoke/pesona-smoke-003.mp4`: size `1,203,310`, mtime `1782280334`, mode `755`.

Before/after draft output stat:

- `storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4`: size `5,032,913`, mtime `1782280811`, mode `644`.

Approved storage before:

- `storage/approved-videos/.gitkeep 70 bytes`

Approved storage after:

- `storage/approved-videos/.gitkeep 70 bytes`
- `storage/approved-videos/smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4 5032913 bytes`

DB row safety:

- Render attempt row stayed `succeeded`.
- Attempt output path, output size, FFmpeg exit code, and `updated_at` stayed unchanged.
- Review row stayed `approved`.
- Review row `reviewed_at` and `updated_at` stayed unchanged.

## Tests And Validation

Tests added/updated:

- Promotion context rejects missing attempts and missing review.
- Promotion requires `review_status=approved`.
- Promotion blocks pending, rejected, and archived reviews.
- Promotion requires succeeded attempt.
- Promotion requires guarded source draft path and physical file.
- Promotion requires non-empty source draft file.
- Promotion uses generated destination under `storage/approved-videos/smoke`.
- Promotion does not overwrite duplicate attempt promotion.
- Promotion copies exactly one file.
- Promotion records succeeded DB row with approved relative path.
- Promotion keeps draft output stat unchanged.
- Promotion keeps source footage stat unchanged.
- Promotion does not mutate attempt or review rows.
- Page/API route ordering for promotion routes.
- Review page shows promotion status and manual promote button.
- Safety guard covers no OpenAI, scheduler, publisher, upload, or worker daemon dependency.
- Existing render and review tests still pass.

Validation commands run:

- `git branch --show-current`: `phase-2e5-controlled-approved-promotion`.
- `git merge-base --is-ancestor phase-2e4-complete HEAD`: pass.
- `docker compose --env-file .env.local -f docker-compose.dev.yml config`: pass.
- `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build web-app`: pass.
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec postgres pg_isready -U pesona -d pesona_studio`: pass.
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec redis redis-cli ping`: pass.
- `npm run db:migrate`: pass, migration 014 applied.
- `npm run test:footage-catalog`: pass, 75 tests.
- `npm run check`: pass.
- `git diff --check`: pass.

Runtime config confirmation:

- `CAMPAIGN_PLANNER_PROVIDER=fake`.
- `CAMPAIGN_PLANNER_OPENAI_ENABLED=false`.
- `OPENAI_MODEL` blank.

## Warnings

- Non-blocking: destination filename includes the original draft base name and content code, so it is long but still safe and relative under `smoke/`.
- Non-blocking: failed copy cleanup remains conservative. The service records failed state; it does not delete arbitrary files.

## Final Summary

Phase 2E.5 passed. A manual approved promotion path now copies one approved draft MP4 into `storage/approved-videos/smoke`, records a promotion row, blocks duplicates, and keeps source footage, draft output, attempt row, review row, workers, and automation boundaries unchanged.

Next phase readiness:

- Approved smoke MP4 evidence now exists locally and is ignored by git.
- Future phases can build review board or scheduler handoff on top of promotion rows, but no scheduler, publisher, upload, or automation was added here.
