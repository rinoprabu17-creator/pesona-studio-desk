# Pilot Post-Manual-Evidence-Log Sandbox Backup Evidence

## Purpose

This document records Phase 2H.21 owner-provided post-evidence-log-sandbox pilot backup evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production backup, restore, restore dry-run, deployment, cutover, storage copy by Codex, public exposure, actual social publishing, closeout, scheduler/publisher automation, OpenAI live runtime, or production operation beyond the owner-run controlled pilot.

## Scope And Non-Goals

In scope:

- Record owner-provided post-evidence-log backup evidence.
- Record backup directory, backup files and sizes, storage evidence, checksum verification, storage archive readability, PostgreSQL dump readability, and outcome.
- Record that no backup artifact, rendered MP4, or storage artifact is committed to Git.
- Record that the backup includes the DB-only blank YouTube evidence log anomaly as evidence.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Deleting, fixing, or mutating the blank YouTube evidence log anomaly.
- Production backup.
- Restore or restore dry-run.
- Deployment.
- Cutover.
- Storage copy by Codex.
- Public exposure or Cloudflare Tunnel.
- Actual social publishing.
- Manual closeout creation.
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

Owner-provided post-evidence-log backup directory:

```text
/srv/pesona-studio/backups/psd-pilot-post-manual-evidence-log-sandbox-backup-20260704T060835Z
```

Backup artifacts remain on the server backup path only and must not be committed to Git.

## Backup Files And Sizes

Owner-provided backup artifact evidence:

| File | Size |
| --- | ---: |
| `approved-video-files.txt` | `201` bytes |
| `baseline-evidence.txt` | `224` bytes |
| `checklist-summary-by-channel.txt` | `336` bytes |
| `evidence-log-sandbox-counts.txt` | `327` bytes |
| `evidence-log-summary.txt` | `220` bytes |
| `latest-package-status.txt` | `386` bytes |
| `manual-publish-closeouts.txt` | `10` bytes |
| `manual-publish-evidence-logs.txt` | `2167` bytes |
| `pilot-running-containers.txt` | `616` bytes |
| `postgres-dump-list.txt` | `13329` bytes |
| `postgres-pilot-post-manual-evidence-log-sandbox.dump` | `170352` bytes |
| `route-status.txt` | `95` bytes |
| `SHA256SUMS.txt` | `1347` bytes |
| `storage-archive-list.txt` | `647` bytes |
| `storage-pilot-post-manual-evidence-log-sandbox.tgz` | `5952185` bytes |

Backup directory size: `6.0M`.

No backup file, dump file, tar archive, checksum file, route evidence file, rendered MP4, or storage artifact is committed to this repository.

## Storage Evidence

Owner-provided storage evidence:

| Check | Evidence |
| --- | --- |
| `/srv/pesona-studio` size | `469G` |
| `/srv/pesona-studio` used | `49M` |
| `/srv/pesona-studio` available | `445G` |
| Backup directory size | `6.0M` |

## Integrity Checks

Owner-provided `sha256sum -c SHA256SUMS.txt` evidence passed for:

- `approved-video-files.txt`.
- `baseline-evidence.txt`.
- `checklist-summary-by-channel.txt`.
- `evidence-log-sandbox-counts.txt`.
- `evidence-log-summary.txt`.
- `latest-package-status.txt`.
- `manual-publish-closeouts.txt`.
- `manual-publish-evidence-logs.txt`.
- `pilot-running-containers.txt`.
- `postgres-dump-list.txt`.
- `postgres-pilot-post-manual-evidence-log-sandbox.dump`.
- `route-status.txt`.
- `storage-archive-list.txt`.
- `storage-pilot-post-manual-evidence-log-sandbox.tgz`.

Post-evidence-log checksum validation is PASS.

## Storage Archive Readability

Owner-provided evidence records that `storage-pilot-post-manual-evidence-log-sandbox.tgz` was readable.

Storage archive listing included:

- Source demo footage:
  `storage/footage/pilot-demo/pilot-sampul-raport-demo-001.mp4`.
- Draft render:
  `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4`.
- Approved video:
  `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`.

Post-evidence-log storage archive readability is PASS.

## PostgreSQL Dump Readability

Owner-provided evidence records that `postgres-pilot-post-manual-evidence-log-sandbox.dump` was readable through `pg_restore -l`.

Dump details:

- Database: `pesona_studio`.
- TOC entries: `306`.
- Format: `CUSTOM`.
- Dumped from PostgreSQL `16.14`.
- Included expected schema/data entries such as:
  - `manual_publish_evidence_logs`.
  - `manual_publish_closeouts`.
  - `manual_publish_checklist_items`.
  - `manual_publication_packages`.
  - `manual_publication_package_channels`.
  - `video_approved_handoff_records`.
  - `video_render_approved_promotions`.
  - `video_render_attempts`.
  - `video_draft_jobs`.
  - `content_items`.
  - `footage_assets`.

Post-evidence-log DB dump readability is PASS.

No restore was performed.

## Outcome

Post-evidence-log backup is PASS.

Checksum validation is PASS. DB dump readability is PASS. Storage archive readability is PASS.

Pilot remained running.

This is post-evidence-log-sandbox pilot backup evidence only. It is not production backup and not cutover.

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
- No deletion, fix, or mutation of the blank YouTube evidence log anomaly.
- No closeout creation.
- No actual publishing.
- No social API.
- No scheduler.
- No OpenAI live runtime.
- No queue expansion or worker daemon expansion.
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, rendered MP4, or storage artifact committed.

## Next Safe Phase

Next safe phase: manual publish closeout evidence, final restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
