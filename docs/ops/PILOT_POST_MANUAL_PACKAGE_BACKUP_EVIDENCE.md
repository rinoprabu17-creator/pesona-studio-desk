# Pilot Post-Manual-Package Backup Evidence

## Purpose

This document records Phase 2H.19 owner-provided post-manual-package pilot backup evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production backup, restore, restore dry-run, deployment, cutover, storage copy by Codex, public exposure, actual social publishing, scheduler/publisher automation, OpenAI live runtime, or production operation beyond the owner-run controlled pilot.

## Scope And Non-Goals

In scope:

- Record owner-provided post-manual-package backup evidence.
- Record backup directory, backup files and sizes, storage evidence, checksum verification, storage archive readability, PostgreSQL dump readability, and outcome.
- Record that no backup artifact, rendered MP4, or storage artifact is committed to Git.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Production backup.
- Restore or restore dry-run.
- Deployment.
- Cutover.
- Storage copy by Codex.
- Public exposure or Cloudflare Tunnel.
- Actual social publishing.
- Scheduler/publisher automation.
- Social API activation.
- Upload automation.
- OpenAI live runtime.
- Queue expansion or worker daemon expansion.
- Stopping, restarting, or mutating containers by Codex.
- Docker Compose up/down by Codex.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing backup files, dump files, tar archives, checksum files, route evidence files, env files, secrets, `node_modules`, generated media, rendered MP4s, or storage artifacts.

## Backup Directory

Owner-provided post-manual-package backup directory:

```text
/srv/pesona-studio/backups/psd-pilot-post-manual-package-backup-20260704T045148Z
```

Backup artifacts remain on the server backup path only and must not be committed to Git.

## Backup Files And Sizes

Owner-provided backup artifact evidence:

| File | Size |
| --- | ---: |
| `approved-video-files.txt` | `201` bytes |
| `baseline-evidence.txt` | `224` bytes |
| `draft-video-files.txt` | `135` bytes |
| `latest-manual-publication-package.txt` | `2215` bytes |
| `manual-package-channels.txt` | `2143` bytes |
| `manual-package-counts.txt` | `417` bytes |
| `pilot-running-containers.txt` | `592` bytes |
| `postgres-dump-list.txt` | `13329` bytes |
| `postgres-pilot-post-manual-package.dump` | `168615` bytes |
| `route-status.txt` | `116` bytes |
| `SHA256SUMS.txt` | `1125` bytes |
| `storage-archive-list.txt` | `647` bytes |
| `storage-pilot-post-manual-package.tgz` | `5952185` bytes |

Backup directory size: `6.0M`.

No backup file, dump file, tar archive, checksum file, route evidence file, rendered MP4, or storage artifact is committed to this repository.

## Storage Evidence

Owner-provided storage evidence:

| Check | Evidence |
| --- | --- |
| `/srv/pesona-studio` size | `469G` |
| `/srv/pesona-studio` used | `37M` |
| `/srv/pesona-studio` available | `445G` |
| Backup directory size | `6.0M` |

## Integrity Checks

Owner-provided `sha256sum -c SHA256SUMS.txt` evidence passed for:

- `approved-video-files.txt`.
- `baseline-evidence.txt`.
- `draft-video-files.txt`.
- `latest-manual-publication-package.txt`.
- `manual-package-channels.txt`.
- `manual-package-counts.txt`.
- `pilot-running-containers.txt`.
- `postgres-dump-list.txt`.
- `postgres-pilot-post-manual-package.dump`.
- `route-status.txt`.
- `storage-archive-list.txt`.
- `storage-pilot-post-manual-package.tgz`.

Post-package checksum validation is PASS.

## Storage Archive Readability

Owner-provided evidence records that `storage-pilot-post-manual-package.tgz` was readable.

Storage archive listing included:

- Source demo footage:
  `storage/footage/pilot-demo/pilot-sampul-raport-demo-001.mp4`.
- Draft render:
  `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4`.
- Approved video:
  `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`.

Post-package storage archive readability is PASS.

## PostgreSQL Dump Readability

Owner-provided evidence records that `postgres-pilot-post-manual-package.dump` was readable through `pg_restore -l`.

Dump details:

- Database: `pesona_studio`.
- TOC entries: `306`.
- Format: `CUSTOM`.
- Dumped from PostgreSQL `16.14`.
- Included expected schema/data entries including:
  - `manual_publication_packages`.
  - `manual_publication_package_channels`.
  - `manual_publish_checklist_items`.
  - `manual_publish_evidence_logs`.
  - `manual_publish_closeouts`.
  - `video_approved_handoff_records`.
  - `video_render_approved_promotions`.
  - `video_render_attempts`.
  - `video_draft_jobs`.
  - `content_items`.
  - `footage_assets`.

Post-package DB dump readability is PASS.

No restore was performed.

## Outcome

Post-package backup is PASS.

Checksum validation is PASS. DB dump readability is PASS. Storage archive readability is PASS.

Pilot remained running.

This is post-manual-package pilot backup evidence only. It is not production backup and not cutover.

Cutover remains blocked.

## What Was Not Executed By Codex

- No command on Lenovo.
- No new command on the `pesona` server.
- No production backup.
- No restore.
- No restore dry-run.
- No deployment.
- No cutover.
- No public exposure.
- No Cloudflare Tunnel.
- No storage copy by Codex.
- No actual publishing.
- No social API.
- No scheduler.
- No OpenAI live runtime.
- No queue expansion or worker daemon expansion.
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No manual publish evidence log creation.
- No closeout creation.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, rendered MP4, or storage artifact committed.

## Next Safe Phase

Next safe phase: manual publish evidence log evidence, manual publish closeout evidence, final restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
