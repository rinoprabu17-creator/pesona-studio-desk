# Pilot Post-Entry Backup Evidence

## Purpose

This document records Phase 2H.15 owner-provided post-entry pilot backup evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production backup, restore, restore dry-run, deployment, cutover, storage copy, public exposure, render execution, or production operation beyond the owner-run controlled pilot.

## Scope And Non-Goals

In scope:

- Record owner-provided post-entry pilot backup evidence after UI metadata entry.
- Record backup directory, server/repo baseline, backup artifact file sizes, storage evidence, checksum verification, archive readability, PostgreSQL dump readability, running container status, and outcome.
- Record that pilot stack remained running after backup.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Production backup.
- Restore or restore dry-run.
- Deployment.
- Cutover.
- Storage copy.
- Public exposure or Cloudflare Tunnel.
- Scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- Render execution.
- Stopping, restarting, or mutating containers by Codex.
- Docker Compose up/down by Codex.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing backup files, dump files, tar archives, checksum files, route evidence files, env files, secrets, `node_modules`, generated media, or storage artifacts.

## Post-Entry Backup Scope

Owner-provided evidence records:

- Backup was executed after UI metadata entry.
- Backup was executed for controlled pilot stack `psd_pilot`.
- This is post-entry pilot backup evidence.
- This is not production backup.
- This is not cutover.
- No restore was performed.
- No restore dry-run was performed.
- Pilot stack remained running after backup.

## Server And Repo Baseline

| Item | Evidence |
| --- | --- |
| Server | `pesona` |
| Repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Git head | `ea4cc57120ebc9efa0a2d4f6d02079b73e23404f` |
| Tag | `phase-2h12-complete` |
| Git status short count | `0` |
| Compose project | `psd_pilot` |

## Backup Directory

Owner-provided backup directory:

```text
/srv/pesona-studio/backups/psd-pilot-post-ui-backup-20260702T101832Z
```

Backup artifacts remain on the server backup path only and must not be committed to Git.

## Backup Files And Sizes

Owner-provided backup artifact evidence:

| File | Size |
| --- | ---: |
| `baseline-evidence.txt` | `224` bytes |
| `pilot-db-evidence.txt` | `1186` bytes |
| `pilot-route-status.txt` | `157` bytes |
| `pilot-running-containers.txt` | `616` bytes |
| `postgres-dump-list.txt` | `8219` bytes |
| `postgres-pilot-post-ui.dump` | `163275` bytes |
| `SHA256SUMS.txt` | `546` bytes |
| `storage-archive-list.txt` | `273` bytes |
| `storage-pilot-post-ui.tgz` | `827` bytes |

Backup directory size: `204K`.

No backup file, dump file, tar archive, checksum file, route evidence file, or storage artifact is committed to this repository.

## Storage Evidence

Owner-provided storage evidence:

| Check | Evidence |
| --- | --- |
| `/srv/pesona-studio` size | `469G` |
| `/srv/pesona-studio` available | `445G` |
| Backup directory size | `204K` |

## Integrity Checks

Owner-provided `sha256sum -c SHA256SUMS.txt` evidence passed for:

- `baseline-evidence.txt`.
- `pilot-db-evidence.txt`.
- `pilot-route-status.txt`.
- `pilot-running-containers.txt`.
- `postgres-pilot-post-ui.dump`.
- `storage-pilot-post-ui.tgz`.

Post-entry backup checksum is PASS.

## Storage Archive Readability

Owner-provided evidence records that `storage-pilot-post-ui.tgz` was readable and listed expected storage placeholder paths.

Post-entry storage archive readability is PASS.

## PostgreSQL Dump Readability

Owner-provided evidence records that `postgres-pilot-post-ui.dump` was readable through `pg_restore -l`.

Dump details:

- Database: `pesona_studio`.
- TOC entries: `306`.
- Format: `CUSTOM`.
- Dumped from PostgreSQL `16.14`.
- Included expected schema/data entries such as:
  - `campaign_plan_generation_batches`.
  - `campaigns`.
  - `content_items`.
  - `content_publications`.
  - `footage_assets`.
  - `manual_publication_packages`.
  - `manual_publish_checklist_items`.
  - `manual_publish_closeouts`.
  - `video_draft_jobs`.
  - `video_render_attempts`.
  - `video_render_manifests`.
  - `video_render_preflight_runs`.

Post-entry PostgreSQL dump readability is PASS.

## Pilot State After Backup

Owner-provided pilot status after backup:

| Container | Status |
| --- | --- |
| `psd_pilot-n8n-1` | Up, internal `5678/tcp` |
| `psd_pilot-web-app-1` | Up, `0.0.0.0:3400->3000/tcp` |
| `psd_pilot-campaign-planner-worker-1` | Up |
| `psd_pilot-mockup-worker-1` | Up |
| `psd_pilot-video-worker-1` | Up |
| `psd_pilot-postgres-1` | Up healthy, internal `5432/tcp` |
| `psd_pilot-redis-1` | Up healthy, internal `6379/tcp` |

Pilot remained running after backup.

## Outcome

Post-entry backup evidence is PASS.

Post-entry backup checksum is PASS. Post-entry PostgreSQL dump readability is PASS. Post-entry storage archive readability is PASS.

Pilot remained running.

This is post-entry pilot backup evidence only. It is not production backup and not cutover.

Cutover remains blocked.

## What Was Not Executed By Codex

- No command on Lenovo.
- No new command on the `pesona` server.
- No production backup.
- No restore.
- No restore dry-run.
- No deployment.
- No cutover.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No render execution.
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, or storage artifact committed.

## Next Safe Phase

Next safe phase: post-entry pilot backup restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
