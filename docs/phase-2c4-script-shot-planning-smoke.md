# Phase 2C.4 Script / Shot Planning Runtime Smoke & Handoff

Date/time: 2026-06-23T13:27:25+07:00

Branch: `phase-2c4-script-shot-planning-smoke`

Baseline tag: `phase-2c3-complete`

## Summary

Phase 2C.4 verified the local runtime for the Script / Shot Planning workflow. The smoke test used metadata-only database rows and did not create, edit, move, copy, rename, delete, upload, or render any physical footage files.

Final result: **PASS**.

## Commands Run

```sh
git branch --show-current
git merge-base --is-ancestor phase-2c3-complete HEAD
git status --short
docker compose --env-file .env.local -f docker-compose.dev.yml config
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping
find storage/footage -type f -printf '%P|%s|%T@\n' | sort
npm run db:migrate
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT version, name FROM schema_migrations WHERE version = '008';"
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT to_regclass('public.content_item_script_plans') AS script_plans, to_regclass('public.content_item_shot_plan_steps') AS shot_steps;"
curl -fsS -i http://localhost:3000/content-items
curl -fsS -i http://localhost:3000/api/content-items
curl -fsS -i http://localhost:3000/content-items/b1c7d59c-0d62-45d6-8171-d064d20ad444
curl -fsS -i http://localhost:3000/content-items/b1c7d59c-0d62-45d6-8171-d064d20ad444/script-plan
curl -fsS -i http://localhost:3000/api/content-items/b1c7d59c-0d62-45d6-8171-d064d20ad444/script-plan
curl -fsS -i -X POST http://localhost:3000/api/script-plans/33b6153f-a9a0-4d7d-9ad2-a8effdf4900d
curl -fsS -i -X POST http://localhost:3000/api/script-plans/33b6153f-a9a0-4d7d-9ad2-a8effdf4900d/steps
curl -fsS -i -X POST http://localhost:3000/api/script-plan-steps/aa118003-a668-4e74-99b8-8ddd2105bdaf
curl -fsS -i -X POST http://localhost:3000/api/script-plan-steps/3d96f2d5-6bfb-4af6-90d4-50a3a1784254/remove
curl -sS -i -X POST http://localhost:3000/api/script-plans/33b6153f-a9a0-4d7d-9ad2-a8effdf4900d/steps
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv CAMPAIGN_PLANNER_PROVIDER CAMPAIGN_PLANNER_OPENAI_ENABLED OPENAI_MODEL
npm run check
git diff --check
```

Metadata-only smoke rows were created with a safe local script executed inside the running `web-app` container. The script used parameterized SQL and did not touch `storage/footage`.

## Service Status

`docker compose ps` showed all expected services running:

- `postgres`: running and healthy
- `redis`: running and healthy
- `n8n`: running
- `web-app`: running on port 3000
- `campaign-planner-worker`: running
- `video-worker`: running
- `mockup-worker`: running

Health checks:

- Postgres: `accepting connections`
- Redis: `PONG`

No container rebuild was needed for this smoke.

## Migration / Table Verification

`npm run db:migrate` completed safely and skipped already-applied migrations, including migration 008.

Migration check:

```text
008 | phase2c_script_shot_plans
```

Table check:

```text
content_item_script_plans
content_item_shot_plan_steps
```

## Page / API Verification

Verified successful responses:

- `GET /content-items` returned HTTP 200.
- `GET /api/content-items` returned HTTP 200.
- `GET /content-items/b1c7d59c-0d62-45d6-8171-d064d20ad444` returned HTTP 200 and showed the `Script/Shot Plan` link.
- `GET /content-items/b1c7d59c-0d62-45d6-8171-d064d20ad444/script-plan` returned HTTP 200.
- `GET /api/content-items/b1c7d59c-0d62-45d6-8171-d064d20ad444/script-plan` returned HTTP 200.

## Smoke Metadata Rows Created

Smoke campaign:

- Code: `P2C4-SMOKE-1782195972619`
- ID: `27d86302-bf29-411b-8396-0dd665cac7e5`

Smoke content items:

- Main content: `b1c7d59c-0d62-45d6-8171-d064d20ad444`
- Cross-content guard content: `d4a1bb9d-9ede-4111-9cfb-d5d9e4cd30fd`

Smoke footage metadata:

- Main reviewed footage:
  - ID: `760f6df1-42f6-4a3d-af4a-849074c49a52`
  - Relative path: `smoke/p2c4-smoke-1782195972619-main-reviewed.mp4`
  - Size: `0`
  - Status: `reviewed`
- Other reviewed footage:
  - ID: `f2da568e-45c1-427e-b791-be2fe4d6d818`
  - Relative path: `smoke/p2c4-smoke-1782195972619-other-reviewed.mp4`
  - Size: `0`
  - Status: `reviewed`

Smoke selected footage relations:

- Main content selection: `00f1a78f-e59b-441f-88fc-afd2b1913f5b`
- Other content selection: `b1e60617-dc75-44f3-a25e-7c939e3cc229`

All smoke footage rows are metadata-only. No physical footage files were created.

## Script Plan Verification

Created via `GET /api/content-items/:id/script-plan`:

- Script plan ID: `33b6153f-a9a0-4d7d-9ad2-a8effdf4900d`
- Initial status: `draft`
- Initial format: `short_video`

Updated via `POST /api/script-plans/:planId`:

- `plan_status`: `reviewed`
- `video_format`: `reels`
- `hook_text`: `Phase 2C.4 runtime hook`
- `main_message`: `Manual script and shot planning only.`
- `cta_text`: `Chat WA untuk mockup awal.`
- `notes`: `Metadata-only Phase 2C.4 smoke.`

Result: HTTP 200.

## Shot Plan Add / List / Update / Remove Verification

Added step with selected footage:

- Step ID: `3d96f2d5-6bfb-4af6-90d4-50a3a1784254`
- Sequence: `1`
- Type: `product`
- Selected footage relation: `00f1a78f-e59b-441f-88fc-afd2b1913f5b`
- Result: HTTP 201.

Added step without selected footage:

- Step ID: `aa118003-a668-4e74-99b8-8ddd2105bdaf`
- Sequence: `2`
- Type: `cta`
- Selected footage relation: `null`
- Result: HTTP 201.

List order:

- `GET /api/content-items/:id/script-plan` returned steps ordered by `sequence_number`: `1`, then `2`.

Updated one step:

- Step ID: `aa118003-a668-4e74-99b8-8ddd2105bdaf`
- `sequence_number`: `3`
- `step_type`: `closing`
- `visual_note`: `Updated closing with selected footage context.`
- `narration_text`: `Updated narration for WA CTA.`
- `overlay_text`: `Chat WA sekarang`
- `duration_seconds`: `6`
- Optional selected footage relation set to `00f1a78f-e59b-441f-88fc-afd2b1913f5b`
- Result: HTTP 200.

Removed one step:

- Removed step ID: `3d96f2d5-6bfb-4af6-90d4-50a3a1784254`
- Result: HTTP 200.

Final list:

- Remaining step ID: `aa118003-a668-4e74-99b8-8ddd2105bdaf`
- Sequence: `3`
- Type: `closing`

## Guard Verification

Cross-content selected footage rejection:

- Tried to create a step on main content script plan using selected footage relation `b1e60617-dc75-44f3-a25e-7c939e3cc229` from another content item.
- Result: HTTP 400.
- Error code: `footage_selection_mismatch`
- Message: `Pilihan footage tidak dimiliki konten script plan ini.`

Duplicate sequence rejection:

- Tried to create a second step with `sequence_number = 3`.
- Result: HTTP 409.
- Error code: `duplicate_shot_plan_sequence`
- Message: `Urutan shot plan sudah dipakai.`

Invalid duration rejection:

- Tried to create a step with `duration_seconds = 121`.
- Result: HTTP 400.
- Error code: `invalid_duration_seconds`
- Message: `Durasi shot harus kosong atau 1 sampai 120 detik.`

## Remove / Persistence Verification

Final database state:

```text
content_items: 2
footage_assets: 2
footage_selections: 2
script_plans: 1
kept_steps: 1
removed_steps: 0
```

This confirms step removal deleted only the intended shot plan step row. It did not delete:

- the script plan row
- the content item rows
- the selected footage relation rows
- the footage asset rows
- any physical footage file

## Immutable Footage Metadata Verification

Footage metadata after smoke:

```text
smoke/p2c4-smoke-1782195972619-main-reviewed.mp4  | p2c4-smoke-1782195972619-main-reviewed.mp4  | .mp4 | 0 | reviewed
smoke/p2c4-smoke-1782195972619-other-reviewed.mp4 | p2c4-smoke-1782195972619-other-reviewed.mp4 | .mp4 | 0 | reviewed
```

The script/shot planning workflow did not change:

- `relative_path`
- `filename`
- `file_extension`
- `size_bytes`

## Physical Footage Verification

`storage/footage` before and after smoke:

```text
.gitkeep|61|1781846550.1669778710
```

No physical footage file was created, edited, moved, renamed, copied, deleted, uploaded, or rendered.

## OpenAI / Automation Verification

Runtime config:

```text
CAMPAIGN_PLANNER_PROVIDER=fake
CAMPAIGN_PLANNER_OPENAI_ENABLED=false
OPENAI_MODEL blank/unset
```

No OpenAI live call was made.

No upload, video render, scheduler, publisher, or auto-posting feature was added.

## Validation

Validation passed:

```sh
npm run check
git diff --check
```

Safety grep on this document found no credential-pattern matches.

## Handoff

Operator flow:

1. Open a content item detail page.
2. Click `Script/Shot Plan`.
3. Fill or update the script plan fields manually.
4. Use selected footage as optional context for shot plan steps.
5. Use `sequence_number` to control shot order.
6. Use `step_type` to describe the shot purpose.
7. Use visual, narration, overlay, and duration fields as planning notes.
8. Remove a step only when that planning row should be detached.

Important behavior:

- Script planning is manual/rule-based.
- Selected footage can be used as context, but only if it belongs to the same content item.
- Removing a shot step only deletes the shot plan step row.
- Removing a shot step does not delete the script plan, content item, selected footage relation, footage asset, or physical file.
- This phase is still pre-render and pre-publisher.

## Warnings

- Non-blocking: local DB now contains Phase 2C.4 smoke metadata rows under `P2C4-SMOKE-1782195972619` and `smoke/p2c4-smoke-1782195972619-*.mp4`. These are metadata-only rows and can be handled later using the existing safe metadata workflows.

## Next Phase Readiness

Phase 2C.4 confirms the script/shot planning runtime is ready for owner review. Future work can build toward script/shot selection rules, but should continue to avoid AI generation, rendering, publisher, and scheduler automation until explicitly approved.
