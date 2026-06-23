# Phase 2B.6 Footage Review Runtime Smoke

Date/time: 2026-06-23 11:42:14 +07

Branch: `phase-2b6-footage-review-runtime-smoke`

Baseline tag: `phase-2b5-complete`

## Summary

Result: PASS.

The Footage Review & Batch Metadata Workflow was smoke-tested against the local Docker runtime. Two metadata-only smoke records were created through the API, verified in the review incomplete filter, batch-updated through the API, and verified as no longer incomplete. Immutable file identity fields did not change. No physical footage files were created or modified.

## Commands Run

```sh
git branch --show-current
git tag --points-at HEAD
git status --short
docker compose --env-file .env.local -f docker-compose.dev.yml config
docker compose --env-file .env.local -f docker-compose.dev.yml config --services
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping
npm run db:migrate
curl -fsS -i http://localhost:3000/footage-assets
curl -fsS -i http://localhost:3000/footage-assets/review
curl -fsS -i http://localhost:3000/api/footage-assets
find storage/footage -maxdepth 4 -printf '%M %s %TY-%Tm-%Td %TH:%TM:%TS %p\n' | sort
docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build
docker compose --env-file .env.local -f docker-compose.dev.yml ps
curl -fsS -i http://localhost:3000/footage-assets
curl -fsS -i http://localhost:3000/footage-assets/review
curl -fsS -i http://localhost:3000/api/footage-assets
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -tA -c "SELECT id FROM products WHERE code = 'sampul_raport' AND active = true LIMIT 1;"
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -P pager=off -c "SELECT id, relative_path, filename, file_extension, size_bytes, status, shot_type, school_level, theme, product_id, quality_score, notes FROM footage_assets WHERE relative_path IN ('smoke/phase-2b6-review-a.mp4','smoke/phase-2b6-review-b.mp4') ORDER BY relative_path;"
curl -sS -i 'http://localhost:3000/api/footage-assets?incomplete=1'
curl -fsS -i -X POST http://localhost:3000/api/footage-assets -H 'Content-Type: application/json' --data '{"relative_path":"smoke/phase-2b6-review-a.mp4","size_bytes":0,"status":"new","shot_type":"other","product_id":"59172f50-60a1-4a37-962b-d5ffbf2aad78","notes":"Phase 2B.6 metadata-only setup."}'
curl -fsS -i -X POST http://localhost:3000/api/footage-assets -H 'Content-Type: application/json' --data '{"relative_path":"smoke/phase-2b6-review-b.mp4","size_bytes":0,"status":"new","shot_type":"other","product_id":"59172f50-60a1-4a37-962b-d5ffbf2aad78","notes":"Phase 2B.6 metadata-only setup."}'
curl -fsS -i 'http://localhost:3000/footage-assets/review?incomplete=1'
curl -fsS -i 'http://localhost:3000/api/footage-assets?incomplete=1'
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -P pager=off -c "SELECT relative_path FROM footage_assets WHERE (status = 'new' OR shot_type = 'other' OR product_id IS NULL OR theme IS NULL OR quality_score IS NULL) AND relative_path IN ('smoke/phase-2b6-review-a.mp4','smoke/phase-2b6-review-b.mp4') ORDER BY relative_path;"
curl -fsS -i -X POST http://localhost:3000/api/footage-assets/batch-update -H 'Content-Type: application/json' --data '{"ids":["88facf8b-20d7-4f0b-b968-f45a9ddc3ac3","1bf80996-e2a3-49f7-9181-6212b52530da"],"updates":{"status":"reviewed","shot_type":"packing","school_level":"sd","theme":"Phase 2B.6 review smoke","quality_score":4,"notes":"Metadata-only runtime smoke."}}'
curl -sS -i -X POST http://localhost:3000/api/footage-assets/batch-update -H 'Content-Type: application/json' --data '{"ids":[],"updates":{"status":"reviewed"}}'
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv CAMPAIGN_PLANNER_PROVIDER CAMPAIGN_PLANNER_OPENAI_ENABLED OPENAI_MODEL
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T campaign-planner-worker printenv CAMPAIGN_PLANNER_PROVIDER CAMPAIGN_PLANNER_OPENAI_ENABLED OPENAI_MODEL
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -P pager=off -c "SELECT version FROM schema_migrations ORDER BY version;"
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -P pager=off -c "SELECT to_regclass('public.footage_assets') AS footage_assets_table;"
npm run check
git diff --check
```

## Service Status

`docker compose config` resolved successfully. Expected services were present:

- `postgres`
- `redis`
- `n8n`
- `web-app`
- `campaign-planner-worker`
- `video-worker`
- `mockup-worker`

After rebuild, `docker compose ps` showed all expected services running. Postgres and Redis were healthy:

- Postgres: `/var/run/postgresql:5432 - accepting connections`
- Redis: `PONG`

## Migration And Table Verification

`npm run db:migrate` completed successfully and skipped already-applied migrations `001` through `006`.

`schema_migrations` contains:

```text
001
002
003
004
005
006
```

`to_regclass('public.footage_assets')` returned `footage_assets`.

## Page And API Verification

Initial page/API checks after the rebuild:

- `GET /footage-assets`: `HTTP/1.1 200 OK`
- `GET /footage-assets/review`: `HTTP/1.1 200 OK`
- `GET /api/footage-assets`: `HTTP/1.1 200 OK`

`/footage-assets` included the `Review Metadata` link after rebuild.

## Smoke Metadata Records

Active product used for setup:

- `sampul_raport`: `59172f50-60a1-4a37-962b-d5ffbf2aad78`

Created metadata-only records:

| id | relative_path | filename | extension | size_bytes | initial status | initial shot_type |
| --- | --- | --- | --- | ---: | --- | --- |
| `88facf8b-20d7-4f0b-b968-f45a9ddc3ac3` | `smoke/phase-2b6-review-a.mp4` | `phase-2b6-review-a.mp4` | `mp4` | 0 | `new` | `other` |
| `1bf80996-e2a3-49f7-9181-6212b52530da` | `smoke/phase-2b6-review-b.mp4` | `phase-2b6-review-b.mp4` | `mp4` | 0 | `new` | `other` |

Both `POST /api/footage-assets` calls returned `HTTP/1.1 201 Created`.

## Incomplete Filter Before Batch Update

`GET /footage-assets/review?incomplete=1` returned `HTTP/1.1 200 OK` and showed both Phase 2B.6 records.

The DB incomplete predicate returned both smoke records before the update:

```text
smoke/phase-2b6-review-a.mp4
smoke/phase-2b6-review-b.mp4
```

## Batch Update Verification

Batch update request:

- `status`: `reviewed`
- `shot_type`: `packing`
- `school_level`: `sd`
- `theme`: `Phase 2B.6 review smoke`
- `quality_score`: `4`
- `notes`: `Metadata-only runtime smoke.`

`POST /api/footage-assets/batch-update` returned:

```json
{"requested_count":2,"updated_count":2}
```

DB verification after update:

| relative_path | status | shot_type | school_level | theme | quality_score | notes |
| --- | --- | --- | --- | --- | ---: | --- |
| `smoke/phase-2b6-review-a.mp4` | `reviewed` | `packing` | `sd` | `Phase 2B.6 review smoke` | 4 | `Metadata-only runtime smoke.` |
| `smoke/phase-2b6-review-b.mp4` | `reviewed` | `packing` | `sd` | `Phase 2B.6 review smoke` | 4 | `Metadata-only runtime smoke.` |

## Immutable Field Verification

The following fields matched before and after batch update for both smoke records:

- `relative_path`
- `filename`
- `file_extension`
- `size_bytes`

## Incomplete Filter After Batch Update

The DB incomplete predicate returned zero Phase 2B.6 records after the batch update:

```text
(0 rows)
```

`GET /api/footage-assets?incomplete=1` returned `HTTP/1.1 200 OK`; the Phase 2B.6 smoke records were absent from the incomplete result.

## Invalid Input Guard

Empty ID list was rejected by the batch update API:

```text
HTTP/1.1 400 Bad Request
{"ok":false,"error":{"code":"empty_batch_ids","message":"Pilih minimal satu footage untuk batch update."}}
```

## Storage Safety

Storage listing before and after the metadata smoke remained:

```text
-rw-r--r-- 61 2026-06-19 12:22:30.1669778710 storage/footage/.gitkeep
drwxr-xr-x 4096 2026-06-23 11:11:13.1799772160 storage/footage
```

No physical footage files were created, modified, moved, renamed, copied, uploaded, or deleted. The smoke records are database metadata only.

## OpenAI And Automation Safety

Runtime config for both `web-app` and `campaign-planner-worker`:

```text
CAMPAIGN_PLANNER_PROVIDER=fake
CAMPAIGN_PLANNER_OPENAI_ENABLED=false
OPENAI_MODEL=
```

No OpenAI live call was made. No AI tagging, scheduler, publisher, auto-posting, rendering, or video generation was run or added.

## Validation

`npm run check`: PASS.

Highlights:

- Campaign Planner tests: 44 pass
- Campaign Planner OpenAI tests: 44 pass, mocked/no live OpenAI network
- Campaign Plan Runs tests: 17 pass
- Campaign Plan Review tests: 2 pass
- Campaign Plan Import tests: 13 pass
- Footage Catalog tests: 9 pass

`git diff --check`: PASS.

## Warnings

- Non-blocking: before rebuild, `GET /footage-assets/review` returned `HTTP/1.1 404 Not Found` because the running `web-app` container was stale. Per task allowance, `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build` was run. No volumes were deleted. After rebuild, `/footage-assets/review` returned `HTTP/1.1 200 OK`.
- Non-blocking: older metadata-only smoke records from Phase 2B.2 and Phase 2B.4 remained in the database and appeared in footage list/incomplete responses. They were not modified or deleted.
- Non-blocking: `docker compose config` output includes resolved environment values from `.env.local`; the report records only the successful resolution and service summary, not the full output.

## Final Result

PASS. Phase 2B.6 Footage Review Runtime Smoke completed safely. Only the documentation report was added to the working tree.
