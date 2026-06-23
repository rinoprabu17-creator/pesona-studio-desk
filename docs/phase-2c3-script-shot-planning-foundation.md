# Phase 2C.3 Script / Shot Planning Foundation

Date/time: 2026-06-23T13:06:41+07:00

Branch: `phase-2c3-script-shot-planning-foundation`

Baseline tag: `phase-2c2-complete`

## Summary

Phase 2C.3 adds a manual/rule-based script and shot planning foundation for content items. Operators can create one script plan per content item and manage ordered shot plan steps. A shot step can optionally reference an existing `content_item_footage_selections` row from the same content item, so planning uses selected footage context without touching footage assets or physical files.

This phase is still pre-render and pre-AI.

## Migration

Added migration:

- `migrations/008_phase2c_script_shot_plans.sql`

Tables added:

- `content_item_script_plans`
- `content_item_shot_plan_steps`

The migration is additive-only:

- `CREATE TABLE`
- `CREATE INDEX`
- no `DROP`
- no `TRUNCATE`
- no destructive `ALTER TABLE`
- no data delete/update against existing operational tables

Key constraints:

- one script plan per content item via `UNIQUE (content_item_id)`
- ordered shot steps via `UNIQUE (script_plan_id, sequence_number)`
- `plan_status` enum: `draft`, `reviewed`, `approved`, `archived`
- `video_format` enum: `short_video`, `reels`, `tiktok`, `youtube_short`, `story`, `other`
- `step_type` enum: `hook`, `scene`, `product`, `process`, `packing`, `delivery`, `testimonial`, `b_roll`, `cta`, `closing`, `other`
- `duration_seconds` nullable, otherwise 1-120

## New Service / Validation Files

Added:

- `apps/web/src/content-item-script-plan-errors.ts`
- `apps/web/src/content-item-script-plan-service.ts`
- `apps/web/src/validation/content-item-script-plan-validation.ts`

Service behavior:

- validates UUIDs and enums
- creates or gets one script plan per content item
- updates script plan fields
- lists ordered shot plan steps
- adds/updates/removes shot plan steps
- rejects selected footage from a different content item
- removes only shot step rows
- does not mutate content item rows, footage selection rows, footage asset rows, or physical files

## New Routes / Pages / APIs

Page routes:

- `GET /content-items/:id/script-plan`
- `POST /content-items/:id/script-plan/save`
- `POST /content-items/:id/script-plan/steps/add`
- `POST /content-items/:id/script-plan/steps/:stepId/update`
- `POST /content-items/:id/script-plan/steps/:stepId/remove`

API routes:

- `GET /api/content-items/:id/script-plan`
- `POST /api/content-items/:id/script-plan`
- `POST /api/script-plans/:planId`
- `POST /api/script-plans/:planId/steps`
- `POST /api/script-plan-steps/:stepId`
- `POST /api/script-plan-steps/:stepId/remove`

Content item detail now links to `Script/Shot Plan`.

Route-order check was added so `/content-items/:id/script-plan` and `/api/content-items/:id/script-plan` are handled before generic content item detail routes.

## Tests

Updated:

- `tests/footage-catalog/footage-catalog.test.ts`

Coverage added:

- create/get script plan for content item
- update script plan fields
- reject invalid `plan_status`
- reject invalid `video_format`
- add shot step without selected footage
- add shot step with selected footage from same content item
- reject shot step with selected footage from another content item
- reject duplicate step sequence
- reject invalid `step_type`
- reject invalid `duration_seconds`
- update shot step
- remove shot step without deleting script plan, content item, selected footage, footage asset, or physical file
- page/API route ordering for `/script-plan`
- no OpenAI/scheduler/publisher dependency in changed runtime files

Focused test result:

```text
npm run test:footage-catalog
26 tests, 26 pass
```

## Runtime Smoke

Runtime smoke result: **PASS**.

Commands run included:

```sh
git branch --show-current
git merge-base --is-ancestor phase-2c2-complete HEAD
git status --short
docker compose --env-file .env.local -f docker-compose.dev.yml config
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping
npm run db:migrate
docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT version, name FROM schema_migrations WHERE version = '008';"
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT to_regclass('public.content_item_script_plans') AS script_plans, to_regclass('public.content_item_shot_plan_steps') AS shot_steps;"
curl -fsS -i http://localhost:3000/content-items/38d4fabb-8589-487c-a140-ff035f900b52
curl -fsS -i http://localhost:3000/content-items/38d4fabb-8589-487c-a140-ff035f900b52/script-plan
curl -fsS -i http://localhost:3000/api/content-items/38d4fabb-8589-487c-a140-ff035f900b52/script-plan
curl -fsS -i -X POST http://localhost:3000/api/script-plans/6c71aedf-2432-42f8-b8ae-c106d9b6a46d
curl -fsS -i -X POST http://localhost:3000/api/script-plans/6c71aedf-2432-42f8-b8ae-c106d9b6a46d/steps
curl -fsS -i -X POST http://localhost:3000/api/script-plan-steps/3cb68693-87b2-4d5b-8cdf-0494ab2c0ee4
curl -fsS -i -X POST http://localhost:3000/api/script-plan-steps/28c071eb-32e6-43a4-ad3c-5d0019ae6fd7/remove
find storage/footage -type f -printf '%P|%s|%T@\n' | sort
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv CAMPAIGN_PLANNER_PROVIDER CAMPAIGN_PLANNER_OPENAI_ENABLED OPENAI_MODEL
npm run check
git diff --check
```

## Smoke Data Created

Smoke campaign:

- Code: `P2C3-SMOKE-1782194742823`
- ID: `d56d0b33-9b15-4ae8-bc19-9f21a186e813`

Smoke content item:

- ID: `38d4fabb-8589-487c-a140-ff035f900b52`
- Code: `P2C3-SMOKE-1782194742823-D01`

Smoke footage metadata:

- ID: `2afe9811-4778-4837-8d4f-eef0942c05c8`
- Relative path: `smoke/p2c3-smoke-1782194742823-reviewed.mp4`
- Status: `reviewed`
- Size: `0`

Smoke selected footage relation:

- ID: `b7a48a60-2b73-47a2-bc90-c40f5914e972`

Smoke script plan:

- ID: `6c71aedf-2432-42f8-b8ae-c106d9b6a46d`
- Status: `reviewed`
- Format: `reels`

Smoke shot steps:

- Added with selected footage, then removed:
  - ID: `28c071eb-32e6-43a4-ad3c-5d0019ae6fd7`
- Added without selected footage, then updated:
  - ID: `3cb68693-87b2-4d5b-8cdf-0494ab2c0ee4`
  - Final sequence: `3`
  - Final type: `closing`

Final DB state check:

```text
content_items: 1
footage_assets: 1
footage_selections: 1
script_plans: 1
kept_steps: 1
removed_steps: 0
```

## Physical File Safety

`storage/footage` listing before and after smoke:

```text
.gitkeep|61|1781846550.1669778710
```

No physical footage files were created, copied, moved, renamed, edited, deleted, uploaded, or rendered.

Footage metadata identity after smoke:

```text
smoke/p2c3-smoke-1782194742823-reviewed.mp4 | p2c3-smoke-1782194742823-reviewed.mp4 | .mp4 | 0 bytes | reviewed
```

The workflow did not mutate footage asset metadata automatically.

## OpenAI / Automation Safety

Runtime config:

```text
CAMPAIGN_PLANNER_PROVIDER=fake
CAMPAIGN_PLANNER_OPENAI_ENABLED=false
OPENAI_MODEL blank/unset
```

No OpenAI live call was made.

No upload, video render, auto-posting, publisher, or scheduler feature was added.

## Warnings

- Non-blocking: after code changes, the running containers were rebuilt with `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build` so the local runtime served the new routes. No volumes were deleted.
- Non-blocking: `POST /api/content-items/:id/script-plan` is create/idempotent-get for an existing plan; field updates use `POST /api/script-plans/:planId`.

## Next Phase Readiness

Phase 2C.3 is ready for owner review. Future phases can build on this by defining script/shot selection rules, but should still avoid AI generation, rendering, publisher, and scheduler automation until those workflows are explicitly approved.
