# Isolated Server Runtime Smoke Evidence

## Purpose

This document records Phase 2H.8 owner-provided isolated runtime smoke evidence for the new native Ubuntu server candidate named `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize deployment, cutover, backup, restore, restore dry-run, storage copy, public exposure, or production operation.

## Scope And Non-Goals

In scope:

- Record owner-provided isolated Docker Compose smoke evidence.
- Record pre-start port evidence.
- Record initial route failure and migration resolution.
- Record key route status after migration.
- Record runtime status and storage evidence.
- Record warnings, HOLD items, and next safe phase.

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
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing env files, secrets, `node_modules`, generated media, operational media, or storage artifacts.

## Smoke Project Identity

| Item | Evidence |
| --- | --- |
| Docker Compose project | `psd_server_smoke` |
| Repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Release baseline | `phase-2h6-complete` |
| Baseline commit | `3de1646` |
| Server candidate | `pesona` |

The smoke used the release baseline already recorded during Phase 2H.7 server bootstrap evidence.

## Pre-Start Port Evidence

Owner-provided pre-start evidence recorded existing containers using these ports:

| Existing container | Port |
| --- | --- |
| `growth_os_app` | `3010` |
| `wablast1_app` | `3020` |
| `wablast2_app` | `3030` |

Owner evidence recorded that these ports were not occupied before the isolated smoke start:

- `3000`
- `5432`
- `5678`
- `6379`

Existing containers were not stopped, restarted, or modified by Codex.

## Compose Config Port Evidence

Owner-provided `docker compose config` evidence showed these published ports:

| Service | Published port |
| --- | --- |
| `n8n` | `5678` |
| `postgres` | `5432` |
| `redis` | `6379` |
| `web-app` | `3000` |

## Runtime Start Evidence

Owner-provided evidence recorded this isolated server smoke command as completed:

```text
docker compose --env-file .env.local -p psd_server_smoke -f docker-compose.dev.yml up -d --build
```

This command was run manually by owner on the server before this docs intake. Codex did not run it.

Owner evidence recorded:

- Images were pulled and/or built.
- Network `psd_server_smoke_default` was created.
- Named volumes were created:
  - `psd_server_smoke_n8n_data_dev`
  - `psd_server_smoke_postgres_data_dev`
  - `psd_server_smoke_redis_data_dev`
- Containers started:
  - `psd_server_smoke-redis-1` healthy.
  - `psd_server_smoke-postgres-1` healthy.
  - `psd_server_smoke-web-app-1` started.
  - `psd_server_smoke-campaign-planner-worker-1` started.
  - `psd_server_smoke-video-worker-1` started.
  - `psd_server_smoke-n8n-1` started.
  - `psd_server_smoke-mockup-worker-1` started.

## Initial Route Result

Owner-provided initial route evidence:

| Route/check | Result |
| --- | --- |
| `/health` | HTTP 200 |
| DB-backed routes | Initially HTTP 500 |
| Diagnostic | Relation `campaign_plan_generation_batches` did not exist |
| Initial `psql \dt` | No relations |

The initial HTTP 500 responses were caused by missing database schema in the isolated smoke Postgres database.

## Migration Evidence

Owner-provided migration evidence:

- Migrations `001` through `018` were applied to the isolated smoke Postgres database.
- After migration, `psql \dt` showed `30` tables.
- No restore from production data was performed.
- No backup was performed.
- No storage copy was performed.

This migration evidence applies only to the isolated smoke database for project `psd_server_smoke`.

## Basic Route Check After Migration

Owner-provided route checks after migration:

| Route | Result |
| --- | --- |
| `/health` | HTTP 200 |
| `/content-calendar` | HTTP 200 |
| `/content-items` | HTTP 200 |
| `/approved-videos` | HTTP 200 |

## Extended Route Check

Owner-provided extended route checks all returned HTTP 200:

- `/health`
- `/operational-readiness`
- `/content-calendar`
- `/content-items`
- `/approved-videos`
- `/publication-packages`
- `/manual-publish-report`
- `/manual-publish-closeouts`

## Runtime Status After Extended Check

Owner-provided runtime status after the extended route check:

| Container | Status |
| --- | --- |
| `psd_server_smoke-n8n-1` | Up, `0.0.0.0:5678->5678` |
| `psd_server_smoke-web-app-1` | Up, `0.0.0.0:3000->3000` |
| `psd_server_smoke-campaign-planner-worker-1` | Up |
| `psd_server_smoke-video-worker-1` | Up |
| `psd_server_smoke-mockup-worker-1` | Up |
| `psd_server_smoke-postgres-1` | Up healthy, `0.0.0.0:5432->5432` |
| `psd_server_smoke-redis-1` | Up healthy, `0.0.0.0:6379->6379` |

## Storage Evidence

Owner-provided storage evidence:

| Check | Evidence |
| --- | --- |
| `df -h /srv/pesona-studio` device | `/dev/sdb1` |
| Total | `469G` |
| Available | `445G` |
| Used | `1%` |
| `du -sh /srv/pesona-studio/repos/pesona-studio-desk/storage` | `48K` |

## Warnings

- The smoke stack binds ports to `0.0.0.0`, visible to LAN/Tailscale.
- Public exposure remains not approved.
- This is isolated server runtime smoke evidence, not cutover evidence.
- No production/customer data was used.
- No production/customer media was used.
- GPU driver remains HOLD.
- Backup, restore, restore dry-run, storage copy, deployment, and cutover remain HOLD.

## Outcome

Isolated server runtime smoke is PASS after migrations.

The new `pesona` server candidate can build/start the isolated stack and serve key routes after schema migration. The initial HTTP 500 issue on DB-backed routes was caused by a missing database schema and was resolved by applying migrations to the isolated smoke database.

This outcome does not authorize cutover. It also does not authorize backup, restore, restore dry-run, storage copy, deployment, public exposure, scheduler/publisher/social API activation, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.

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
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No env file, secret, `node_modules`, generated media, operational media, or storage artifact committed.

## Next Safe Phase

Next safe phase: server smoke review and controlled stop procedure planning, or backup evidence acceptance.

Neither next step is cutover. Cutover remains blocked until backup evidence, restore dry-run evidence, owner Go/No-Go, and an explicit cutover approval exist.
