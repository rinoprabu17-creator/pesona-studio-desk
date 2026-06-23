# Phase 2B.2 Footage Catalog Runtime Smoke

Tanggal: 2026-06-23

## Ringkasan

Status: PASS dengan catatan non-blocking.

Smoke runtime Footage Catalog berjalan di local Docker/dev environment. Satu record metadata-only dibuat dan diperbarui di PostgreSQL:

- `id`: `d026512e-af03-484a-9731-1c5c02a5c173`
- `relative_path`: `smoke/phase-2b2-test.mp4`
- final `status`: `reviewed`
- final `shot_type`: `packing`
- final `quality_score`: `4`

Tidak ada file footage fisik yang dibuat, diubah, dipindah, atau dihapus. `storage/footage` tetap hanya berisi `.gitkeep`.

OpenAI tetap non-live:

- `CAMPAIGN_PLANNER_PROVIDER=fake`
- `CAMPAIGN_PLANNER_OPENAI_ENABLED=false`
- `OPENAI_MODEL` kosong

## Commands and Results

```sh
pwd
git branch --show-current
git status --short
```

Result:

- cwd: `/home/rinop/projects/pesona-studio-desk`
- branch: `phase-2b2-footage-catalog-runtime-smoke`
- initial working tree: clean

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml config --services
```

Result: PASS. Services present:

- `postgres`
- `campaign-planner-worker`
- `redis`
- `mockup-worker`
- `n8n`
- `video-worker`
- `web-app`

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml config --quiet
```

Result: PASS.

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml ps
```

Initial result: all expected services were running; `postgres` and `redis` were healthy.

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio
```

Result:

```text
/var/run/postgresql:5432 - accepting connections
```

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping
```

Result:

```text
PONG
```

```sh
npm run db:migrate
```

Result: PASS. Migration `006_phase2b_footage_assets.sql` was applied in this runtime.

```text
[db:migrate] skip 001_phase1a_libraries.sql
[db:migrate] skip 002_phase1b_campaigns.sql
[db:migrate] skip 003_phase1b_content_items.sql
[db:migrate] skip 004_phase1b_content_publications.sql
[db:migrate] skip 005_phase2a_campaign_plan_staging.sql
[db:migrate] applied 006_phase2b_footage_assets.sql
[db:migrate] selesai.
```

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT to_regclass('public.footage_assets') AS footage_assets;"
```

Result:

```text
 footage_assets
----------------
 footage_assets
(1 row)
```

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT version, name FROM schema_migrations ORDER BY version;"
```

Result includes:

```text
 006     | phase2b_footage_assets
```

```sh
curl -fsS -i http://localhost:3000/
```

Result: PASS after refresh. Response was `HTTP/1.1 303 See Other` with `Location: /products`.

```sh
curl -fsS -i http://localhost:3000/footage-assets
```

Initial result before rebuild: non-blocking FAIL, `HTTP/1.1 404 Not Found`. The running web container was stale and did not include the new Phase 2B.1 route.

Allowed refresh command:

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build
```

Result: PASS. Images rebuilt, existing Postgres/Redis/n8n containers kept running, app/worker containers recreated. No volumes were deleted.

After refresh:

```sh
curl -fsS -i http://localhost:3000/footage-assets
curl -fsS -i http://localhost:3000/footage-assets/new
```

Result: PASS. Both returned `HTTP/1.1 200 OK`.

```sh
curl -fsS -i http://localhost:3000/api/footage-assets
```

Result before smoke insert:

```json
{"ok":true,"data":[]}
```

```sh
find storage/footage -maxdepth 3 -printf '%M %s %TY-%Tm-%Td %TH:%TM %p\n' | sort
```

Result before smoke insert:

```text
-rw-r--r-- 61 2026-06-19 12:22 storage/footage/.gitkeep
drwxr-xr-x 4096 2026-06-19 14:29 storage/footage
```

Create metadata-only smoke record:

```sh
curl -fsS -i -X POST http://localhost:3000/api/footage-assets -H 'Content-Type: application/json' --data '{"relative_path":"smoke/phase-2b2-test.mp4","size_bytes":0,"status":"new","shot_type":"product","theme":"Phase 2B.2 smoke","notes":"Safe metadata-only smoke record. No physical file was created or modified."}'
```

Result: PASS, `HTTP/1.1 201 Created`.

Created response key fields:

```json
{
  "id": "d026512e-af03-484a-9731-1c5c02a5c173",
  "relative_path": "smoke/phase-2b2-test.mp4",
  "filename": "phase-2b2-test.mp4",
  "file_extension": "mp4",
  "size_bytes": 0,
  "status": "new",
  "theme": "Phase 2B.2 smoke",
  "shot_type": "product",
  "quality_score": null
}
```

Verify created row:

```sh
curl -fsS -i 'http://localhost:3000/api/footage-assets?theme=Phase%202B.2%20smoke'
curl -fsS -i http://localhost:3000/api/footage-assets/d026512e-af03-484a-9731-1c5c02a5c173
curl -fsS -i 'http://localhost:3000/footage-assets?theme=Phase%202B.2%20smoke'
curl -fsS -i http://localhost:3000/footage-assets/d026512e-af03-484a-9731-1c5c02a5c173
```

Result: PASS. API, list page, and detail page showed the row as `status=new`, `shot_type=product`, and `quality_score=null`.

Attempted update with unsupported method:

```sh
curl -fsS -i -X PUT http://localhost:3000/api/footage-assets/d026512e-af03-484a-9731-1c5c02a5c173 -H 'Content-Type: application/json' --data '{"relative_path":"smoke/phase-2b2-test.mp4","size_bytes":0,"status":"reviewed","shot_type":"packing","theme":"Phase 2B.2 smoke","quality_score":4,"notes":"Safe metadata-only smoke record. No physical file was created or modified."}'
```

Result: non-blocking FAIL, `HTTP/1.1 404 Not Found`. The implemented update route uses `POST /api/footage-assets/:id`, matching the page form.

Update metadata-only smoke record:

```sh
curl -fsS -i -X POST http://localhost:3000/api/footage-assets/d026512e-af03-484a-9731-1c5c02a5c173 -H 'Content-Type: application/json' --data '{"relative_path":"smoke/phase-2b2-test.mp4","size_bytes":0,"status":"reviewed","shot_type":"packing","theme":"Phase 2B.2 smoke","quality_score":4,"notes":"Safe metadata-only smoke record. No physical file was created or modified."}'
```

Result: PASS, `HTTP/1.1 200 OK`.

Updated response key fields:

```json
{
  "id": "d026512e-af03-484a-9731-1c5c02a5c173",
  "relative_path": "smoke/phase-2b2-test.mp4",
  "size_bytes": 0,
  "status": "reviewed",
  "theme": "Phase 2B.2 smoke",
  "shot_type": "packing",
  "quality_score": 4
}
```

Verify updated row:

```sh
curl -fsS -i 'http://localhost:3000/api/footage-assets?status=reviewed&shot_type=packing&theme=Phase%202B.2%20smoke'
curl -fsS -i http://localhost:3000/api/footage-assets/d026512e-af03-484a-9731-1c5c02a5c173
curl -fsS -i 'http://localhost:3000/footage-assets?status=reviewed&shot_type=packing&theme=Phase%202B.2%20smoke'
curl -fsS -i http://localhost:3000/footage-assets/d026512e-af03-484a-9731-1c5c02a5c173
```

Result: PASS. API, list page, and detail page showed `Direview`, `Packing`, and `4/5`.

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT relative_path, size_bytes, status, shot_type, quality_score, notes FROM footage_assets WHERE id = 'd026512e-af03-484a-9731-1c5c02a5c173';"
```

Result:

```text
      relative_path       | size_bytes |  status  | shot_type | quality_score |                                   notes
--------------------------+------------+----------+-----------+---------------+----------------------------------------------------------------------------
 smoke/phase-2b2-test.mp4 |          0 | reviewed | packing   |             4 | Safe metadata-only smoke record. No physical file was created or modified.
(1 row)
```

Confirm no physical footage file was created:

```sh
find storage/footage -maxdepth 3 -printf '%M %s %TY-%Tm-%Td %TH:%TM %p\n' | sort
```

Result after smoke:

```text
-rw-r--r-- 61 2026-06-19 12:22 storage/footage/.gitkeep
drwxr-xr-x 4096 2026-06-19 14:29 storage/footage
```

Confirm OpenAI disabled:

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T campaign-planner-worker printenv CAMPAIGN_PLANNER_PROVIDER CAMPAIGN_PLANNER_OPENAI_ENABLED OPENAI_MODEL
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv CAMPAIGN_PLANNER_PROVIDER CAMPAIGN_PLANNER_OPENAI_ENABLED OPENAI_MODEL
```

Result for both containers:

```text
fake
false

```

Run project check:

```sh
npm run check
```

Result: PASS.

Key summary:

- `test:campaign-planner`: 44 pass, 0 fail
- `test:campaign-planner-openai`: 44 pass, 0 fail; mocked/no network
- `test:campaign-planner-runs`: 17 pass, 0 fail
- `test:campaign-plan-review`: 2 pass, 0 fail
- `test:campaign-plan-import`: 13 pass, 0 fail
- `test:footage-catalog`: 3 pass, 0 fail

## Non-Blocking Warnings

1. An exploratory route/code search used nonexistent top-level paths and exited nonzero:

   ```sh
   rg -n "footage-assets|footage_assets|Footage" app src tests package.json migrations db docker-compose.dev.yml
   ```

   Result: `rg: app: No such file or directory`, `rg: src: No such file or directory`, and `rg: db: No such file or directory`. This was non-blocking; a narrowed search against `apps`, `packages`, `workers`, `scripts`, `tests`, and `migrations` succeeded.
2. Initial `GET /footage-assets` returned 404 because the running web container was stale. Resolved with the allowed `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build`.
3. A first migration-history query used the wrong column name:

   ```sh
   docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT filename FROM schema_migrations ORDER BY filename;"
   ```

   Result: `ERROR: column "filename" does not exist`. Correct columns are `version`, `name`, `checksum`, and `applied_at`.
4. API update with `PUT` returned 404. The current API contract updates with `POST /api/footage-assets/:id`.

## Safety Confirmation

- No product feature was implemented.
- No file upload was added.
- No directory scanning was added.
- No AI tagging or AI analysis was added.
- No OpenAI live call was made.
- No scheduler, publisher, auto-posting, video generation, or render feature was added.
- No physical footage file was mutated, deleted, moved, renamed, or generated.
- No database reset was run.
- No storage reset was run.
- No Docker volume was deleted.
- No commit was made.
