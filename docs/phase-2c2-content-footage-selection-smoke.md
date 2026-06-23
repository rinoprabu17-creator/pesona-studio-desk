# Phase 2C.2 Content Footage Selection Runtime Smoke & Handoff

Date/time: 2026-06-23T12:49:31+07:00

Branch: `phase-2c2-content-footage-selection-smoke`

Baseline tag: `phase-2c1-complete`

## Summary

Phase 2C.2 verified the local runtime behavior for selecting reviewed/approved footage metadata on content items. This smoke test used metadata-only database rows and did not create, edit, move, delete, upload, or render any physical footage files.

Final result: **PASS after allowed runtime rebuild**.

## Commands Run

```sh
git branch --show-current
git merge-base --is-ancestor phase-2c1-complete HEAD
git status --short
docker compose --env-file .env.local -f docker-compose.dev.yml config
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping
npm run db:migrate
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "\d schema_migrations"
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT * FROM schema_migrations ORDER BY 1;"
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT to_regclass('public.content_item_footage_selections') AS relation_table;"
curl -fsS -i http://localhost:3000/content-items
curl -fsS -i http://localhost:3000/api/content-items
curl -fsS -i http://localhost:3000/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104
curl -fsS -i http://localhost:3000/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage
curl -fsS -i http://localhost:3000/api/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage
curl -fsS -i -X POST http://localhost:3000/api/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage -H 'Content-Type: application/json' --data '{"footage_asset_id":"e4076f0d-cf85-469c-a190-f1e06bb2aa00","sequence_number":1,"role":"product","usage_note":"Reviewed footage selected by Phase 2C.2 runtime smoke."}'
curl -fsS -i -X POST http://localhost:3000/api/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage -H 'Content-Type: application/json' --data '{"footage_asset_id":"a576748c-f8b7-41e5-b1c9-2716a22b21fd","sequence_number":2,"role":"packing","usage_note":"Approved footage selected by Phase 2C.2 runtime smoke."}'
curl -fsS -i http://localhost:3000/api/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage
curl -fsS -i -X POST http://localhost:3000/api/content-item-footage/40f4cc6b-86be-4483-a11e-26cef4657816 -H 'Content-Type: application/json' --data '{"sequence_number":3,"role":"closing","usage_note":"Updated by Phase 2C.2 runtime smoke."}'
curl -fsS -i -X POST http://localhost:3000/api/content-item-footage/b7b461c1-078a-4aae-ab66-e4c7a5db14d5/remove -H 'Content-Type: application/json' --data '{}'
curl -sS -i -X POST http://localhost:3000/api/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage -H 'Content-Type: application/json' --data '{"footage_asset_id":"7ceff00e-b9c2-4627-be43-209ad848d7ab","sequence_number":4,"role":"other","usage_note":"This unreviewed footage should be rejected."}'
docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping
curl -fsS -i -X POST http://localhost:3000/api/content-items/37a609ba-d973-40f7-a534-13881135fa85/footage -H 'Content-Type: application/json' --data '{"footage_asset_id":"e4076f0d-cf85-469c-a190-f1e06bb2aa00","sequence_number":1,"role":"product","usage_note":"Owned by mismatch guard content B after rebuild."}'
curl -sS -i -X POST http://localhost:3000/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage/75f64f58-e17e-4e49-b0c3-4050628efe90/update -H 'Content-Type: application/x-www-form-urlencoded' --data 'sequence_number=9&role=closing&usage_note=Should%20not%20update'
curl -sS -i -X POST http://localhost:3000/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage/75f64f58-e17e-4e49-b0c3-4050628efe90/remove -H 'Content-Type: application/x-www-form-urlencoded' --data ''
curl -fsS -i http://localhost:3000/api/content-items/37a609ba-d973-40f7-a534-13881135fa85/footage
curl -fsS -i http://localhost:3000/api/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage
find storage/footage -type f -printf '%P|%s|%T@\n' | sort
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv CAMPAIGN_PLANNER_PROVIDER CAMPAIGN_PLANNER_OPENAI_ENABLED OPENAI_MODEL
npm run check
git diff --check
```

## Service Status

`docker compose ps` showed all expected services running:

- `postgres` healthy
- `redis` healthy
- `n8n` running
- `web-app` running on port 3000
- `campaign-planner-worker` running
- `video-worker` running
- `mockup-worker` running

Postgres health: `accepting connections`.

Redis health: `PONG`.

## Migration Verification

`npm run db:migrate` completed safely and skipped already-applied migrations.

Migration history included:

- `007 | phase2c_content_item_footage`

Relation table verification:

```text
content_item_footage_selections
```

## Page/API Verification

Verified successful responses:

- `GET /content-items` returned HTTP 200.
- `GET /api/content-items` returned HTTP 200.
- `GET /content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104` returned HTTP 200 and showed the `Pilih Footage` link.
- `GET /content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage` returned HTTP 200 and showed the selection workflow copy.
- `GET /api/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage` returned HTTP 200.

## Smoke Metadata Rows Created

Smoke campaign:

- Code: `P2C2-SMOKE-1782193644448`
- ID: `bce0ffc5-a150-4277-baaa-bce5acd5575a`

Smoke content items:

- Main selection content: `0c89cfaa-87d4-4a17-aa87-483707ee7104`
- Mismatch guard content: `37a609ba-d973-40f7-a534-13881135fa85`

Smoke footage assets:

- Reviewed: `e4076f0d-cf85-469c-a190-f1e06bb2aa00`, `smoke/p2c2-smoke-1782193644448-reviewed.mp4`
- Approved: `a576748c-f8b7-41e5-b1c9-2716a22b21fd`, `smoke/p2c2-smoke-1782193644448-approved.mp4`
- New/unreviewed: `7ceff00e-b9c2-4627-be43-209ad848d7ab`, `smoke/p2c2-smoke-1782193644448-new.mp4`

All smoke footage assets are metadata-only rows with `size_bytes = 0`. No physical footage files were created for them.

## Selection Verification

Add reviewed footage:

- `POST /api/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage`
- Result: HTTP 201
- Selection ID: `b7b461c1-078a-4aae-ab66-e4c7a5db14d5`
- Sequence: `1`
- Role: `product`

Add approved footage:

- `POST /api/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage`
- Result: HTTP 201
- Selection ID: `40f4cc6b-86be-4483-a11e-26cef4657816`
- Sequence: `2`
- Role: `packing`

List ordering:

- `GET /api/content-items/0c89cfaa-87d4-4a17-aa87-483707ee7104/footage`
- Result: reviewed selection listed at sequence `1`, approved selection listed at sequence `2`.

Update:

- `POST /api/content-item-footage/40f4cc6b-86be-4483-a11e-26cef4657816`
- Updated sequence to `3`
- Updated role to `closing`
- Updated usage note to `Updated by Phase 2C.2 runtime smoke.`
- Result: HTTP 200.

Remove:

- `POST /api/content-item-footage/b7b461c1-078a-4aae-ab66-e4c7a5db14d5/remove`
- Result: HTTP 200.
- The relation row was removed.
- The content item and footage asset rows remained.

Final relation/content/footage count check:

```text
content_items: 2
footage_assets: 3
kept_a_selection: 1
kept_b_selection: 1
removed_relation: 0
```

## Rejection Verification

Attempted to select unreviewed/new footage:

- Footage ID: `7ceff00e-b9c2-4627-be43-209ad848d7ab`
- Result: HTTP 400
- Error code: `footage_not_selectable`
- Message: `Footage harus berstatus reviewed atau approved sebelum dipilih untuk konten.`

## Ownership Mismatch Verification

Initial ownership mismatch probe against the already-running `web-app` accepted mismatched page update/remove and removed a smoke relation owned by content B. This indicated the container was stale relative to the current branch code. No production data or physical file was affected; the removed row was a smoke relation only.

Allowed remediation:

- Ran `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build`.
- No volumes were deleted.
- Services restarted successfully.

After rebuild:

- Created a new mismatch guard relation owned by content B:
  - Selection ID: `75f64f58-e17e-4e49-b0c3-4050628efe90`
- Posted mismatched update through content A URL:
  - Result: HTTP 303 redirect with error `Pilihan footage tidak dimiliki konten ini.`
- Posted mismatched remove through content A URL:
  - Result: HTTP 303 redirect with error `Pilihan footage tidak dimiliki konten ini.`
- Verified content B relation remained intact:
  - Selection ID: `75f64f58-e17e-4e49-b0c3-4050628efe90`
  - Sequence: `1`
  - Role: `product`
  - Usage note unchanged.

## Immutable Metadata Verification

Smoke footage metadata after add/update/remove:

```text
smoke/p2c2-smoke-1782193644448-approved.mp4 | .mp4 | 0 bytes | approved
smoke/p2c2-smoke-1782193644448-new.mp4      | .mp4 | 0 bytes | new
smoke/p2c2-smoke-1782193644448-reviewed.mp4 | .mp4 | 0 bytes | reviewed
```

The selection workflow did not change:

- `relative_path`
- `filename`
- `file_extension`
- `size_bytes`

## Physical Footage Verification

`storage/footage` listing before and after smoke stayed unchanged:

```text
.gitkeep|61|1781846550.1669778710
```

No physical footage files were created, edited, copied, moved, renamed, deleted, uploaded, or rendered.

## OpenAI / Provider Verification

Runtime config check:

```text
CAMPAIGN_PLANNER_PROVIDER=fake
CAMPAIGN_PLANNER_OPENAI_ENABLED=false
OPENAI_MODEL blank/unset
```

No OpenAI live call was made.

## Warnings

- Non-blocking: one early migration-history query used the wrong column name (`filename`) for `schema_migrations`. The table shape was checked with `\d schema_migrations`, then migration history was verified with the correct columns.
- Non-blocking: one early metadata creation command failed because shell expansion stripped SQL placeholders. It failed before inserting rows and was rerun with escaped placeholders.
- Non-blocking after rebuild: the initial mismatch probe showed stale `web-app` runtime behavior. The allowed `up -d --build` refreshed containers, and the ownership mismatch check passed afterward.

## Handoff

Operator flow:

1. Open a content item detail page.
2. Click `Pilih Footage`.
3. Select only reviewed/approved footage assets.
4. Use `sequence_number` to control the intended footage order.
5. Use `role` to describe footage usage, such as product, packing, closing, or b-roll.
6. Use `usage_note` for planning notes.
7. Use `Lepas` only to detach the relation from the content item.

Important behavior:

- Removing a selection only deletes the relation row.
- Removing a selection does not delete the content item.
- Removing a selection does not delete the footage asset.
- Removing a selection does not touch any physical footage file.
- This phase is still pre-script and pre-render.

## Safety Confirmation

- Documentation-only repo change for this phase.
- No runtime code was changed.
- No migration was added or changed.
- No upload feature was added.
- No AI tagging or AI analysis was added.
- No video render, scheduler, publisher, or auto-posting was added.
- No physical footage file was created or modified.
- No database reset was run.
- No Docker volume was deleted.
- No OpenAI live call was made.

## Next Phase Readiness

Phase 2C.2 confirms the content-footage selection workflow is ready for owner review and future script/shot selection planning. Future Phase 2C work should continue to keep this pre-render and avoid AI/render automation until footage selection rules are clear.
