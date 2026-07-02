# Controlled Smoke Stop Evidence

## Purpose

This document records Phase 2H.9 owner-provided controlled stop evidence for the isolated server smoke stack on the new native Ubuntu server candidate named `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize deployment, cutover, backup, restore, restore dry-run, storage copy, public exposure, or production operation.

## Scope And Non-Goals

In scope:

- Record owner-provided controlled stop command and result.
- Record the stopped smoke containers.
- Record owner-provided verification that smoke containers are no longer running, smoke ports are no longer listening, and smoke volumes remain present.
- Record explicit non-destructive boundaries.
- Record that Phase 2H.8 runtime smoke evidence remains valid.
- Record HOLD items and next safe phase.

Out of scope and not authorized:

- Running new commands on Lenovo or on the `pesona` server by Codex.
- Deployment.
- Cutover.
- Backup execution.
- Restore execution or restore dry-run execution.
- Storage copy.
- Public exposure or Cloudflare Tunnel.
- Scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- Stopping, restarting, or mutating containers by Codex.
- `docker compose up` or `docker compose down` by Codex.
- `docker compose down -v`.
- `docker volume rm`.
- Storage deletion.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing env files, secrets, `node_modules`, generated media, operational media, or storage artifacts.

## Stop Project Identity

| Item | Evidence |
| --- | --- |
| Server path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Docker Compose project | `psd_server_smoke` |
| Server candidate | `pesona` |
| Related runtime smoke phase | Phase 2H.8 |

## Stop Command Evidence

Owner-provided evidence recorded this controlled stop command:

```text
docker compose --env-file .env.local -p psd_server_smoke -f docker-compose.dev.yml stop
```

This command was run manually by owner on the server before this docs intake. Codex did not run it.

## Stop Result

Owner-provided evidence recorded `7/7` isolated smoke containers stopped:

- `psd_server_smoke-n8n-1`
- `psd_server_smoke-video-worker-1`
- `psd_server_smoke-web-app-1`
- `psd_server_smoke-mockup-worker-1`
- `psd_server_smoke-campaign-planner-worker-1`
- `psd_server_smoke-postgres-1`
- `psd_server_smoke-redis-1`

## Non-Destructive Evidence

Owner-provided evidence recorded:

- No `docker compose down -v` was run.
- No `docker volume rm` was run.
- No storage deletion was run.
- No backup was performed.
- No restore was performed.
- No restore dry-run was performed.
- No storage copy was performed.
- No deployment was performed.
- No public exposure was enabled.
- No cutover occurred.
- Existing non-smoke containers were not modified.

Smoke data and volumes should be considered preserved unless later verified otherwise.

## Optional Verification Evidence

Owner-provided verification after the controlled stop recorded:

- `docker ps --filter "name=psd_server_smoke"` showed no running smoke containers.
- `docker ps -a --filter "name=psd_server_smoke"` showed all smoke containers exited:
  - `psd_server_smoke-n8n-1`: `Exited (0)`
  - `psd_server_smoke-web-app-1`: `Exited (137)`
  - `psd_server_smoke-campaign-planner-worker-1`: `Exited (0)`
  - `psd_server_smoke-video-worker-1`: `Exited (0)`
  - `psd_server_smoke-mockup-worker-1`: `Exited (0)`
  - `psd_server_smoke-postgres-1`: `Exited (0)`
  - `psd_server_smoke-redis-1`: `Exited (0)`
- Port check for `3000`, `5432`, `5678`, and `6379` returned no listeners.
- `docker volume ls` showed smoke volumes remain present:
  - `psd_server_smoke_n8n_data_dev`
  - `psd_server_smoke_postgres_data_dev`
  - `psd_server_smoke_redis_data_dev`

The `psd_server_smoke-web-app-1` `Exited (137)` status is recorded as a stop warning only. It is not treated as evidence of data loss, because no `docker compose down -v`, `docker volume rm`, or storage deletion was run and smoke volumes remain present.

## Relationship To Phase 2H.8

Phase 2H.8 isolated server runtime smoke evidence remains valid:

- The isolated stack built and started.
- Key routes returned HTTP 200 after migrations.
- The initial DB-backed route issue was caused by missing schema and was resolved by applying migrations to the isolated smoke database.

Phase 2H.9 only records the controlled stop evidence after that smoke. It does not change the Phase 2H.8 PASS result.

## Outcome

Controlled smoke stop is PASS.

The isolated smoke stack was stopped safely. No running smoke containers remain, smoke ports are no longer listening, and smoke volumes remain preserved. This was completed without volume deletion, Docker volume removal, storage deletion, backup, restore, storage copy, deployment, public exposure, or cutover.

Cutover remains blocked.

## What Was Not Executed By Codex

- No command on Lenovo.
- No new command on the `pesona` server.
- No deployment.
- No cutover.
- No backup.
- No restore.
- No restore dry-run execution.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No container stop, restart, or mutation.
- No `docker compose up` or `docker compose down`.
- No `docker compose down -v`.
- No `docker volume rm`.
- No storage deletion.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No env file, secret, `node_modules`, generated media, operational media, or storage artifact committed.

## Next Safe Phase

Next safe phase: backup evidence acceptance or controlled backup dry-run planning.

Neither next step is cutover. Cutover remains blocked until backup evidence, restore dry-run evidence, owner Go/No-Go, and an explicit cutover approval exist.
