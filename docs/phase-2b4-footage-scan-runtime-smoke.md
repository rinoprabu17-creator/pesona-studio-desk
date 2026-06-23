# Phase 2B.4 Footage Scan Runtime Smoke

Date/time: 2026-06-23 11:11:58 +0700

## Summary

Status: PASS with non-blocking warnings.

Branch verified: `phase-2b4-footage-scan-runtime-smoke`

Baseline tag verified at HEAD: `phase-2b3-complete`

This smoke verified the Phase 2B.3 Footage Directory Read-Only Scan Preview in the local Docker/dev runtime. A temporary scanner fixture was created under `storage/footage/smoke/`, imported as database metadata only, verified as cataloged, verified as skipped on repeat import, and then removed from disk.

No production footage file was created, edited, moved, renamed, copied, uploaded, deleted, or rendered. No OpenAI live call was made.

## Commands Run

```sh
git branch --show-current
git status --short
git tag --points-at HEAD
sed -n '1,220p' README.md
sed -n '1,260p' docs/PROJECT_BLUEPRINT.md
sed -n '1,240p' docs/SYSTEM_BOUNDARY.md
sed -n '1,280p' docs/AI_AGENTS_SPEC.md
sed -n '1,260p' docs/DATA_MODEL.md
sed -n '1,260p' docs/MVP_BUILD_SEQUENCE.md
sed -n '1,260p' configs/campaign_knowledge_base.json
docker compose --env-file .env.local -f docker-compose.dev.yml config --services
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml config
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping
npm run db:migrate
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT version, name FROM schema_migrations WHERE version = '006';"
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT to_regclass('public.footage_assets') AS footage_assets;"
curl -fsS -i http://localhost:3000/footage-assets
curl -fsS -i http://localhost:3000/footage-assets/scan
curl -fsS -i http://localhost:3000/api/footage-assets
curl -fsS -i http://localhost:3000/api/footage-assets/scan
find storage/footage -maxdepth 4 -printf '%M %s %TY-%Tm-%Td %TH:%TM:%TS %p\n' | sort
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT id, relative_path, status, shot_type, size_bytes FROM footage_assets WHERE relative_path = 'smoke/phase-2b4-scan-test.mp4';"
mkdir -p storage/footage/smoke && printf 'phase-2b4 temporary scanner metadata fixture\n' > storage/footage/smoke/phase-2b4-scan-test.mp4 && stat --printf='path=%n\nsize=%s\nmtime=%y\n' storage/footage/smoke/phase-2b4-scan-test.mp4
sha256sum storage/footage/smoke/phase-2b4-scan-test.mp4
curl -fsS http://localhost:3000/api/footage-assets/scan
curl -fsS -i http://localhost:3000/footage-assets/scan
curl -fsS -i -X POST http://localhost:3000/api/footage-assets/scan/import -H 'Content-Type: application/json' --data '{"shot_type":"other"}'
stat --printf='path=%n\nsize=%s\nmtime=%y\n' storage/footage/smoke/phase-2b4-scan-test.mp4
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT relative_path, filename, file_extension, size_bytes, status, shot_type FROM footage_assets WHERE relative_path = 'smoke/phase-2b4-scan-test.mp4';"
curl -fsS http://localhost:3000/api/footage-assets/scan
curl -fsS -i http://localhost:3000/footage-assets/scan
sha256sum storage/footage/smoke/phase-2b4-scan-test.mp4
curl -fsS -i -X POST http://localhost:3000/api/footage-assets/scan/import -H 'Content-Type: application/json' --data '{"shot_type":"other"}'
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -c "SELECT COUNT(*) AS count FROM footage_assets WHERE relative_path = 'smoke/phase-2b4-scan-test.mp4';"
stat --printf='path=%n\nsize=%s\nmtime=%y\n' storage/footage/smoke/phase-2b4-scan-test.mp4
sha256sum storage/footage/smoke/phase-2b4-scan-test.mp4
rm storage/footage/smoke/phase-2b4-scan-test.mp4
rmdir storage/footage/smoke
find storage/footage -maxdepth 4 -printf '%M %s %TY-%Tm-%Td %TH:%TM:%TS %p\n' | sort
curl -fsS http://localhost:3000/api/footage-assets/scan
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T campaign-planner-worker printenv CAMPAIGN_PLANNER_PROVIDER CAMPAIGN_PLANNER_OPENAI_ENABLED OPENAI_MODEL
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app printenv CAMPAIGN_PLANNER_PROVIDER CAMPAIGN_PLANNER_OPENAI_ENABLED OPENAI_MODEL
npm run check
git diff --check
date '+%Y-%m-%d %H:%M:%S %z'
git diff --stat
git diff --name-only
git status --short
```

## Service Status

`docker compose --env-file .env.local -f docker-compose.dev.yml config` resolved successfully.

Expected services were present:

- `postgres`
- `redis`
- `n8n`
- `web-app`
- `campaign-planner-worker`
- `video-worker`
- `mockup-worker`

`docker compose --env-file .env.local -f docker-compose.dev.yml ps` showed all expected services running. `postgres` and `redis` were healthy.

Postgres health:

```text
/var/run/postgresql:5432 - accepting connections
```

Redis health:

```text
PONG
```

## Migration and Table Verification

`npm run db:migrate` completed successfully and skipped all already-applied migrations:

```text
[db:migrate] skip 001_phase1a_libraries.sql
[db:migrate] skip 002_phase1b_campaigns.sql
[db:migrate] skip 003_phase1b_content_items.sql
[db:migrate] skip 004_phase1b_content_publications.sql
[db:migrate] skip 005_phase2a_campaign_plan_staging.sql
[db:migrate] skip 006_phase2b_footage_assets.sql
[db:migrate] selesai.
```

Migration 006 verification:

```text
 version |          name
---------+------------------------
 006     | phase2b_footage_assets
(1 row)
```

Table verification:

```text
 footage_assets
----------------
 footage_assets
(1 row)
```

## Page and API Verification

Pages:

- `GET http://localhost:3000/footage-assets` returned `HTTP/1.1 200 OK`.
- `GET http://localhost:3000/footage-assets/scan` returned `HTTP/1.1 200 OK`.

APIs before fixture:

- `GET http://localhost:3000/api/footage-assets` returned `HTTP/1.1 200 OK`.
- `GET http://localhost:3000/api/footage-assets/scan` returned `HTTP/1.1 200 OK`.

Scan API before fixture:

```json
{
  "ok": true,
  "data": {
    "storage_root": "/app/storage/footage",
    "files": [],
    "skipped": [
      {
        "relative_path": ".gitkeep",
        "reason": "Ekstensi file footage tidak valid."
      }
    ]
  }
}
```

## Storage Listing Before Fixture

```text
-rw-r--r-- 61 2026-06-19 12:22:30.1669778710 storage/footage/.gitkeep
drwxr-xr-x 4096 2026-06-19 14:29:05.2226751510 storage/footage
```

The Phase 2B.4 smoke path was not already cataloged:

```text
 id | relative_path | status | shot_type | size_bytes
----+---------------+--------+-----------+------------
(0 rows)
```

## Smoke Fixture

Fixture path:

```text
storage/footage/smoke/phase-2b4-scan-test.mp4
```

Fixture command:

```sh
mkdir -p storage/footage/smoke && printf 'phase-2b4 temporary scanner metadata fixture\n' > storage/footage/smoke/phase-2b4-scan-test.mp4 && stat --printf='path=%n\nsize=%s\nmtime=%y\n' storage/footage/smoke/phase-2b4-scan-test.mp4
```

Before scan/import stat:

```text
path=storage/footage/smoke/phase-2b4-scan-test.mp4
size=45
mtime=2026-06-23 11:10:25.113820886 +0700
```

Before scan/import hash:

```text
b7c5da25ddb29598b71eb2b7fe5665fdc488406d8fec28b160b42d90213acada  storage/footage/smoke/phase-2b4-scan-test.mp4
```

Storage listing with fixture:

```text
-rw-r--r-- 45 2026-06-23 11:10:25.1138208860 storage/footage/smoke/phase-2b4-scan-test.mp4
-rw-r--r-- 61 2026-06-19 12:22:30.1669778710 storage/footage/.gitkeep
drwxr-xr-x 4096 2026-06-23 11:10:25.1074026880 storage/footage
drwxr-xr-x 4096 2026-06-23 11:10:25.1074026880 storage/footage/smoke
```

## Scan Before Import

Scan API after fixture creation:

```json
{
  "ok": true,
  "data": {
    "storage_root": "/app/storage/footage",
    "files": [
      {
        "relative_path": "smoke/phase-2b4-scan-test.mp4",
        "filename": "phase-2b4-scan-test.mp4",
        "file_extension": "mp4",
        "size_bytes": 45,
        "cataloged": false
      }
    ],
    "skipped": [
      {
        "relative_path": ".gitkeep",
        "reason": "Ekstensi file footage tidak valid."
      }
    ]
  }
}
```

The scan page also showed `smoke/phase-2b4-scan-test.mp4` as `Belum tercatat`.

## Metadata Import

Import command:

```sh
curl -fsS -i -X POST http://localhost:3000/api/footage-assets/scan/import -H 'Content-Type: application/json' --data '{"shot_type":"other"}'
```

Result:

```json
{
  "ok": true,
  "data": {
    "created": [
      {
        "relative_path": "smoke/phase-2b4-scan-test.mp4",
        "filename": "phase-2b4-scan-test.mp4",
        "file_extension": "mp4",
        "size_bytes": 45,
        "cataloged": true
      }
    ],
    "skipped_existing": [],
    "skipped_unsafe": [
      {
        "relative_path": ".gitkeep",
        "reason": "Ekstensi file footage tidak valid."
      }
    ]
  }
}
```

Fixture stat immediately after import:

```text
path=storage/footage/smoke/phase-2b4-scan-test.mp4
size=45
mtime=2026-06-23 11:10:25.113820886 +0700
```

## Metadata Record Verification

Database record:

```text
         relative_path         |        filename         | file_extension | size_bytes | status | shot_type
-------------------------------+-------------------------+----------------+------------+--------+-----------
 smoke/phase-2b4-scan-test.mp4 | phase-2b4-scan-test.mp4 | mp4            |         45 | new    | other
(1 row)
```

This confirms:

- `relative_path = smoke/phase-2b4-scan-test.mp4`
- `status = new`
- `shot_type = other`
- `size_bytes = 45`, matching the fixture file size

## Scan After Import

Scan API after import:

```json
{
  "ok": true,
  "data": {
    "storage_root": "/app/storage/footage",
    "files": [
      {
        "relative_path": "smoke/phase-2b4-scan-test.mp4",
        "filename": "phase-2b4-scan-test.mp4",
        "file_extension": "mp4",
        "size_bytes": 45,
        "cataloged": true
      }
    ],
    "skipped": [
      {
        "relative_path": ".gitkeep",
        "reason": "Ekstensi file footage tidak valid."
      }
    ]
  }
}
```

The scan page also showed `smoke/phase-2b4-scan-test.mp4` as `Sudah tercatat`.

Fixture hash after scan/import:

```text
b7c5da25ddb29598b71eb2b7fe5665fdc488406d8fec28b160b42d90213acada  storage/footage/smoke/phase-2b4-scan-test.mp4
```

The fixture hash, size, and mtime were unchanged by scan/import.

## Repeat Import Verification

Repeat import command:

```sh
curl -fsS -i -X POST http://localhost:3000/api/footage-assets/scan/import -H 'Content-Type: application/json' --data '{"shot_type":"other"}'
```

Result:

```json
{
  "ok": true,
  "data": {
    "created": [],
    "skipped_existing": [
      {
        "relative_path": "smoke/phase-2b4-scan-test.mp4",
        "filename": "phase-2b4-scan-test.mp4",
        "file_extension": "mp4",
        "size_bytes": 45,
        "cataloged": true
      }
    ],
    "skipped_unsafe": [
      {
        "relative_path": ".gitkeep",
        "reason": "Ekstensi file footage tidak valid."
      }
    ]
  }
}
```

Duplicate guard verification:

```text
 count
-------
     1
(1 row)
```

Fixture stat after repeat import:

```text
path=storage/footage/smoke/phase-2b4-scan-test.mp4
size=45
mtime=2026-06-23 11:10:25.113820886 +0700
```

Fixture hash after repeat import:

```text
b7c5da25ddb29598b71eb2b7fe5665fdc488406d8fec28b160b42d90213acada  storage/footage/smoke/phase-2b4-scan-test.mp4
```

## Fixture Removal

The temporary smoke fixture was removed with:

```sh
rm storage/footage/smoke/phase-2b4-scan-test.mp4
rmdir storage/footage/smoke
```

Both commands completed successfully. The `smoke` directory was empty and removed.

Storage listing after fixture removal:

```text
-rw-r--r-- 61 2026-06-19 12:22:30.1669778710 storage/footage/.gitkeep
drwxr-xr-x 4096 2026-06-23 11:11:13.1799772160 storage/footage
```

Scan API after fixture removal:

```json
{
  "ok": true,
  "data": {
    "storage_root": "/app/storage/footage",
    "files": [],
    "skipped": [
      {
        "relative_path": ".gitkeep",
        "reason": "Ekstensi file footage tidak valid."
      }
    ]
  }
}
```

No production footage files were present before the fixture, and none were present after fixture removal. Only the temporary fixture and empty smoke directory were created and removed. The `storage/footage` directory mtime changed because of that create/remove operation; no production file was modified.

## OpenAI Confirmation

Runtime config checked in both `campaign-planner-worker` and `web-app`:

```text
fake
false

```

This means:

- `CAMPAIGN_PLANNER_PROVIDER=fake`
- `CAMPAIGN_PLANNER_OPENAI_ENABLED=false`
- `OPENAI_MODEL` blank/unset

No live OpenAI smoke was run.

## Validation

`npm run check`: PASS.

Key test summary:

- `test:campaign-planner`: 44 pass, 0 fail
- `test:campaign-planner-openai`: 44 pass, 0 fail, mocked/no live network
- `test:campaign-planner-runs`: 17 pass, 0 fail
- `test:campaign-plan-review`: 2 pass, 0 fail
- `test:campaign-plan-import`: 13 pass, 0 fail
- `test:footage-catalog`: 5 pass, 0 fail

`git diff --check`: PASS.

## Warnings

1. Non-blocking: `.gitkeep` appears in scan skipped output with reason `Ekstensi file footage tidak valid.` This is expected because the scanner safely skips non-footage paths that fail existing footage relative path validation.
2. Non-blocking: `storage/footage` directory mtime changed because the task created and removed the temporary smoke fixture directory. No production footage file existed or was modified.
3. Non-blocking: The database now contains the Phase 2B.4 smoke metadata row `smoke/phase-2b4-scan-test.mp4`, while the temporary fixture file was removed as required. This mirrors prior metadata-only runtime smoke behavior and avoids resetting/deleting database state.

## Final Pass/Fail

PASS.

The read-only scan preview and metadata-only import path were verified end to end in local runtime. Repeat import skipped the existing catalog record and did not duplicate it. File stat/hash evidence confirmed scan/import did not mutate the fixture file. The temporary fixture file and empty smoke directory were removed. No production footage files were modified. No OpenAI live call was made. No destructive Docker volume or database reset command was run.
