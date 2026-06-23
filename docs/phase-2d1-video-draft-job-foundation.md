# Phase 2D.1 Video Draft Job Foundation

Date/time: 2026-06-23T14:23:21+07:00

Branch: `phase-2d1-video-draft-job-foundation`

Baseline tag: `phase-2c4-complete`

## Summary

Phase 2D.1 adds a metadata-only Video Draft Job foundation. It lets operators track a future video draft request for a content item that already has a Script/Shot Plan.

This phase does not render video, does not run FFmpeg, does not create generated video files, does not upload files, and does not add AI generation, auto-posting, or automated scheduling.

## Migration

Added migration:

```text
migrations/009_phase2d_video_draft_jobs.sql
```

The migration is additive-only:

- `CREATE TABLE video_draft_jobs`
- indexes for `content_item_id`, `script_plan_id`, `job_status`, and `target_format`
- constraints for one job per script plan, enum values, metadata-only render mode, and duration range
- no drop, truncate, delete, or destructive alter statements

## Routes And APIs

New page routes:

- `GET /content-items/:id/video-draft`
- `POST /content-items/:id/video-draft/request`
- `POST /content-items/:id/video-draft/:jobId/update`
- `POST /content-items/:id/video-draft/:jobId/cancel`

New API routes:

- `GET /api/content-items/:id/video-draft`
- `POST /api/content-items/:id/video-draft`
- `POST /api/video-draft-jobs/:jobId`
- `POST /api/video-draft-jobs/:jobId/cancel`

Added links from:

- content item detail page
- Script/Shot Plan page

## Readiness Logic

Readiness is computed metadata only:

- `has_script_plan`
- `shot_step_count`
- `selected_footage_count`
- `steps_with_selected_footage_count`
- `is_ready_for_future_render`
- `readiness_warnings`

Ready is true only when:

- a script plan exists
- at least one shot step exists
- at least one footage selection exists

Shot steps without selected footage produce a warning but do not block the readiness summary.

## Validation And Tests

Added service and validation coverage for:

- readiness without script plan
- readiness with script plan but no shot steps
- readiness with shot steps but no selected footage
- readiness with selected footage and shot steps
- create video draft job for a content item with an existing script plan
- reject create when no script plan exists
- reject mismatched content item and script plan ownership
- duplicate job handling
- update job metadata only
- cancel by status update, not delete
- invalid `job_status`
- invalid `target_format`
- invalid `render_mode`
- invalid `duration_target_seconds`
- route ordering for `/content-items/:id/video-draft`
- no runtime physical file mutation in the practical temp-file test

## Runtime Smoke

Runtime smoke passed.

Commands run included:

```sh
git branch --show-current
git merge-base --is-ancestor phase-2c4-complete HEAD
git status --short
docker compose --env-file .env.local -f docker-compose.dev.yml config
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping
npm run db:migrate
curl -fsS -i http://localhost:3000/content-items
curl -fsS -i http://localhost:3000/api/content-items
curl -fsS -i http://localhost:3000/content-items/035b358f-8a35-4dce-8ff8-4e10e834b882
curl -fsS -i http://localhost:3000/content-items/035b358f-8a35-4dce-8ff8-4e10e834b882/video-draft
curl -fsS -i http://localhost:3000/api/content-items/035b358f-8a35-4dce-8ff8-4e10e834b882/video-draft
npm run check
git diff --check
```

Service status summary:

- `postgres`: running and healthy
- `redis`: running and healthy
- `n8n`: running
- `web-app`: running after rebuild
- `campaign-planner-worker`: running after rebuild
- `video-worker`: running after rebuild
- `mockup-worker`: running after rebuild

Migration and table verification:

- migration `009` applied as `phase2d_video_draft_jobs`
- `to_regclass('public.video_draft_jobs')` returned `video_draft_jobs`

## Smoke Data

Metadata-only smoke rows created:

- campaign code: `P2D1-SMOKE-1782199288170`
- campaign id: `f9131eb5-1b46-4757-acbc-91f83152724a`
- primary content item id: `035b358f-8a35-4dce-8ff8-4e10e834b882`
- mismatch guard content item id: `8d33fbed-8605-4349-b4f9-9cfb2396776a`
- reviewed footage metadata id: `66c30189-cc32-4ba3-bc02-bf97fb5514ee`
- reviewed footage relative path: `smoke/p2d1-smoke-1782199288170-reviewed.mp4`
- selected footage relation id: `e8cf44d1-a02d-4dd6-aafb-6b4f12b2b7fa`
- primary script plan id: `366b15b4-093f-4b61-a150-aa893a29218d`
- mismatch guard script plan id: `7a801a27-e47c-483c-99ea-6cf03fb0f1ed`
- shot step id: `03306080-dbf7-4c95-ad25-a2b08546d63b`
- video draft job id: `dbaf130d-bd44-4b74-8cde-11aeb7161b87`

No physical footage or video file was created for this smoke data.

## Smoke Results

Readiness API returned:

- `has_script_plan: true`
- `shot_step_count: 1`
- `selected_footage_count: 1`
- `steps_with_selected_footage_count: 1`
- `is_ready_for_future_render: true`
- `readiness_warnings: []`

Create job result:

- HTTP `201`
- `job_status: draft_requested`
- `target_format: vertical_9_16`
- `render_mode: disabled_metadata_only`

Update job result:

- HTTP `200`
- `job_status: planning_ready`
- `target_format: square_1_1`
- `duration_target_seconds: 45`
- metadata fields updated only on `video_draft_jobs`

Cancel job result:

- HTTP `200`
- `job_status: cancelled`
- row remained present
- no hard delete was used

Ownership mismatch guard:

- request tried to create a job for content item `035b358f-8a35-4dce-8ff8-4e10e834b882` with script plan `7a801a27-e47c-483c-99ea-6cf03fb0f1ed`
- HTTP `400`
- error code: `script_plan_mismatch`
- existing job remained intact

Persistence check:

- content items: `2`
- script plans: `2`
- shot steps: `1`
- selected footage relations: `1`
- footage assets: `1`
- cancelled video draft jobs: `1`

Immutable footage metadata check:

```text
relative_path: smoke/p2d1-smoke-1782199288170-reviewed.mp4
filename: p2d1-smoke-1782199288170-reviewed.mp4
file_extension: mp4
size_bytes: 0
status: reviewed
```

Storage file listing before and after smoke stayed the same:

```text
storage/approved-videos/.gitkeep
storage/draft-videos/.gitkeep
storage/footage/.gitkeep
```

## Runtime Config

Runtime config check:

```text
CAMPAIGN_PLANNER_PROVIDER=fake
CAMPAIGN_PLANNER_OPENAI_ENABLED=false
OPENAI_MODEL blank/unset
```

No OpenAI live call was made.

## Validation

Validation passed:

```sh
npm run test:footage-catalog
npm run check
git diff --check
```

Safety checks:

- precise runtime file-mutation grep had no matches
- video/AI/automation dependency grep on the new runtime files had no matches
- migration destructive-SQL grep had no matches

Warning:

- a broad file-mutation grep produced non-blocking false positives because the short pattern `rm` matched normal words such as `format`; the narrower exact-term check returned no matches.
- the first two inline smoke setup attempts failed before creating rows because shell interpolation broke the command; the final escaped, parameterized run succeeded.

## Handoff

Operator flow:

1. Open a content item detail page.
2. Use `Script/Shot Plan` to prepare manual planning metadata.
3. Use `Video Draft Job` to inspect readiness.
4. If a script plan exists, create a metadata-only job request.
5. Use `sequence_number` and selected footage in Script/Shot Plan to make future draft planning clear.
6. Use job status and notes to record whether the future draft request is ready, blocked, cancelled, or archived.

Important behavior:

- only an existing script plan can be used
- a script plan from another content item is rejected
- cancelling updates `job_status` to `cancelled`
- cancelling does not delete the job
- updates only change `video_draft_jobs` metadata
- no content item, script plan, shot step, selected footage relation, footage asset, or physical file is deleted or modified by the job workflow

## Next Phase Readiness

Phase 2D.1 is ready for owner review. Future Phase 2D work can add review rules or a controlled preflight dashboard, but actual video rendering, FFmpeg execution, generated output files, worker rendering, upload, auto-posting, and automated scheduling should remain disabled until the owner explicitly approves that scope.
