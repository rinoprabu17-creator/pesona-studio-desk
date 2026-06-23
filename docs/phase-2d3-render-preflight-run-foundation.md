# Phase 2D.3 Render Preflight Run Foundation

Date/time: 2026-06-23 15:23 Asia/Bangkok
Branch: `phase-2d3-render-preflight-run-foundation`
Baseline tag: `phase-2d2-complete`

## Summary

Phase 2D.3 adds a DB-only render preflight run foundation. A preflight run reads a DB-only render manifest and inserts structured readiness checks into database rows. It is a deterministic inspection step for future local rendering readiness.

This phase does not render video, does not run FFmpeg, does not create JSON/video files, does not write to storage folders, and does not modify video worker files.

## Migration

Added `migrations/011_phase2d_render_preflight_runs.sql`.

Tables added:

- `video_render_preflight_runs`
- `video_render_preflight_checks`

The migration is additive-only: `CREATE TABLE` and `CREATE INDEX` statements only. No destructive SQL was added.

Important constraints:

- Run status is constrained to `completed` or `archived`.
- Preflight result is constrained to `ready` or `blocked`.
- Check level is constrained to `info`, `warning`, or `blocking`.
- Check status is constrained to `pass` or `fail`.
- Check counts must be non-negative.

## New Runtime Surface

Pages:

- `GET /content-items/:id/video-draft/:jobId/manifest/:manifestId/preflight`
- `POST /content-items/:id/video-draft/:jobId/manifest/:manifestId/preflight/run`

APIs:

- `GET /api/render-manifests/:manifestId/preflight`
- `POST /api/render-manifests/:manifestId/preflight/run`
- `GET /api/render-preflight-runs/:runId`

Service functions:

- `getRenderPreflightContextForManifest(manifestId)`
- `getRenderPreflightContextForContentItem(contentItemId, jobId, manifestId)`
- `runRenderPreflightForManifest(manifestId)`
- `getRenderPreflightRunById(runId)`
- `listRenderPreflightRunsForManifest(manifestId)`
- `listRenderPreflightChecks(runId)`
- `buildRenderPreflightChecks(manifest, items)`

## Preflight Logic

Creating a preflight run is atomic and DB-only.

The service reads:

- render manifest
- video draft job
- content item
- script plan ownership through the manifest/job relation
- render manifest items

The service inserts only:

- one `video_render_preflight_runs` row
- one or more `video_render_preflight_checks` rows

It does not update or delete render manifests, manifest items, video draft jobs, content items, script plans, shot steps, selected footage relations, footage assets, or files.

## Ready / Blocked Rules

Result is `ready` if no blocking check fails.

Result is `blocked` if at least one blocking check fails.

Blocking checks include:

- manifest exists
- manifest mode is `metadata_only`
- manifest status is `reviewed` or `approved`
- video draft job render mode is `disabled_metadata_only`
- video draft job is not `cancelled` and not `archived`
- manifest has at least one item
- manifest item count matches actual item rows
- item snapshot paths are safe relative paths
- estimated duration is absent or at most 600 seconds

Warnings include:

- manifest status is `draft`
- manifest has missing footage step count
- item has no footage snapshot
- item duration is missing
- manifest warnings text exists
- item warning text exists
- selected footage count mismatch

Informational checks include:

- manifest exists
- target format is valid

Policy note: `draft` manifest status is warning-only in this phase, not blocking.

## Tests

Added or updated tests for:

- missing manifest rejection
- ready result for reviewed/approved manifest with safe snapshots
- draft manifest warning behavior
- multiple preflight runs for the same manifest
- cancelled video draft job blocking behavior
- manifest item count mismatch blocking behavior
- missing footage item warning checks
- unsafe snapshot path blocking rule
- generated status validation helpers
- route ordering for preflight page/API
- no mutation of related rows or physical files
- no forbidden execution, storage, AI, publishing, or scheduling dependency in runtime source

Validation passed:

- `npm run test:footage-catalog`
- `npm run check`
- `git diff --check`

## Runtime Smoke

Commands run included:

- `git branch --show-current`
- `git merge-base --is-ancestor phase-2d2-complete HEAD`
- `git status --short`
- `docker compose --env-file .env.local -f docker-compose.dev.yml config`
- `docker compose --env-file .env.local -f docker-compose.dev.yml ps`
- `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping`
- `npm run db:migrate`
- migration 011 and table existence SQL checks
- `curl -fsS -i http://localhost:3000/content-items`
- `curl -fsS -i http://localhost:3000/api/content-items`
- `curl -fsS -i http://localhost:3000/content-items/000adcce-dc13-476f-a4ee-3802b9d80c82/video-draft/3a20a2fc-12a2-443b-9e86-1adc54b3259e/manifest`
- `curl -fsS -i http://localhost:3000/content-items/000adcce-dc13-476f-a4ee-3802b9d80c82/video-draft/3a20a2fc-12a2-443b-9e86-1adc54b3259e/manifest/27c2ac63-3886-4527-937c-c5f51179cc5b/preflight`
- `curl -fsS -i http://localhost:3000/api/render-manifests/27c2ac63-3886-4527-937c-c5f51179cc5b/preflight`
- `curl -fsS -i -X POST http://localhost:3000/api/render-manifests/27c2ac63-3886-4527-937c-c5f51179cc5b/preflight/run`
- `curl -fsS -i http://localhost:3000/api/render-preflight-runs/6d231854-948e-4f32-a958-ae515c3d3e74`
- storage listing checks for `storage/footage`, `storage/draft-videos`, and `storage/approved-videos`
- runtime local/fake campaign planner flag check
- `npm run check`
- `git diff --check`

Service status:

- `postgres`: running and healthy
- `redis`: running and healthy
- `n8n`: running
- `web-app`: running
- `campaign-planner-worker`: running
- `video-worker`: running
- `mockup-worker`: running

Health checks:

- Postgres: accepting connections
- Redis: `PONG`

Migration verification:

- migration `011 | phase2d_render_preflight_runs` applied
- `video_render_preflight_runs` exists
- `video_render_preflight_checks` exists

## Smoke Data

Created metadata-only smoke rows:

- Campaign: `46bbf72d-8a2b-43de-9e4d-52c62a2d4ac9`
- Content item: `000adcce-dc13-476f-a4ee-3802b9d80c82`
- Footage asset metadata: `458d9637-597d-4b2f-9bea-0492e7f418af`
- Footage relative path metadata: `smoke/p2d3-smoke-1782202970615-reviewed.mp4`
- Selected footage relation: `f1c962d4-ffca-4aa6-8673-8f9cff22927d`
- Script plan: `4389cd9a-5bc9-48f3-be16-36348ec524b8`
- Shot steps:
  - `c33c23d5-1fa3-4ea2-9ef6-8a0622ecbff7`
  - `549edc4a-9e21-4962-90f4-728d63d22e63`
- Video draft job: `3a20a2fc-12a2-443b-9e86-1adc54b3259e`
- Render manifest: `27c2ac63-3886-4527-937c-c5f51179cc5b`
- Manifest items:
  - `603f7d46-8bcc-4100-bd25-5d8650571e2f`
  - `06131443-e3d2-4c40-8417-acd434ad762a`
- Render preflight run: `6d231854-948e-4f32-a958-ae515c3d3e74`

No physical smoke footage, draft video, approved video, preflight report, or manifest JSON file was created.

## Runtime Verification Results

Before preflight:

- Preflight page loaded with the DB-only run button.
- Preflight API returned `latestRun: null`, `latestChecks: []`, and `runs: []`.

After preflight:

- Preflight run API returned `201 Created`.
- Run status: `completed`.
- Preflight result: `ready`.
- Check count: `16`.
- Blocking check count: `0`.
- Warning check count: `4`.
- Summary: `Preflight ready dengan 4 warning.`

Expected warning checks appeared because the smoke manifest intentionally included one step without selected footage:

- `manifest_missing_footage_steps`
- `manifest_warnings_present`
- `item_without_footage_snapshot`
- `item_warning_present`

Related row verification:

- content item row still exists
- video draft job row still exists
- script plan row still exists
- two shot plan step rows still exist
- selected footage relation row still exists
- footage asset row still exists
- render manifest row still exists
- two manifest item rows still exist
- preflight run row exists
- sixteen preflight check rows exist

Immutable footage metadata remained:

- relative path: `smoke/p2d3-smoke-1782202970615-reviewed.mp4`
- filename: `p2d3-smoke-1782202970615-reviewed.mp4`
- extension: `.mp4`
- size: `0`
- status: `reviewed`

Storage listing after smoke matched the pre-smoke listing:

- `storage/approved-videos/.gitkeep`
- `storage/draft-videos/.gitkeep`
- `storage/footage/.gitkeep`

## Safety Confirmations

- No physical footage file was created, modified, moved, copied, renamed, or deleted.
- No draft video file was created or modified.
- No approved video file was created or modified.
- No manifest JSON or preflight report file was generated.
- No OpenAI live call was made.
- Campaign Planner runtime remained fake/local.
- OpenAI runtime flag remained disabled.
- OpenAI model value was blank.
- No video render was implemented.
- No FFmpeg integration was added.
- No scheduler, publisher, upload, or auto-posting was added.
- `workers/video` files were not modified.
- No Docker volumes were deleted.
- No commit, tag, or push was made.

## Warnings

- Non-blocking: runtime preflight result is `ready` with 4 warnings because the smoke manifest intentionally includes one shot step without a footage snapshot.
- No blocking warnings remain.

## Final Summary

Pass. Phase 2D.3 implementation, validation, and local runtime smoke are complete for owner review.

Next phase readiness: the system can now inspect a DB-only preflight result for a DB-only render manifest. Future phases should still avoid real rendering, FFmpeg execution, generated files, and automation until owner approves the controlled render execution design.
