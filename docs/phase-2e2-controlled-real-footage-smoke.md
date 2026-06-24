# Phase 2E.2 Controlled Real Footage Smoke Render

Date/time: 2026-06-24 05:29 UTC

Branch: `phase-2e2-controlled-real-footage-smoke`

Baseline tag: `phase-2e1-complete`

## Summary

Phase 2E.2 validated one manually supplied real source footage file through the existing controlled render attempt path. The first manual attempt reached the guard but failed because FFmpeg was missing in the `web-app` runtime. The `web-app` image was patched to install FFmpeg with Alpine `apk add --no-cache ffmpeg`, then the same manifest and ready preflight were retried through the existing API path.

Final result: **PASS**.

The successful retry produced one local MP4 output under `storage/draft-videos/smoke`. No source footage was modified, no approved-video output was written, no worker daemon was added, and no scheduler, publisher, upload, auto-posting, or OpenAI behavior was introduced.

## Baseline Checks

- Current branch verified: `phase-2e2-controlled-real-footage-smoke`
- Baseline tag reachable from HEAD: `phase-2e1-complete`
- Initial `git status --short`: clean

## Source Footage

Chosen source footage: `smoke/pesona-smoke-001.mp4`

Selection rule: one safe regular file existed under `storage/footage/smoke`; it was non-empty and used directly. No source footage was created, generated, downloaded, moved, renamed, edited, or deleted.

Source stat before render attempt:

```text
storage/footage/smoke/pesona-smoke-001.mp4 size=3784328 mode=81ed mtime=1782278276 ctime=1782278276 inode=44497
```

Source stat after render attempt:

```text
storage/footage/smoke/pesona-smoke-001.mp4 size=3784328 mode=81ed mtime=1782278276 ctime=1782278276 inode=44497
```

Source unchanged confirmation: size, mode, mtime, ctime, and inode matched before and after.

Successful output stat:

```text
storage/draft-videos/smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4 size=3749627 mode=81a4 mtime=1782278988 ctime=1782278988 inode=41060
```

## Runtime Setup

- `docker compose --env-file .env.local -f docker-compose.dev.yml config`: passed.
- Expected services were running: `postgres`, `redis`, `n8n`, `web-app`, `campaign-planner-worker`, `video-worker`, `mockup-worker`.
- Postgres health: `pg_isready` returned accepting connections.
- Redis health: `redis-cli ping` returned `PONG`.
- `npm run db:migrate`: passed; all migrations skipped as already applied.
- Migration `012`: applied.
- `video_render_attempts` table exists.
- `workers/video` files were not modified.
- `apps/web/Dockerfile` was patched only to add FFmpeg to the `web-app` runtime image.
- `workers/video/Dockerfile` was not modified.

Non-destructive container recreate was run with `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build` after the stale `web-app` container did not see the host bind-mounted `storage/footage/smoke` folder. After recreate, `web-app` could stat `/app/storage/footage/smoke/pesona-smoke-001.mp4`.

After the FFmpeg runtime patch, `web-app` was rebuilt with:

```text
docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build web-app
```

FFmpeg verification inside `web-app`:

```text
ffmpeg version 8.1.1 Copyright (c) 2000-2026 the FFmpeg developers
built with gcc 15.2.0 (Alpine 15.2.0)
```

## DB Rows Created

- Campaign: `443dcade-8b4d-43e0-9483-1845a01a04db`, code `P2E2-SMOKE-1782278550613`
- Content item: `4bc23a96-6d7f-4d37-819a-5a470061d6d3`, code `P2E2-SMOKE-1782278550613`
- Footage asset: `d5a48c26-765b-43b9-888c-8b0133bb3fa9`, relative path `smoke/pesona-smoke-001.mp4`
- Selected footage relation: `05e21a8b-8875-47da-9350-cb3bb84ab7e8`
- Script plan: `25046775-83f0-4085-9e70-d24692513f49`
- Shot plan step: `b6a70126-960a-4bee-9d7c-d3993a129659`
- Video draft job: `62f4c82c-19d1-4408-8192-b12a7dc44249`
- Render manifest: `3cf17da5-a602-4bc5-828b-e89d51363946`
- Manifest item: `527d55e7-b0c6-4b01-b778-41ea8674c8a4`
- Preflight run: `a6e329e3-6dd2-4844-8638-6872fbd938c2`

Preflight result: `ready`, `completed`, `check_count=11`, `blocking_check_count=0`, `warning_check_count=0`.

## Manual Smoke Render Path

Page/API/service path used:

- Page inspected: `GET /content-items/4bc23a96-6d7f-4d37-819a-5a470061d6d3/video-draft/62f4c82c-19d1-4408-8192-b12a7dc44249/manifest/3cf17da5-a602-4bc5-828b-e89d51363946/preflight`
- API inspected: `GET /api/render-manifests/3cf17da5-a602-4bc5-828b-e89d51363946/preflight`
- Preflight run: `POST /api/render-manifests/3cf17da5-a602-4bc5-828b-e89d51363946/preflight/run`
- Render eligibility inspected: `GET /api/render-manifests/3cf17da5-a602-4bc5-828b-e89d51363946/render-attempts`
- Manual render attempted: `POST /api/render-manifests/3cf17da5-a602-4bc5-828b-e89d51363946/render-attempts/run-smoke`

First render attempt:

- Attempt ID: `56c6cda7-3def-400a-84eb-d23702af9ca2`
- Status: `failed`
- Output relative path reserved by attempt: `smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052341.mp4`
- Output size: null
- FFmpeg exit code: null
- Error: `spawn ffmpeg ENOENT`

Successful retry:

- Attempt ID: `0a7b5723-c87f-4ad3-995a-32d66d09aef5`
- Status: `succeeded`
- Output relative path: `smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4`
- Output file: `storage/draft-videos/smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4`
- Output size: `3749627`
- FFmpeg exit code: `0`
- Error: null

DB attempt verification:

```text
56c6cda7-3def-400a-84eb-d23702af9ca2|failed|smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052341.mp4|||spawn ffmpeg ENOENT
0a7b5723-c87f-4ad3-995a-32d66d09aef5|succeeded|smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4|3749627|0|
```

## Storage Evidence

Before render attempt:

```text
storage/footage/smoke/pesona-smoke-001.mp4 3784328 bytes
storage/draft-videos/.gitkeep 67 bytes
storage/approved-videos/.gitkeep 70 bytes
```

After first failed render attempt:

```text
storage/footage/smoke/pesona-smoke-001.mp4 3784328 bytes
storage/draft-videos/.gitkeep 67 bytes
storage/approved-videos/.gitkeep 70 bytes
```

After successful retry:

```text
storage/footage/smoke/pesona-smoke-001.mp4 3784328 bytes
storage/draft-videos/.gitkeep 67 bytes
storage/draft-videos/smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4 3749627 bytes
storage/approved-videos/.gitkeep 70 bytes
```

Confirmations:

- Successful output exists only under `storage/draft-videos/smoke`.
- Output file is non-empty.
- `storage/approved-videos` unchanged.
- Source footage unchanged.
- No write to `storage/footage`.
- No output was overwritten.

## Runtime Config

- `CAMPAIGN_PLANNER_PROVIDER=fake`
- `CAMPAIGN_PLANNER_OPENAI_ENABLED=false`
- `OPENAI_MODEL` blank

No OpenAI live call was made. No upload, scheduler, publisher, auto-posting, AI tagging, AI analysis, worker daemon, or auto-render loop was added.

## Validation Commands Run

- `git branch --show-current`
- `git tag --merged HEAD --list phase-2e1-complete`
- `git status --short`
- `find storage/footage/smoke -maxdepth 1 -type f -printf "%p %s bytes\n" | sort`
- `docker compose --env-file .env.local -f docker-compose.dev.yml config`
- `docker compose --env-file .env.local -f docker-compose.dev.yml ps`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping`
- `npm run db:migrate`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -tAc "SELECT version FROM schema_migrations WHERE version='012';"`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -tAc "SELECT to_regclass('public.video_render_attempts');"`
- `git diff --name-only -- workers/video`
- `stat -c '%n size=%s mode=%f mtime=%Y ctime=%Z inode=%i' storage/footage/smoke/pesona-smoke-001.mp4`
- `find storage/draft-videos -maxdepth 3 -type f -printf "%p %s bytes\n" | sort`
- `find storage/approved-videos -maxdepth 3 -type f -printf "%p %s bytes\n" | sort`
- `curl -fsS -i http://localhost:3000/content-items/4bc23a96-6d7f-4d37-819a-5a470061d6d3/video-draft/62f4c82c-19d1-4408-8192-b12a7dc44249/manifest/3cf17da5-a602-4bc5-828b-e89d51363946/preflight`
- `curl -fsS -i http://localhost:3000/api/render-manifests/3cf17da5-a602-4bc5-828b-e89d51363946/preflight`
- `curl -fsS -i -X POST http://localhost:3000/api/render-manifests/3cf17da5-a602-4bc5-828b-e89d51363946/preflight/run`
- `curl -fsS -i http://localhost:3000/api/render-manifests/3cf17da5-a602-4bc5-828b-e89d51363946/render-attempts`
- `curl -fsS -i -X POST http://localhost:3000/api/render-manifests/3cf17da5-a602-4bc5-828b-e89d51363946/render-attempts/run-smoke`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app which ffmpeg`
- `which ffmpeg`
- `ffmpeg -version`
- `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build web-app`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app ffmpeg -version`
- `curl -fsS -i -X POST http://localhost:3000/api/render-manifests/3cf17da5-a602-4bc5-828b-e89d51363946/render-attempts/run-smoke`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv CAMPAIGN_PLANNER_PROVIDER`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv CAMPAIGN_PLANNER_OPENAI_ENABLED`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv OPENAI_MODEL`

## Check Results

- `git diff --check`: passed.
- `npm run check`: passed.
- Document grep for restricted environment-key patterns: no matches.
- Runtime safety grep on changed files found only expected documentation mentions plus the `web-app` Dockerfile FFmpeg install; no runtime service code was changed.
- `git diff --stat`: `apps/web/Dockerfile | 2 ++`
- `git diff --name-only`: `apps/web/Dockerfile`
- `git status --short`:

```text
 M apps/web/Dockerfile
?? docs/phase-2e2-controlled-real-footage-smoke.md
```

## Warnings

- Resolved: FFmpeg was initially missing in the `web-app` container and caused failed attempt `56c6cda7-3def-400a-84eb-d23702af9ca2`.
- Non-blocking: the first `web-app` container instance did not see the manually supplied source folder through the bind mount until a non-destructive recreate was run.

## Final Pass/Fail

Final summary: **PASS** for Phase 2E.2 success criteria after the `web-app` FFmpeg runtime patch.

Safety summary: **PASS** for storage and automation boundaries. Source footage was unchanged, approved video storage was unchanged, output was written only under the allowed draft smoke path, no OpenAI live call happened, no upload/scheduler/publisher behavior was added, and `workers/video` remained untouched.

## Next Phase Readiness

Phase 2E.2 is ready for owner review. The next phase can decide whether FFmpeg belongs permanently in the manual web runtime or should move to a later approved render-worker execution model. Keep future expansion manual-only until owner approves worker execution, queueing, upload, scheduler, publisher, or broader automation.
