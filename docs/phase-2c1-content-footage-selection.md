# Phase 2C.1 Content Footage Selection

Date/time: 2026-06-23 12:14:24 +07

Branch: `phase-2c1-content-footage-selection`

Baseline tag: `phase-2b7-complete`

## Summary

Result: PASS.

Phase 2C.1 adds a conservative planning-only relationship between content items and reviewed/approved footage assets. Operators can select footage for a content item, order it, assign a planning role, and add a usage note. This phase does not upload, move, edit, delete, copy, generate, or render footage files.

## Implementation

Added migration:

- `migrations/007_phase2c_content_item_footage.sql`

New table:

- `content_item_footage_selections`

Important fields:

- `content_item_id`
- `footage_asset_id`
- `sequence_number`
- `role`
- `usage_note`
- `created_at`
- `updated_at`

Constraints:

- sequence number must be positive
- role must be one of `opening`, `product`, `process`, `packing`, `delivery`, `testimonial`, `closing`, `b_roll`, `other`
- unique sequence per content item
- unique footage asset per content item

The migration is additive-only. It contains `CREATE TABLE` and `CREATE INDEX` statements only.

## New Service Files

- `apps/web/src/content-item-footage-service.ts`
- `apps/web/src/content-item-footage-errors.ts`
- `apps/web/src/validation/content-item-footage-validation.ts`

Service functions added:

- `listContentItemFootageSelections(contentItemId)`
- `getContentItemFootageSelection(selectionId)`
- `addContentItemFootageSelection(contentItemId, input)`
- `updateContentItemFootageSelection(selectionId, input)`
- `removeContentItemFootageSelection(selectionId)`

Validation includes:

- UUID validation for content item, footage asset, and selection IDs
- positive integer sequence number
- role enum
- nullable usage note with max length
- content item existence
- footage asset existence
- footage status must be `reviewed` or `approved`
- duplicate sequence rejection
- duplicate footage-on-content rejection

## New Routes And Pages

Page routes:

- `GET /content-items/:id/footage`
- `POST /content-items/:id/footage/add`
- `POST /content-items/:id/footage/:selectionId/update`
- `POST /content-items/:id/footage/:selectionId/remove`

API routes:

- `GET /api/content-items/:id/footage`
- `POST /api/content-items/:id/footage`
- `POST /api/content-item-footage/:selectionId`
- `POST /api/content-item-footage/:selectionId/remove`

Content item detail now links to `Pilih Footage`.

The manage page states that this workflow only selects footage for planning and does not move, edit, delete, upload, or render footage files.

## Tests

Updated:

- `tests/footage-catalog/footage-catalog.test.ts`

Coverage added:

- add selected footage to a content item
- reject new/unreviewed footage by default
- allow reviewed footage
- allow approved footage
- reject duplicate footage on the same content item
- reject duplicate sequence number
- update sequence, role, and usage note
- remove relation without deleting footage asset
- remove relation without mutating physical file
- invalid UUID rejected
- invalid role rejected
- positive sequence validation
- page/API route ordering for `/content-items/:id/footage`
- no OpenAI/scheduler/publisher dependency in new runtime path

`npm run test:footage-catalog`: PASS, 17 tests passed.

`npm run check`: PASS.

## Runtime Smoke

Runtime smoke was run against local Docker Compose.

Commands included:

```sh
git branch --show-current
git merge-base --is-ancestor phase-2b7-complete HEAD
git status --short
docker compose --env-file .env.local -f docker-compose.dev.yml config --services
docker compose --env-file .env.local -f docker-compose.dev.yml config
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping
npm run db:migrate
docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build
curl -fsS -i http://localhost:3000/content-items
curl -fsS -i http://localhost:3000/api/content-items
curl -fsS -i http://localhost:3000/footage-assets
curl -fsS -i http://localhost:3000/content-items/533331df-a0e4-4dab-a189-0bf326079f9b
curl -fsS -i http://localhost:3000/content-items/533331df-a0e4-4dab-a189-0bf326079f9b/footage
curl -fsS -i http://localhost:3000/api/content-items/533331df-a0e4-4dab-a189-0bf326079f9b/footage
curl -fsS -i -X POST http://localhost:3000/api/content-items/533331df-a0e4-4dab-a189-0bf326079f9b/footage
curl -fsS -i -X POST http://localhost:3000/api/content-item-footage/120fd25f-60b8-44d2-b60a-0204ff28471a
curl -fsS -i -X POST http://localhost:3000/api/content-item-footage/120fd25f-60b8-44d2-b60a-0204ff28471a/remove
find storage/footage -maxdepth 4 -printf '%M %s %TY-%Tm-%Td %TH:%TM:%TS %p\n' | sort
npm run check
git diff --check
```

`docker compose config` resolved successfully. The full output was not copied here because it includes resolved local development environment values.

Services were present and running:

- `postgres`
- `redis`
- `n8n`
- `web-app`
- `campaign-planner-worker`
- `video-worker`
- `mockup-worker`

Health:

- Postgres: `/var/run/postgresql:5432 - accepting connections`
- Redis: `PONG`

Migration verification:

```text
version | name
007     | phase2c_content_item_footage
```

Relation table verification:

```text
content_item_footage_selections
```

## Smoke Data

Created metadata-only smoke records:

- campaign: `P2C1-SMOKE-20260623-0512`
- content item: `533331df-a0e4-4dab-a189-0bf326079f9b`
- content code: `P2C1-SMOKE-20260623-0512-D01`
- footage asset: `cd413bc6-d1da-4c13-ba9e-1c3f9f4ac903`
- footage relative path: `smoke/phase-2c1-selection.mp4`
- footage status: `reviewed`
- footage size: `0`

No physical file was created for `smoke/phase-2c1-selection.mp4`.

Selection lifecycle:

1. Created selection `120fd25f-60b8-44d2-b60a-0204ff28471a` with sequence `1`, role `product`, usage note `Initial Phase 2C.1 runtime selection.`
2. Verified API and page showed the selection.
3. Updated selection to sequence `2`, role `closing`, usage note `Updated Phase 2C.1 runtime selection note.`
4. Removed the selection through `POST /api/content-item-footage/:selectionId/remove`.
5. Verified `content_item_footage_selections` count for that selection is `0`.
6. Verified the footage asset row still exists.

The smoke campaign/content/footage metadata rows remain in the local database for owner review. The relation row was removed as part of the lifecycle smoke.

## Storage Safety

`storage/footage` before and after smoke:

```text
-rw-r--r-- 61 2026-06-19 12:22:30.1669778710 storage/footage/.gitkeep
drwxr-xr-x 4096 2026-06-23 11:11:13.1799772160 storage/footage
```

No physical footage files were created, modified, moved, renamed, copied, uploaded, deleted, or rendered.

## OpenAI And Automation Safety

Runtime config for both `web-app` and `campaign-planner-worker`:

```text
CAMPAIGN_PLANNER_PROVIDER=fake
CAMPAIGN_PLANNER_OPENAI_ENABLED=false
OPENAI_MODEL=
```

No OpenAI live call was made. No AI tagging, scheduler, publisher, auto-posting, upload, video generation, or video rendering was added.

## Safety Grep

Runtime file mutation grep:

```text
writeFile|copyFile|rename|unlink|rm|rmdir|mkdir|createWriteStream|appendFile|truncate
```

Result: no matches in changed runtime files.

Forbidden AI/scheduler grep:

```text
OpenAI|openai|scheduler|publisher|render
```

Result: matches were limited to existing server-rendered view/helper names, the existing `rendering` production status label, and the new user-facing notice saying no video render happens in this phase. No OpenAI, scheduler, or publisher dependency was added.

Destructive-command grep:

```text
DELETE FROM|TRUNCATE|DROP|down -v
```

Result:

- migration 007: no matches
- runtime service: one parameterized delete for `content_item_footage_selections` only, used by the explicit remove-selection feature
- tests: cleanup deletes test rows in the test database only
- check script: strings used to assert migration 007 does not contain destructive SQL

No destructive command was run against production/local operational data.

## Warnings

- Non-blocking: `docker compose config` output includes local dev environment values, so the report summarizes service/config success instead of copying full output.
- Non-blocking: safety grep finds `render` in server-rendered view helper names and a user-facing no-render notice. These are not video rendering.
- Non-blocking: the remove-selection feature necessarily deletes a relation row only. It does not delete content items, footage assets, or physical files.
- Non-blocking: smoke campaign/content/footage metadata rows remain in the local DB for owner review.

## Next Phase Readiness

Phase 2C.1 is ready for owner review. Future phases can build script or shot selection planning on top of this relation, but should still avoid AI tagging, upload, render, scheduler, and publisher behavior until footage selection rules are explicitly approved.
