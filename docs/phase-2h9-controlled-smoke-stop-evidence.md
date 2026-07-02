# Phase 2H.9 Controlled Smoke Stop Evidence

## Phase Name

Phase 2H.9 Controlled Smoke Stop Evidence.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `7d19a8b`.
- Baseline tag: `phase-2h8-complete`.
- Current branch/state: `phase-2h9-controlled-smoke-stop-evidence` with docs-only evidence changes not committed.
- This phase records owner-provided controlled smoke stop evidence only.

## Docs Created

- `docs/ops/CONTROLLED_SMOKE_STOP_EVIDENCE.md`
- `docs/phase-2h9-controlled-smoke-stop-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Evidence Summary

Owner-provided evidence records controlled stop for the isolated server smoke stack on `pesona`:

- Server path: `/srv/pesona-studio/repos/pesona-studio-desk`.
- Docker Compose project: `psd_server_smoke`.
- Stop command used by owner: `docker compose --env-file .env.local -p psd_server_smoke -f docker-compose.dev.yml stop`.
- Stop result: `7/7` smoke containers stopped.
- Stopped containers:
  - `psd_server_smoke-n8n-1`
  - `psd_server_smoke-video-worker-1`
  - `psd_server_smoke-web-app-1`
  - `psd_server_smoke-mockup-worker-1`
  - `psd_server_smoke-campaign-planner-worker-1`
  - `psd_server_smoke-postgres-1`
  - `psd_server_smoke-redis-1`
- Post-stop `docker ps --filter "name=psd_server_smoke"` showed no running smoke containers.
- Post-stop `docker ps -a --filter "name=psd_server_smoke"` showed all smoke containers exited:
  - `psd_server_smoke-n8n-1`: `Exited (0)`
  - `psd_server_smoke-web-app-1`: `Exited (137)`
  - `psd_server_smoke-campaign-planner-worker-1`: `Exited (0)`
  - `psd_server_smoke-video-worker-1`: `Exited (0)`
  - `psd_server_smoke-mockup-worker-1`: `Exited (0)`
  - `psd_server_smoke-postgres-1`: `Exited (0)`
  - `psd_server_smoke-redis-1`: `Exited (0)`
- Port check for `3000`, `5432`, `5678`, and `6379` returned no listeners.
- Smoke volumes remain preserved:
  - `psd_server_smoke_n8n_data_dev`
  - `psd_server_smoke_postgres_data_dev`
  - `psd_server_smoke_redis_data_dev`
- `psd_server_smoke-web-app-1` `Exited (137)` is recorded as a stop warning only, not as evidence of data loss.
- No `docker compose down -v` was run.
- No `docker volume rm` was run.
- No storage deletion was run.
- No backup, restore, restore dry-run, storage copy, deployment, public exposure, or cutover occurred.
- Smoke data and volumes should be considered preserved unless later verified otherwise.
- Existing non-smoke containers were not modified.

## Outcome

Controlled smoke stop is PASS.

Phase 2H.8 runtime smoke evidence remains valid. The smoke stack was stopped safely without volume deletion. No running smoke containers remain, ports `3000`, `5432`, `5678`, and `6379` are no longer listening, and smoke volumes remain preserved.

Cutover remains blocked.

## Safety Confirmations

- Docs-only/read-only evidence intake in this repo.
- No command run by Codex on Lenovo.
- No new command run by Codex on the `pesona` server.
- No deployment.
- No cutover.
- No backup.
- No restore.
- No restore dry-run execution.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No container stop, restart, or mutation by Codex.
- No `docker compose up` or `docker compose down` by Codex.
- No `docker compose down -v`.
- No `docker volume rm`.
- No storage deletion.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change.
- No env file, secret, `node_modules`, generated media, operational media, or storage artifact committed.

## Validation Results

Local validation on laptop/WSL completed for this docs-only evidence branch:

| Check | Result |
| --- | --- |
| `git diff --check` | PASS: no whitespace errors. |
| `npm run check` | PASS: 106 tests, 106 pass, 0 fail. |
| `git diff --name-only \| grep "workers/video" \|\| true` | PASS: no `workers/video` diff. |
| Path safety check | PASS: changed paths do not include forbidden app/runtime, migration, script, env, secret, `node_modules`, storage, or media paths. |
| Safety grep against changed docs only | PASS: expected sensitive/destructive/runtime terms appear only in evidence notes, warnings, non-goals, HOLD conditions, pending lists, or safety descriptions. |
| `git status --short --ignored` | PASS: docs/readme changes only, plus ignored local artifacts; no commit and no push performed. |

## Pending Execution List

The following remain pending and require separate owner approval:

- Backup evidence acceptance.
- Controlled backup dry-run planning.
- Backup execution.
- Restore planning and restore dry-run execution in a separate test environment.
- Storage copy.
- Deployment.
- Cutover Go/No-Go.
- Actual cutover.
- GPU driver installation.
- Public exposure or Cloudflare Tunnel.
- `systemd`, cron, or autostart setup.
- Automated backup.
- Scheduler, publisher, social API, OpenAI live runtime, upload automation, queue expansion, or worker daemon changes.

## Recommended Next Phase

Recommended next safe phase: backup evidence acceptance or controlled backup dry-run planning. Do not treat Phase 2H.9 as cutover readiness.
