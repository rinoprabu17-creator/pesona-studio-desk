# Phase 2E.1 Controlled Local FFmpeg Prototype

Date/time: 2026-06-23 09:03 UTC

Branch: `phase-2e1-controlled-local-ffmpeg-prototype`

Baseline tag: `phase-2d3-complete`

## Summary

Phase 2E.1 adds a manual-only controlled render attempt layer for future local smoke video output. The feature is intentionally narrow:

- Stores render attempt metadata in PostgreSQL.
- Requires a reviewed or approved render manifest.
- Requires the latest render preflight run to be ready.
- Reads source footage only from `storage/footage`.
- Writes output only to `storage/draft-videos/smoke` when all guards pass.
- Does not overwrite an existing output.
- Does not modify source footage, manifest items, preflight rows, content rows, script plans, shot steps, selected footage, or footage asset metadata.
- Does not touch `workers/video`.

The implementation uses a small isolated FFmpeg helper in `apps/web/src/render-attempt-service.ts`. FFmpeg is invoked with `child_process.spawn` and an argument array, not a shell command string. Unit tests use a mocked runner for the successful output path so the test suite does not require FFmpeg.

## Migration

Added migration: `migrations/012_phase2e_controlled_render_attempts.sql`

New table:

- `video_render_attempts`

Key constraints:

- `attempt_status` is limited to `requested`, `running`, `succeeded`, `failed`, `blocked`, `archived`.
- `attempt_mode` is limited to `manual_smoke`.
- `output_relative_path` must be null or `smoke/*.mp4`, with no leading slash, no backslash, and no traversal.
- `output_size_bytes` and `ffmpeg_exit_code` must be null or non-negative.

The migration is additive-only: `CREATE TABLE` and `CREATE INDEX` only.

## New Routes

Page routes:

- `GET /content-items/:id/video-draft/:jobId/manifest/:manifestId/render-attempts`
- `POST /content-items/:id/video-draft/:jobId/manifest/:manifestId/render-attempts/run-smoke`

API routes:

- `GET /api/render-manifests/:manifestId/render-attempts`
- `POST /api/render-manifests/:manifestId/render-attempts/run-smoke`
- `GET /api/render-attempts/:attemptId`

Existing page link added:

- Render Preflight page links to Controlled Smoke Render when the latest preflight result is ready.

## Tests

Updated `tests/footage-catalog/footage-catalog.test.ts`.

Coverage added:

- Missing manifest rejection.
- Missing ready preflight rejection.
- Blocked latest preflight creates a blocked attempt.
- Unsafe source snapshot path validation.
- Unsafe output path validation.
- Missing physical source blocks safely.
- Existing output blocks safely without overwrite.
- FFmpeg args are built as an argument array.
- Mocked successful render records `smoke/*.mp4` metadata.
- Successful mocked render leaves source file and planning rows intact.
- Invalid attempt status/mode rejection.
- Page/API route ordering.
- Runtime dependency guard checks.
- No `workers/video` modification.
- No approved-video storage writes.

Validation:

- `npm run test:footage-catalog` passed: 57 tests, 57 pass.
- `npm run check` passed.
- `git diff --check` passed.

## Runtime Smoke

Services:

- `postgres`: running and healthy.
- `redis`: running and healthy.
- `n8n`: running.
- `web-app`: running after non-destructive rebuild.
- `campaign-planner-worker`: running.
- `video-worker`: running.
- `mockup-worker`: running.

Migration/table verification:

- `npm run db:migrate` applied `012_phase2e_controlled_render_attempts.sql`.
- `schema_migrations` includes `012`.
- `to_regclass('public.video_render_attempts')` returned `video_render_attempts`.

Storage check before smoke:

- `storage/footage`: only `.gitkeep`.
- `storage/draft-videos`: only `.gitkeep`.
- `storage/approved-videos`: only `.gitkeep`.

Smoke metadata rows created:

- Campaign: `P2E1-SMOKE-1782205364065`
- Content item: `616aaffd-3030-4185-af7b-72afa8fe8957`
- Footage asset: `059541a5-d437-4e99-826f-10f5b77b3b7e`
- Footage relative path: `smoke/phase-2e1-missing-source-1782205364065.mp4`
- Selected footage relation: `a40dd407-086b-496a-8f12-1e930b38fb47`
- Script plan: `17f325b5-eb6e-4b95-905f-8796c7be53d1`
- Shot step: `8adb87bf-8609-4b8f-bd8a-bba6d3f43979`
- Video draft job: `a339c66e-b809-4283-b28c-766d46956d72`
- Render manifest: `1c182305-0775-4bb5-bf7c-8fdbe5e4d297`
- Preflight run: `f43e9e04-699b-4836-ac80-65f2e68f840b`
- Preflight result: `ready`

Page/API verification:

- `GET /content-items` returned HTTP 200.
- `GET /api/content-items` returned HTTP 200.
- `GET /content-items/616aaffd-3030-4185-af7b-72afa8fe8957` returned HTTP 200.
- `GET /content-items/616aaffd-3030-4185-af7b-72afa8fe8957/video-draft/a339c66e-b809-4283-b28c-766d46956d72/manifest/1c182305-0775-4bb5-bf7c-8fdbe5e4d297/preflight` returned HTTP 200.
- `GET /content-items/616aaffd-3030-4185-af7b-72afa8fe8957/video-draft/a339c66e-b809-4283-b28c-766d46956d72/manifest/1c182305-0775-4bb5-bf7c-8fdbe5e4d297/render-attempts` returned HTTP 200.
- `GET /api/render-manifests/1c182305-0775-4bb5-bf7c-8fdbe5e4d297/render-attempts` returned HTTP 200.

Manual render attempt:

- `POST /api/render-manifests/1c182305-0775-4bb5-bf7c-8fdbe5e4d297/render-attempts/run-smoke` returned HTTP 201.
- Attempt ID: `0018746b-09ea-477d-ae0e-0ee43d32fd45`
- Attempt status: `blocked`
- Error: `Source footage fisik tidak ditemukan di storage footage.`
- `output_relative_path`: null
- `output_size_bytes`: null
- `ffmpeg_exit_code`: null
- `ffmpeg_command_preview`: null

Real FFmpeg render result:

- Real FFmpeg render was skipped.
- Reason: no real source footage file exists under `storage/footage`; the only file there is `.gitkeep`.
- The manual trigger blocked before FFmpeg execution and before any output file path was written.

Storage check after smoke:

- `storage/footage`: only `.gitkeep`.
- `storage/draft-videos`: only `.gitkeep`.
- `storage/approved-videos`: only `.gitkeep`.

No source footage file was modified. No draft or approved video file was created.

## Commands Run

- `git branch --show-current`
- `git merge-base --is-ancestor phase-2d3-complete HEAD`
- `git status --short`
- `docker compose --env-file .env.local -f docker-compose.dev.yml config`
- `docker compose --env-file .env.local -f docker-compose.dev.yml ps`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping`
- `npm run test:footage-catalog`
- `npm run db:migrate`
- `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -tAc "SELECT version FROM schema_migrations WHERE version='012';"`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -tAc "SELECT to_regclass('public.video_render_attempts');"`
- `curl -fsS -i http://localhost:3000/content-items`
- `curl -fsS -i http://localhost:3000/api/content-items`
- `curl -fsS -i http://localhost:3000/content-items/616aaffd-3030-4185-af7b-72afa8fe8957`
- `curl -fsS -i http://localhost:3000/content-items/616aaffd-3030-4185-af7b-72afa8fe8957/video-draft/a339c66e-b809-4283-b28c-766d46956d72/manifest/1c182305-0775-4bb5-bf7c-8fdbe5e4d297/preflight`
- `curl -fsS -i http://localhost:3000/content-items/616aaffd-3030-4185-af7b-72afa8fe8957/video-draft/a339c66e-b809-4283-b28c-766d46956d72/manifest/1c182305-0775-4bb5-bf7c-8fdbe5e4d297/render-attempts`
- `curl -fsS -i http://localhost:3000/api/render-manifests/1c182305-0775-4bb5-bf7c-8fdbe5e4d297/render-attempts`
- `curl -fsS -i -X POST http://localhost:3000/api/render-manifests/1c182305-0775-4bb5-bf7c-8fdbe5e4d297/render-attempts/run-smoke`
- `curl -fsS -i http://localhost:3000/api/render-attempts/0018746b-09ea-477d-ae0e-0ee43d32fd45`
- `find storage/footage -maxdepth 3 -type f -printf '%p %s %TY-%Tm-%Td %TH:%TM:%TS\n'`
- `find storage/draft-videos storage/approved-videos -maxdepth 3 -type f -printf '%p %s %TY-%Tm-%Td %TH:%TM:%TS\n'`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv CAMPAIGN_PLANNER_PROVIDER`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv CAMPAIGN_PLANNER_OPENAI_ENABLED`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv OPENAI_MODEL`
- `git diff --name-only -- workers/video`
- `npm run check`
- `git diff --check`

One local test database maintenance command was also run after an uncommitted migration regex fix had already been applied once to the test database. It updated only the test database copy of the migration checksum and output-path constraint so the local test harness matched the patched migration. This did not touch the runtime database or storage.

## Safety Confirmation

- Manual trigger only.
- No scheduler added.
- No publisher added.
- No auto-posting added.
- No upload added.
- No OpenAI live call made.
- No AI tagging or AI analysis added.
- No paid cloud dependency added.
- No worker daemon added.
- `workers/video` files were not modified.
- No source footage file was created, edited, moved, renamed, or deleted.
- No file was written to `storage/footage`.
- No file was written to `storage/approved-videos`.
- No JSON file was generated in storage.
- No real render ran because no safe source footage file existed.
- The blocked runtime attempt wrote DB attempt metadata only.

Runtime config:

- `CAMPAIGN_PLANNER_PROVIDER=fake`
- `CAMPAIGN_PLANNER_OPENAI_ENABLED=false`
- `OPENAI_MODEL` blank

## Warnings

- Non-blocking: real FFmpeg output was skipped because there is no real source footage file under `storage/footage`. This is the expected safe outcome for the current local storage state.
- Non-blocking: `docker compose up -d --build` rebuilt/recreated app and worker containers to load the new code, but did not remove volumes.

## Next Phase Readiness

Phase 2E.1 is ready for owner review. A future phase can add a controlled fixture or owner-approved real footage sample to verify an actual local FFmpeg smoke output. Any future expansion should remain manual until owner approves worker execution, queueing, publishing, or broader render behavior.
