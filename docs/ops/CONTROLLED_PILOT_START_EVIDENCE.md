# Controlled Pilot Start Evidence

## Purpose

This document records Phase 2H.13 owner-provided controlled pilot start evidence for Pesona Studio Desk on the new native Ubuntu server candidate `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize deployment, cutover, production backup, restore, restore dry-run, storage copy, public exposure, or production operation beyond the owner-run controlled pilot.

## Scope And Non-Goals

In scope:

- Record owner-provided controlled pilot start evidence for Docker Compose project `psd_pilot`.
- Record release baseline, pre-start port check, pilot override behavior, config validation, pilot DB setup, full stack start, runtime status, route checks, port isolation, storage evidence, access note, and outcome.
- Record that manual publish remains default.
- Record that fake/local Campaign Planner provider remained active.
- Record that public exposure and cutover remain blocked.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Deployment or cutover.
- Production backup.
- Restore or restore dry-run.
- Storage copy.
- Public exposure or Cloudflare Tunnel.
- Scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- Stopping, restarting, or mutating containers by Codex.
- Docker Compose up/down by Codex.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing pilot override files from `/srv/pesona-studio/tmp`.
- Committing env files, secrets, `node_modules`, generated media, storage artifacts, backup files, dump files, tar archives, checksum files, or restore evidence files.

## Server And Repo Baseline

Owner-provided server evidence:

| Item | Evidence |
| --- | --- |
| Server | `pesona` |
| Repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Checked out release tag | `phase-2h12-complete` |
| HEAD | `ea4cc57` |
| `origin/main` | `ea4cc57` |
| `origin/HEAD` | `ea4cc57` |
| Git status before pilot start | Clean |

## Pre-start Port Check

Owner-provided evidence before pilot start:

- Existing host ports:
  - `3010` for `growth_os_app`.
  - `3020` for `wablast1_app`.
  - `3030` for `wablast2_app`.
- No existing listeners shown for:
  - `3000`.
  - `3400`.
  - `5432`.
  - `5678`.
  - `6379`.
- Existing non-PSD containers were not stopped or modified.

## Pilot Override Evidence

Owner created a temporary pilot override file on the server:

```text
/srv/pesona-studio/tmp/psd-pilot-compose.override.yml
```

Override behavior recorded from owner evidence:

- Published only `web-app` host port `3400` to container port `3000`.
- Removed host port publishing for `postgres`.
- Removed host port publishing for `redis`.
- Removed host port publishing for `n8n`.
- Set fake/local Campaign Planner provider:
  - `CAMPAIGN_PLANNER_PROVIDER=fake`.
  - `CAMPAIGN_PLANNER_OPENAI_ENABLED=false`.
  - `OPENAI_MODEL=""`.
- Set `restart: "no"` for pilot services.

The override file is evidence only and is not committed to Git.

## Config Validation

Owner-provided Docker Compose config evidence showed only one host port publication:

| Service | Target | Published |
| --- | ---: | ---: |
| `web-app` | `3000` | `"3400"` |

Config evidence showed no published host ports for:

- `5432`.
- `5678`.
- `6379`.
- `3000`.

## Pilot DB Setup Evidence

Owner-provided setup evidence:

- Docker Compose project: `psd_pilot`.
- Only `postgres` and `redis` were started first.
- Created network: `psd_pilot_default`.
- Created volumes:
  - `psd_pilot_postgres_data_dev`.
  - `psd_pilot_redis_data_dev`.
- Started containers:
  - `psd_pilot-postgres-1`.
  - `psd_pilot-redis-1`.
- Pilot Postgres readiness check passed.
- Migrations `001` through `018` applied successfully to the pilot database.

## Full Pilot Start Evidence

Owner-provided full pilot start evidence:

- Full pilot stack started with build.
- Built/started service containers:
  - `psd_pilot-web-app`.
  - `psd_pilot-campaign-planner-worker`.
  - `psd_pilot-video-worker`.
  - `psd_pilot-mockup-worker`.
- Created volume:
  - `psd_pilot_n8n_data_dev`.
- Started containers:
  - `psd_pilot-postgres-1` healthy.
  - `psd_pilot-redis-1` healthy.
  - `psd_pilot-web-app-1` started.
  - `psd_pilot-campaign-planner-worker-1` started.
  - `psd_pilot-mockup-worker-1` started.
  - `psd_pilot-n8n-1` started.
  - `psd_pilot-video-worker-1` started.

## Runtime Status Evidence

Owner-provided runtime status:

| Container | Status |
| --- | --- |
| `psd_pilot-n8n-1` | Up, internal `5678/tcp` only |
| `psd_pilot-web-app-1` | Up, `0.0.0.0:3400->3000/tcp`, `[::]:3400->3000/tcp` |
| `psd_pilot-campaign-planner-worker-1` | Up |
| `psd_pilot-mockup-worker-1` | Up |
| `psd_pilot-video-worker-1` | Up |
| `psd_pilot-postgres-1` | Up healthy, internal `5432/tcp` only |
| `psd_pilot-redis-1` | Up healthy, internal `6379/tcp` only |

## Route Check Evidence

Owner-provided route checks on `127.0.0.1:3400` all returned HTTP 200:

- `/health`.
- `/operational-readiness`.
- `/content-calendar`.
- `/content-items`.
- `/approved-videos`.
- `/publication-packages`.
- `/manual-publish-report`.
- `/manual-publish-closeouts`.

Route check is PASS.

## Host Port Evidence

Owner-provided host listener evidence after pilot start:

- Host listeners present:
  - `3400` for PSD pilot web.
  - Existing `3010`.
  - Existing `3020`.
  - Existing `3030`.
- No host listeners shown for:
  - `3000`.
  - `5432`.
  - `5678`.
  - `6379`.

Port isolation is PASS.

## Storage Evidence

Owner-provided storage evidence:

| Check | Evidence |
| --- | --- |
| `/srv/pesona-studio` device | `/dev/sdb1` |
| Size | `469G` |
| Available | `445G` |
| Repo storage path | `/srv/pesona-studio/repos/pesona-studio-desk/storage` |
| Repo storage usage | `48K` |

## Access Evidence

Owner may review the controlled pilot through LAN/Tailscale:

```text
http://100.120.79.33:3400/content-calendar
```

Public exposure remains not approved.

## Outcome

Controlled pilot start is PASS.

- Route check: PASS.
- Port isolation: PASS.
- Fake/local provider: PASS.
- Manual publish remains default.
- No social API, scheduler, publisher, upload automation, OpenAI live runtime, public exposure, production restore, storage copy, or cutover occurred.

Cutover remains blocked.

## What Was Not Executed By Codex

- No command on Lenovo.
- No new command on the `pesona` server.
- No deployment.
- No cutover.
- No production backup.
- No restore.
- No restore dry-run.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No pilot override file, env file, secret, `node_modules`, generated media, storage artifact, backup file, dump file, archive file, checksum file, or restore evidence file committed.

## Next Safe Phase

Next safe phase: controlled pilot review and operating evidence, or production backup policy acceptance.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
