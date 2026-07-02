# First Pilot Backup Evidence

## Purpose

This document records Phase 2H.14 owner-provided first pilot backup evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production backup, restore, restore dry-run, deployment, cutover, storage copy, public exposure, or production operation beyond the owner-run controlled pilot.

## Scope And Non-Goals

In scope:

- Record owner-provided first pilot backup evidence for controlled pilot stack `psd_pilot`.
- Record backup directory, baseline, pilot running state, backup procedure, backup file sizes, checksum verification, archive readability, PostgreSQL dump readability, storage evidence, and policy decision.
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
- Stopping, restarting, or mutating containers by Codex.
- Docker Compose up/down by Codex.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing backup files, dump files, tar archives, checksum files, route evidence files, env files, secrets, `node_modules`, generated media, or storage artifacts.

## Pilot Backup Scope

Owner-provided evidence records:

- Backup was executed for controlled pilot stack `psd_pilot`.
- This is pilot backup evidence.
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
/srv/pesona-studio/backups/psd-pilot-backup-20260702T091559Z
```

Backup artifacts remain on the server backup path only and must not be committed to Git.

## Pilot State Before And After Backup

Owner-provided pilot status before and after backup:

| Container | Status |
| --- | --- |
| `psd_pilot-n8n-1` | Up |
| `psd_pilot-web-app-1` | Up, `0.0.0.0:3400->3000/tcp` |
| `psd_pilot-campaign-planner-worker-1` | Up |
| `psd_pilot-mockup-worker-1` | Up |
| `psd_pilot-video-worker-1` | Up |
| `psd_pilot-postgres-1` | Up healthy, internal `5432/tcp` |
| `psd_pilot-redis-1` | Up healthy, internal `6379/tcp` |

Pilot remained running after backup.

## Backup Procedure Evidence

Owner-provided backup procedure evidence:

- Pilot route check was captured to `pilot-route-check.txt`.
- Postgres readiness check passed: `/var/run/postgresql:5432 - accepting connections`.
- PostgreSQL pilot DB backup was created as `postgres-pilot.dump` using custom dump format.
- Table list evidence was created as `postgres-table-list.txt`.
- Table count evidence was created as `postgres-table-count.txt`.
- Pilot storage archive was created as `storage-pilot.tgz`.
- Checksums were created as `SHA256SUMS.txt`.

## Backup Files And Sizes

Owner-provided backup file listing:

| File | Size |
| --- | ---: |
| `baseline-evidence.txt` | `224` bytes |
| `pilot-route-check.txt` | `1351` bytes |
| `pilot-running-containers.txt` | `592` bytes |
| `postgres-dump-list.txt` | `8219` bytes |
| `postgres-pilot.dump` | `161344` bytes |
| `postgres-readiness.txt` | `49` bytes |
| `postgres-table-count.txt` | `3` bytes |
| `postgres-table-list.txt` | `2070` bytes |
| `SHA256SUMS.txt` | `711` bytes |
| `storage-archive-list.txt` | `273` bytes |
| `storage-pilot.tgz` | `827` bytes |

No backup file, dump file, tar archive, checksum file, route evidence file, or storage artifact is committed to this repository.

## Integrity Checks

Owner-provided `sha256sum -c SHA256SUMS.txt` evidence passed for:

- `baseline-evidence.txt`.
- `pilot-route-check.txt`.
- `pilot-running-containers.txt`.
- `postgres-pilot.dump`.
- `postgres-readiness.txt`.
- `postgres-table-count.txt`.
- `postgres-table-list.txt`.
- `storage-pilot.tgz`.

Checksum verification is PASS.

## Storage Archive Readability

Owner-provided evidence records that `storage-pilot.tgz` was readable and listed:

- `storage/`.
- `storage/brand-assets/`.
- `storage/brand-assets/.gitkeep`.
- `storage/draft-videos/`.
- `storage/draft-videos/.gitkeep`.
- `storage/footage/`.
- `storage/footage/.gitkeep`.
- `storage/README.md`.
- `storage/approved-videos/`.
- `storage/approved-videos/.gitkeep`.
- `storage/mockups/`.
- `storage/mockups/.gitkeep`.

Storage archive readability is PASS.

## PostgreSQL Dump Readability

Owner-provided evidence records that `postgres-pilot.dump` was readable through `pg_restore -l`.

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

PostgreSQL dump readability is PASS.

## Storage Evidence

Owner-provided storage evidence:

| Check | Evidence |
| --- | --- |
| `/srv/pesona-studio` device | `/dev/sdb1` |
| Size | `469G` |
| Available | `445G` |
| Backup directory size | `212K` |

## Policy Decision

- Pilot backup must be taken before pilot data is considered important.
- Manual pilot backup is required before any meaningful real content or test campaign data entry.
- Backup artifacts must stay outside Git.
- Restore dry-run for pilot backup is a separate phase.
- Cutover remains blocked.

## Outcome

First pilot backup evidence is PASS.

Checksum verification is PASS. Storage archive readability is PASS. PostgreSQL dump readability is PASS.

No restore was performed. No restore dry-run was performed. Pilot stack remained running after backup.

This is pilot backup evidence only. It is not production backup and not cutover.

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
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, or storage artifact committed.

## Next Safe Phase

Next safe phase: pilot backup restore dry-run planning in a separate isolated environment, or controlled pilot review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
