# Phase 2E.4 Draft Render Review & Approval Gate

## Baseline

- Phase: Phase 2E.4 Draft Render Review & Approval Gate DB-only + Tests + Runtime Smoke Evidence.
- Branch: `phase-2e4-draft-render-review-gate`.
- Baseline tag: `phase-2e3-complete`.
- Baseline check: `phase-2e3-complete` is reachable from `HEAD`.

## DB-only Approval Gate

Phase 2E.4 adds `video_render_attempt_reviews` as a DB-only lifecycle table for succeeded draft render attempts. Approval and rejection do not mutate `video_render_attempts`, do not copy or move MP4 files, and do not write to `storage/approved-videos`.

Migration added:

- `migrations/013_phase2e_render_review_gate.sql`

Table summary:

- `id uuid primary key default gen_random_uuid()`
- `render_attempt_id uuid not null references video_render_attempts(id)`
- `render_manifest_id uuid not null references video_render_manifests(id)`
- `video_draft_job_id uuid not null references video_draft_jobs(id)`
- `content_item_id uuid not null references content_items(id)`
- `review_status text not null default 'pending_review'`
- `review_note text`
- `reviewed_by_name text`
- `reviewed_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints and indexes:

- Unique review row per render attempt.
- Status limited to `pending_review`, `approved`, `rejected`, `archived`.
- Approved and rejected rows require `reviewed_at`.
- Indexes on render attempt, manifest, draft job, content item, review status, and created time.

Lifecycle choice:

- `pending_review` can transition to `approved` or `rejected`.
- `approved`, `rejected`, and `archived` are terminal in this phase.
- No reset route was added. This keeps Phase 2E.4 conservative and prevents accidental status churn.

## Implementation Summary

Added service and validation:

- `apps/web/src/render-attempt-review-service.ts`
- `apps/web/src/render-attempt-review-errors.ts`
- `apps/web/src/validation/render-attempt-review-validation.ts`

Eligibility rules:

- Attempt must exist and belong to the content item, draft job, and manifest relationship.
- Attempt status must be `succeeded`.
- Output path must be a guarded `smoke/*.mp4` path.
- Output file must exist under `storage/draft-videos/smoke`.
- Output file and output metadata size must be non-empty.
- Review GET/read operations do not create rows.
- POST approve/reject writes only the review row.

Routes added:

- `GET /api/render-attempts/:attemptId/review`
- `POST /api/render-attempts/:attemptId/review/approve`
- `POST /api/render-attempts/:attemptId/review/reject`
- `GET /content-items/:id/video-draft/:jobId/manifest/:manifestId/render-attempts/:attemptId/review`
- `POST /content-items/:id/video-draft/:jobId/manifest/:manifestId/render-attempts/:attemptId/review/approve`
- `POST /content-items/:id/video-draft/:jobId/manifest/:manifestId/render-attempts/:attemptId/review/reject`

UI integration:

- Render attempts page now shows review status.
- Succeeded attempts show a Review link.
- Review page shows content, job, manifest, attempt, output eligibility, current review status, approve form, reject form, and DB-only safety notice.

## Runtime Smoke Evidence

Runtime services:

- Docker Compose config resolved.
- `web-app` rebuilt and restarted only.
- Postgres health: accepting connections.
- Redis health: `PONG`.
- Web app reachable: `GET /content-items` returned HTTP 200.
- Web-app FFmpeg confirmation: `ffmpeg version 8.1.1`.

Migration/runtime DB:

- `npm run db:migrate` applied `013_phase2e_render_review_gate.sql`.
- `video_render_attempt_reviews` exists.

Reviewed runtime attempt:

- Render attempt id: `f087e2eb-9df8-4161-a4e2-31f125d57534`.
- Attempt status before approval: `succeeded`.
- Output relative path reviewed: `smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4`.
- Output file size: `5,032,913` bytes.
- FFmpeg exit code: `0`.

Review result:

- API approval route returned HTTP 201.
- Review row id: `19d3949b-1126-4b8d-b7d6-99d406fd8463`.
- Review row status: `approved`.
- `reviewed_at`: `2026-06-24T06:36:52.995Z`.
- Review note: Phase 2E.4 DB-only runtime approval smoke.

Attempt row safety:

- Attempt row after approval stayed `succeeded`.
- Output relative path stayed `smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4`.
- Output size metadata stayed `5,032,913`.
- FFmpeg exit code stayed `0`.
- `updated_at` stayed `2026-06-24T06:00:11.098Z`.

Source and output stat confirmation:

- `storage/footage/smoke/pesona-smoke-001.mp4`: size `3,784,328`, mtime `1782278276`, mode `755` before and after.
- `storage/footage/smoke/pesona-smoke-002.mp4`: size `1,350,453`, mtime `1782280287`, mode `755` before and after.
- `storage/footage/smoke/pesona-smoke-003.mp4`: size `1,203,310`, mtime `1782280334`, mode `755` before and after.
- `storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4`: size `5,032,913`, mtime `1782280811`, mode `644` before and after.
- `storage/approved-videos/.gitkeep`: size `70`, mtime `1781846550`, mode `644` before and after.

Storage confirmation:

- No new render output was created in this phase.
- Existing output remained only under `storage/draft-videos/smoke`.
- `storage/approved-videos` remained unchanged.
- Source footage remained unchanged.

Runtime config confirmation:

- `CAMPAIGN_PLANNER_PROVIDER=fake`.
- `CAMPAIGN_PLANNER_OPENAI_ENABLED=false`.
- `OPENAI_MODEL` blank.
- No live OpenAI call was made.
- No upload, scheduler, publisher, auto-posting, queue, or worker daemon was added.
- `workers/video` was not modified.

## Tests And Validation

Tests added/updated:

- Review context rejects missing attempt.
- Review context validates content/job/manifest/attempt ownership.
- Approval requires succeeded attempt.
- Approval blocks non-succeeded attempts.
- Approval requires guarded smoke output.
- Approval requires physical output file exists.
- Approval requires non-empty output metadata and physical file.
- Approval writes only review row and keeps attempt/source/output files unchanged.
- Rejection requires succeeded attempt and stores note safely.
- Terminal review cannot be changed in this phase.
- Page/API route ordering for review routes.
- Render attempts page shows review status and Review link.
- Safety checks for no approved-videos write, no OpenAI/scheduler/publisher/upload dependency, and no workers/video modification.
- Existing single-shot and multi-shot tests still pass.

Validation commands run:

- `git branch --show-current`: `phase-2e4-draft-render-review-gate`.
- `git merge-base --is-ancestor phase-2e3-complete HEAD`: pass.
- `docker compose --env-file .env.local -f docker-compose.dev.yml config`: pass.
- `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build web-app`: pass.
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec web-app ffmpeg -version`: pass, FFmpeg `8.1.1`.
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec postgres pg_isready -U pesona -d pesona_studio`: pass.
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec redis redis-cli ping`: pass.
- `npm run db:migrate`: pass, migration 013 applied.
- `npm run test:footage-catalog`: pass, 70 tests.
- `npm run check`: pass.
- `git diff --check`: pass.

## Warnings

- Non-blocking: runtime approval used an existing Phase 2E.3 succeeded multi-shot smoke attempt instead of creating a new render output, as intended for this DB-only phase.
- Non-blocking: rejection was covered by tests; runtime smoke approved one existing succeeded attempt to avoid extra file generation.

## Final Summary

Phase 2E.4 passed. A DB-only review gate was added with migration, service, API/page routes, UI integration, tests, and runtime approval evidence. The approved runtime review row was recorded without mutating source footage, draft MP4 output, approved-videos storage, render attempt metadata, workers/video, or any automation path.

Next phase readiness:

- DB now has terminal review records for succeeded draft attempts.
- A future owner-approved phase can decide whether and how approved draft files are promoted, but Phase 2E.4 intentionally performs no file promotion.
