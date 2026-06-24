# Phase 2E.3 Controlled Multi-Shot Smoke Render

Date/time: 2026-06-24 06:00 UTC

Branch: `phase-2e3-controlled-multishot-smoke`

Baseline tag: `phase-2e2-complete`

## Summary

Phase 2E.3 adds a guarded manual multi-shot smoke render path to the existing controlled render attempt service. The new path uses 2-3 source-backed manifest items in sequence order and renders one local MP4 under `storage/draft-videos/smoke`.

Final result: **PASS**.

One real local multi-shot smoke render succeeded through the new manual API/service path using three owner-supplied source footage files under `storage/footage/smoke`.

## Source Footage

Chosen source files, selected lexicographically:

- `smoke/pesona-smoke-001.mp4` - `3784328` bytes
- `smoke/pesona-smoke-002.mp4` - `1350453` bytes
- `smoke/pesona-smoke-003.mp4` - `1203310` bytes

Source stat before render:

```text
storage/footage/smoke/pesona-smoke-001.mp4 size=3784328 mode=81ed mtime=1782278276 ctime=1782278276 inode=44497
storage/footage/smoke/pesona-smoke-002.mp4 size=1350453 mode=81ed mtime=1782280287 ctime=1782280287 inode=41056
storage/footage/smoke/pesona-smoke-003.mp4 size=1203310 mode=81ed mtime=1782280334 ctime=1782280334 inode=44691
```

Source stat after render:

```text
storage/footage/smoke/pesona-smoke-001.mp4 size=3784328 mode=81ed mtime=1782278276 ctime=1782278276 inode=44497
storage/footage/smoke/pesona-smoke-002.mp4 size=1350453 mode=81ed mtime=1782280287 ctime=1782280287 inode=41056
storage/footage/smoke/pesona-smoke-003.mp4 size=1203310 mode=81ed mtime=1782280334 ctime=1782280334 inode=44691
```

Source unchanged confirmation: size, mode, mtime, ctime, and inode matched before and after for all three files.

## Implementation

Runtime files changed:

- `apps/web/src/render-attempt-service.ts`
- `apps/web/src/routes/content-item-api-routes.ts`
- `apps/web/src/routes/content-item-page-routes.ts`
- `apps/web/src/views/content-item-pages.ts`

Test file changed:

- `tests/footage-catalog/footage-catalog.test.ts`

Implementation summary:

- Added `runControlledMultiShotSmokeRenderForManifest`.
- Added `validateControlledMultiShotRenderEligibility`.
- Added `buildSafeFfmpegMultiShotArgs`.
- Multi-shot render uses FFmpeg `filter_complex` with an argument array.
- It uses 2-3 safe manifest source items in sequence order.
- Each clip is trimmed to 5 seconds; total output is capped at 15 seconds.
- Video is normalized with scale/pad to the manifest target format.
- Audio is disabled with `-an`.
- Output still uses existing `manual_smoke` attempt mode and existing DB table.
- Existing single-shot `run-smoke` route remains in place.

Concat temp file: **not used**. No concat list file or temporary render list is written, so there is no temp cleanup path.

## Routes

Existing routes kept:

- `POST /api/render-manifests/:manifestId/render-attempts/run-smoke`
- `POST /content-items/:id/video-draft/:jobId/manifest/:manifestId/render-attempts/run-smoke`

Routes added:

- `POST /api/render-manifests/:manifestId/render-attempts/run-multishot-smoke`
- `POST /content-items/:id/video-draft/:jobId/manifest/:manifestId/render-attempts/run-multishot-smoke`

The render attempts page now shows separate single-shot and multi-shot eligibility sections and a separate manual multi-shot button.

## DB Rows Created

- Campaign: `64ff4acb-b8a3-44db-a5c7-a7573052668e`, code `P2E3-SMOKE-1782280783214`
- Content item: `b41166c1-f7d1-462d-8e40-d3002f10d1d3`, code `P2E3-SMOKE-1782280783214`
- Footage assets:
  - `d5a48c26-765b-43b9-888c-8b0133bb3fa9`, `smoke/pesona-smoke-001.mp4`
  - `74a53c3f-65be-44cf-8e8f-48d8988ad217`, `smoke/pesona-smoke-002.mp4`
  - `b43db254-d6c9-47b2-ad27-2cbb7120e8cc`, `smoke/pesona-smoke-003.mp4`
- Selected footage relations:
  - `3124aa64-dc16-4673-9790-60adf3508c88`
  - `eafd3b73-8cb2-4e71-93f8-4a10bde9c601`
  - `f603f91f-7605-407c-b64a-c8e4f4d41f70`
- Script plan: `ba973675-e411-41c0-a47a-71f648f890ef`
- Shot plan steps:
  - `5f15e4c8-bb06-49eb-ba94-1ac4b444e2c8`
  - `2f242dbd-d5d9-43b7-99b2-4d9d0f7781ea`
  - `c6a13548-63b6-419c-8331-64560b598464`
- Video draft job: `58d39676-0ed5-4b57-87e5-296df10956cb`
- Render manifest: `d155392f-5729-4553-bef8-bc77e53ab74d`
- Manifest items:
  - `80bd7f0c-bec5-4f02-b8bd-7cd4ff6923da`
  - `77426646-3dd4-43d4-b15c-3e2e2e448b6e`
  - `4769ae03-976b-42cf-ac23-53fbaf656af1`
- Preflight run: `021c6123-d845-48b1-9b68-d73cfd7ce461`

Preflight result: `ready`, `completed`, `check_count=13`, `blocking_check_count=0`, `warning_check_count=0`.

## Render Result

Manual multi-shot API used:

```text
POST /api/render-manifests/d155392f-5729-4553-bef8-bc77e53ab74d/render-attempts/run-multishot-smoke
```

Successful attempt:

- Attempt ID: `f087e2eb-9df8-4161-a4e2-31f125d57534`
- Status: `succeeded`
- Output relative path: `smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4`
- Output file: `storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4`
- Output size: `5032913`
- FFmpeg exit code: `0`
- Error: null

DB verification:

```text
f087e2eb-9df8-4161-a4e2-31f125d57534|succeeded|smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4|5032913|0|
```

Output stat:

```text
storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4 size=5032913 mode=81a4 mtime=1782280811 ctime=1782280811 inode=69184
```

## Storage Evidence

Before render:

```text
storage/footage/smoke/pesona-smoke-001.mp4 3784328 bytes
storage/footage/smoke/pesona-smoke-002.mp4 1350453 bytes
storage/footage/smoke/pesona-smoke-003.mp4 1203310 bytes
storage/draft-videos/.gitkeep 67 bytes
storage/draft-videos/smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4 3749627 bytes
storage/approved-videos/.gitkeep 70 bytes
```

After render:

```text
storage/footage/smoke/pesona-smoke-001.mp4 3784328 bytes
storage/footage/smoke/pesona-smoke-002.mp4 1350453 bytes
storage/footage/smoke/pesona-smoke-003.mp4 1203310 bytes
storage/draft-videos/.gitkeep 67 bytes
storage/draft-videos/smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4 3749627 bytes
storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4 5032913 bytes
storage/approved-videos/.gitkeep 70 bytes
```

Confirmations:

- Output was written only under `storage/draft-videos/smoke`.
- Output file is non-empty.
- Phase 2E.2 smoke output was retained.
- `storage/approved-videos` unchanged.
- Source footage unchanged.
- No write to `storage/footage`.
- No output was overwritten.
- `workers/video` files were not modified.

## Runtime Config

- `CAMPAIGN_PLANNER_PROVIDER=fake`
- `CAMPAIGN_PLANNER_OPENAI_ENABLED=false`
- `OPENAI_MODEL` blank
- `web-app` FFmpeg: `ffmpeg version 8.1.1`

No OpenAI live call was made. No upload, scheduler, publisher, auto-posting, AI tagging, AI analysis, worker daemon, auto-render loop, or queue was added.

## Tests

Focused test run:

```text
npm run test:footage-catalog
```

Result: passed, `63` tests, `63` pass.

Coverage added:

- multi-shot eligibility requires at least 2 source-backed manifest items
- multi-shot missing/blocked preflight behavior
- unsafe source path handling
- missing physical source handling
- output path escape and overwrite guards
- FFmpeg multi-shot args are an argument array
- mocked multi-shot success records `smoke/*.mp4`
- mocked multi-shot success preserves source file and planning rows
- multi-shot route ordering
- no OpenAI/scheduler/publisher/upload dependency
- no worker daemon or `workers/video` modification

## Validation Commands

- `git branch --show-current`
- `git tag --merged HEAD --list phase-2e2-complete`
- `git status --short`
- `find storage/footage/smoke -maxdepth 1 -type f -name '*.mp4' -printf "%p %s bytes\n" | sort`
- `docker compose --env-file .env.local -f docker-compose.dev.yml config`
- `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build web-app`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app ffmpeg -version`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping`
- `npm run db:migrate`
- `stat -c '%n size=%s mode=%f mtime=%Y ctime=%Z inode=%i' storage/footage/smoke/pesona-smoke-001.mp4 storage/footage/smoke/pesona-smoke-002.mp4 storage/footage/smoke/pesona-smoke-003.mp4`
- `curl -fsS -i -X POST http://localhost:3000/api/render-manifests/d155392f-5729-4553-bef8-bc77e53ab74d/preflight/run`
- `curl -fsS -i http://localhost:3000/api/render-manifests/d155392f-5729-4553-bef8-bc77e53ab74d/render-attempts`
- `curl -fsS -i -X POST http://localhost:3000/api/render-manifests/d155392f-5729-4553-bef8-bc77e53ab74d/render-attempts/run-multishot-smoke`
- `git diff --name-only -- workers/video`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv CAMPAIGN_PLANNER_PROVIDER`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv CAMPAIGN_PLANNER_OPENAI_ENABLED`
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv OPENAI_MODEL`
- `npm run test:footage-catalog`

Final validation:

- `git diff --check`: passed.
- `npm run check`: passed.
- Safety grep on changed runtime/test files: reviewed; meaningful matches were expected test-only `writeFile`/`rm`, negative assertions for `storage/approved-videos`, and false positives from substrings such as `format`. No `workers/video` runtime change, no scheduler/publisher/upload/OpenAI behavior, and no shell execution path were added.
- Docs restricted-pattern grep: no matches.
- `git diff --name-only -- workers/video`: no output.
- `git ls-files storage/footage/smoke storage/draft-videos/smoke`: no output.
- `git check-ignore -v storage/footage/smoke/* storage/draft-videos/smoke/*`: source and generated smoke files are ignored by existing storage ignore rules.

## Warnings

- Non-blocking: the multi-shot implementation uses `filter_complex`, not a concat list file. Therefore there is no temp list file to clean up.
- Non-blocking: `docker compose config` prints dev environment values; the evidence records only that config resolution passed.

## Final Pass/Fail

Final summary: **PASS** for Phase 2E.3 runtime smoke criteria.

Safety summary: **PASS** for storage and automation boundaries. Source footage was unchanged, approved video storage was unchanged, output was written only under the allowed draft smoke path, no OpenAI live call happened, no upload/scheduler/publisher behavior was added, and `workers/video` remained untouched.

## Next Phase Readiness

Phase 2E.3 is ready for owner review after final validation. Future phases can decide whether this manual web-app render remains a smoke-only tool or moves toward an explicitly approved render-worker execution model. Keep future expansion manual-only until owner approves worker execution, queueing, upload, scheduler, publisher, or broader automation.
