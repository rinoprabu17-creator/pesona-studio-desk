# Controlled Smoke Backup Evidence

## Purpose

This document records Phase 2H.10 owner-provided controlled backup evidence for the isolated server smoke stack on the new native Ubuntu server candidate named `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production backup, restore, restore dry-run, deployment, cutover, storage copy, public exposure, or production operation.

## Scope And Non-Goals

In scope:

- Record owner-provided controlled backup evidence for isolated smoke project `psd_server_smoke`.
- Record backup directory, procedure, files, storage evidence, checksum verification, archive readability, and PostgreSQL dump listing readability.
- Record explicit warnings that this is smoke-only backup evidence, not production backup evidence.
- Record that no restore or restore dry-run was performed.
- Record HOLD items and next safe phase.

Out of scope and not authorized:

- Running new commands on Lenovo or on the `pesona` server by Codex.
- Production backup.
- Restore execution.
- Restore dry-run execution.
- Deployment.
- Cutover.
- Storage copy.
- Public exposure or Cloudflare Tunnel.
- Scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- Stopping, restarting, or mutating containers by Codex.
- `docker compose up` or `docker compose down` by Codex.
- `docker compose down -v`.
- `docker volume rm`.
- Storage deletion.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing backup files, dump files, archive files, checksum files, env files, secrets, `node_modules`, generated media, operational media, or storage artifacts.

## Backup Scope

Owner-provided evidence records that the backup procedure was controlled and limited to the isolated smoke stack:

| Item | Evidence |
| --- | --- |
| Server candidate | `pesona` |
| Docker Compose project | `psd_server_smoke` |
| Repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Scope | Isolated smoke stack only |
| Production backup | Not performed |
| Restore | Not performed |
| Restore dry-run | Not performed |
| Cutover | Not performed |

## Server And Repo Baseline

Owner-provided baseline evidence:

| Item | Evidence |
| --- | --- |
| Git head | `76a9b0ca8ce9bb81c9043f8bda3b0881491c9146` |
| Tag | `phase-2h9-complete` |
| Git status short count | `0` |

## Backup Directory

Owner-provided backup directory:

```text
/srv/pesona-studio/backups/psd-smoke-backup-20260702T075815Z
```

Backup artifacts remain on the server backup path only. They must not be committed to Git.

## Backup Procedure Evidence

Owner-provided procedure evidence:

- Pre-backup: no `psd_server_smoke` containers were running.
- Only `psd_server_smoke-postgres-1` was started for logical dump.
- Postgres readiness check passed.
- `pg_dump --format=custom --no-owner --no-privileges` created `postgres-smoke.dump`.
- Table list evidence was created as `postgres-table-list.txt`.
- Smoke storage archive was created as `storage-smoke.tgz`.
- Postgres was stopped again.
- Post-backup: no smoke containers were running.
- No `docker compose down -v` was run.
- No `docker volume rm` was run.
- No storage deletion was run.

This procedure was performed by owner before this docs intake. Codex did not run it.

## Backup Files Evidence

Owner-provided file listing:

| File | Size |
| --- | ---: |
| `baseline-evidence.txt` | `197` bytes |
| `pre-backup-running-containers.txt` | `26` bytes |
| `pre-backup-all-containers.txt` | `589` bytes |
| `postgres-smoke.dump` | `161344` bytes |
| `postgres-table-list.txt` | `2070` bytes |
| `storage-smoke.tgz` | `827` bytes |
| `post-backup-running-containers.txt` | `26` bytes |
| `post-backup-all-containers.txt` | `597` bytes |
| `SHA256SUMS.txt` | `742` bytes |

None of these files are committed to this repository.

## Storage Evidence

Owner-provided storage evidence:

| Check | Evidence |
| --- | --- |
| `/srv/pesona-studio` device | `/dev/sdb1` |
| Size | `469G` |
| Available | `445G` |
| Backup directory size | `196K` |

## Checksum Evidence

Owner-provided `sha256sum -c SHA256SUMS.txt` evidence passed for all listed files:

- `baseline-evidence.txt`
- `post-backup-all-containers.txt`
- `post-backup-running-containers.txt`
- `postgres-smoke.dump`
- `postgres-table-list.txt`
- `pre-backup-all-containers.txt`
- `pre-backup-running-containers.txt`
- `storage-smoke.tgz`

Checksum verification is PASS for this controlled smoke backup evidence.

## Storage Archive Readability Evidence

Owner-provided evidence records that `storage-smoke.tgz` was readable and listed expected placeholder storage paths:

- `storage/`
- `storage/brand-assets/`
- `storage/brand-assets/.gitkeep`
- `storage/draft-videos/`
- `storage/draft-videos/.gitkeep`
- `storage/footage/`
- `storage/footage/.gitkeep`
- `storage/README.md`
- `storage/approved-videos/`
- `storage/approved-videos/.gitkeep`
- `storage/mockups/`
- `storage/mockups/.gitkeep`

Backup archive readability is PASS.

## PostgreSQL Dump Listing Evidence

Owner-provided evidence records that `postgres-smoke.dump` was readable using:

```text
docker run --rm -v "$BACKUP_DIR:/backup:ro" postgres:16-alpine pg_restore -l /backup/postgres-smoke.dump
```

Owner-provided dump listing evidence identified:

- Custom dump format.
- Database: `pesona_studio`.
- Dumped from PostgreSQL `16.14`.
- TOC entries: `306`.
- Expected schema/data entries, including:
  - `campaign_plan_generation_batches`
  - `campaigns`
  - `content_items`
  - `content_publications`
  - `footage_assets`
  - `manual_publication_packages`
  - `manual_publish_checklist_items`
  - `video_draft_jobs`
  - `video_render_attempts`
  - `video_render_manifests`
  - related tables

PostgreSQL dump listing readability is PASS.

No restore was performed.

## Warnings

- This backup is smoke-only backup evidence, not production backup evidence.
- Backup files, dump files, archive files, and checksum files must not be committed to Git.
- Restore dry-run remains pending and must be planned in a separate isolated environment.
- Cutover remains blocked.

## Outcome

Controlled smoke backup evidence is PASS.

Checksum verification is PASS. Backup archive readability is PASS. PostgreSQL dump listing readability is PASS.

This evidence does not authorize production backup, restore, restore dry-run, deployment, cutover, storage copy, public exposure, scheduler/publisher/social API activation, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.

## What Was Not Executed By Codex

- No command on Lenovo.
- No new command on the `pesona` server.
- No production backup.
- No restore.
- No restore dry-run execution.
- No deployment.
- No cutover.
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
- No backup file, dump file, archive file, checksum file, env file, secret, `node_modules`, generated media, operational media, or storage artifact committed.

## Next Safe Phase

Next safe phase: restore dry-run planning in a separate isolated environment.

That next step is not cutover. Cutover remains blocked until restore dry-run evidence, owner Go/No-Go, and an explicit cutover approval exist.
