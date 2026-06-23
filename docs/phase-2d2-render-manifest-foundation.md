# Phase 2D.2 Render Manifest Foundation

Date/time: 2026-06-23 14:52 Asia/Bangkok
Branch: `phase-2d2-render-manifest-foundation`
Baseline tag: `phase-2d1-complete`

## Summary

Phase 2D.2 adds a DB-only render manifest foundation for future video drafting. A manifest snapshots the current video draft job, script plan, shot steps, selected footage relation, and footage metadata into database rows for owner inspection.

This phase does not render video, does not run FFmpeg, does not create JSON/video files, and does not write to storage folders.

## Migration

Added `migrations/010_phase2d_render_manifests.sql`.

Tables added:

- `video_render_manifests`
- `video_render_manifest_items`

The migration is additive-only: `CREATE TABLE` and `CREATE INDEX` statements only. No destructive SQL was added.

Important constraints:

- One manifest per video draft job: `UNIQUE (video_draft_job_id)`.
- Manifest mode is constrained to `metadata_only`.
- Manifest status is constrained to `draft`, `reviewed`, `approved`, `blocked`, or `archived`.
- Target format is constrained to the existing video draft target formats.
- Manifest item snapshots reject unsafe relative path snapshots when present.

## New Runtime Surface

Pages:

- `GET /content-items/:id/video-draft/:jobId/manifest`
- `POST /content-items/:id/video-draft/:jobId/manifest/create`
- `POST /content-items/:id/video-draft/:jobId/manifest/:manifestId/update`

APIs:

- `GET /api/video-draft-jobs/:jobId/render-manifest`
- `POST /api/video-draft-jobs/:jobId/render-manifest`
- `POST /api/render-manifests/:manifestId`

Service functions:

- `getRenderManifestForVideoDraftJob(videoDraftJobId)`
- `getRenderManifestById(manifestId)`
- `createRenderManifestForVideoDraftJob(videoDraftJobId, input)`
- `listRenderManifestItems(manifestId)`
- `updateRenderManifest(manifestId, input)`
- `getRenderManifestContextForContentItem(contentItemId, jobId)`
- `updateRenderManifestForContentItem(contentItemId, jobId, manifestId, input)`

## Manifest Logic

Creating a manifest is atomic and DB-only.

The service verifies:

- video draft job exists
- script plan exists
- script plan belongs to the same content item as the job
- shot plan steps exist
- any selected footage relation referenced by a shot step belongs to the same content item

For each shot step:

- a manifest item row is created
- sequence, step type, notes, overlay, narration, and duration are copied
- selected footage relation and footage asset IDs are copied when present
- footage metadata snapshots are copied when present: relative path, filename, extension, and size
- steps without selected footage receive an item warning and increment `missing_footage_step_count`

Updating a manifest changes only manifest metadata fields: status, mode, target format, warnings, notes, and `updated_at`.

No video draft job, content item, script plan, shot step, selected footage relation, footage asset, or file is mutated by manifest create/update.

## Tests

Validation was added to the footage catalog test suite for:

- missing video draft job rejection
- job without shot steps rejection
- manifest creation with selected footage snapshots
- manifest item ordering by sequence number
- missing selected footage step warning
- duplicate manifest handling
- metadata-only manifest update
- invalid status and mode rejection
- no mutation of related rows or physical files
- page/API route ordering
- no forbidden execution, storage, AI, publishing, or scheduling dependency in runtime source

`npm run check` passed after the implementation and smoke run.

## Runtime Smoke

Commands run included:

- `git branch --show-current`
- `git merge-base --is-ancestor phase-2d1-complete HEAD`
- `git status --short`
- `docker compose --env-file .env.local -f docker-compose.dev.yml config`
- `docker compose --env-file .env.local -f docker-compose.dev.yml ps`
- `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping`
- `npm run db:migrate`
- migration 010 and table existence SQL checks
- `curl -fsS -i http://localhost:3000/content-items`
- `curl -fsS -i http://localhost:3000/api/content-items`
- `curl -fsS -i http://localhost:3000/content-items/97fba682-66f3-4eac-97fe-54f8adbd8063`
- `curl -fsS -i http://localhost:3000/content-items/97fba682-66f3-4eac-97fe-54f8adbd8063/video-draft/f0da0e4f-24e4-4e09-9eb9-8c70915f5c2a/manifest`
- `curl -fsS -i http://localhost:3000/api/video-draft-jobs/f0da0e4f-24e4-4e09-9eb9-8c70915f5c2a/render-manifest`
- `curl -fsS -i -X POST http://localhost:3000/api/video-draft-jobs/f0da0e4f-24e4-4e09-9eb9-8c70915f5c2a/render-manifest`
- `curl -fsS -i -X POST http://localhost:3000/api/render-manifests/55d92873-045d-4b3d-a41f-5de1848d3bd2`
- storage listing checks for `storage/footage`, `storage/draft-videos`, and `storage/approved-videos`
- runtime environment flag check for local fake campaign planner mode
- `npm run check`
- `git diff --check`

One initial inline metadata seed command failed before reaching Docker because shell command substitution collided with inline JavaScript. It was non-blocking. The command was rerun safely with plain string concatenation and created DB metadata only.

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

- migration `010 | phase2d_render_manifests` applied
- `video_render_manifests` exists
- `video_render_manifest_items` exists

## Smoke Data

Created metadata-only smoke rows:

- Campaign: `5ce7ebfd-bd18-4d36-91a9-2c33e6940212`
- Content item: `97fba682-66f3-4eac-97fe-54f8adbd8063`
- Footage asset metadata: `1599fd51-7de9-47f2-9588-fbb3d138bd14`
- Footage relative path metadata: `smoke/p2d2-smoke-1782201117252-reviewed.mp4`
- Selected footage relation: `f4c29b91-86ab-4ca3-8ce4-612ab3cd1320`
- Script plan: `bf542323-a4e3-43b2-8fda-153be0ccc4b8`
- Shot steps:
  - `259432bb-9bcc-46e5-a5d4-2df79a734113`
  - `67012db5-4765-42d9-9f9f-eac3e175f4ec`
- Video draft job: `f0da0e4f-24e4-4e09-9eb9-8c70915f5c2a`
- Render manifest: `55d92873-045d-4b3d-a41f-5de1848d3bd2`

No physical smoke footage, draft video, approved video, or manifest JSON file was created.

## Runtime Verification Results

Before manifest creation:

- Manifest API returned `manifest: null` and empty `items`.
- Manifest page displayed the DB-only create form.

After manifest creation:

- Manifest create API returned `201 Created`.
- Manifest status: `draft`.
- Manifest mode: `metadata_only`.
- Target format: `square_1_1`.
- Item count: `2`.
- Estimated duration: `13`.
- Selected footage count: `1`.
- Missing footage step count: `1`.
- Manifest warning: `Step 2 belum memakai footage terpilih.`

Manifest items:

- Sequence 1 used selected footage and snapshotted:
  - `source_relative_path_snapshot`: `smoke/p2d2-smoke-1782201117252-reviewed.mp4`
  - `source_filename_snapshot`: `p2d2-smoke-1782201117252-reviewed.mp4`
  - `source_file_extension_snapshot`: `.mp4`
  - `source_size_bytes_snapshot`: `0`
- Sequence 2 had no selected footage and received an item warning.

After manifest update:

- Manifest update API returned `200 OK`.
- Manifest status changed to `reviewed`.
- Manifest mode remained `metadata_only`.
- Counts and snapshots remained intact.

Related row verification:

- content item row still exists
- video draft job row still exists
- script plan row still exists
- two shot plan step rows still exist
- selected footage relation row still exists
- footage asset row still exists
- manifest row still exists
- two manifest item rows exist

Immutable footage metadata remained:

- relative path: `smoke/p2d2-smoke-1782201117252-reviewed.mp4`
- filename: `p2d2-smoke-1782201117252-reviewed.mp4`
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
- No manifest JSON file was generated.
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

- Non-blocking: one initial inline metadata seed command failed before Docker execution because of shell command substitution. The corrected command succeeded and produced DB metadata only.
- No blocking warnings remain.

## Final Summary

Pass. Phase 2D.2 implementation, validation, and local runtime smoke are complete for owner review.

Next phase readiness: the system can now inspect a DB-only render manifest for a content item video draft job. Future phases should still avoid real rendering, FFmpeg execution, generated files, and automation until owner approves the controlled render execution design.
