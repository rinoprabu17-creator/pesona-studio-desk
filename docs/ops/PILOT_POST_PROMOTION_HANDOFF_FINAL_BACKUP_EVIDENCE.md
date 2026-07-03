# Pilot Post-Promotion Handoff Final Backup Evidence

## Purpose

This document records Phase 2H.18 owner-provided final post-promotion-handoff pilot backup evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production backup, restore, restore dry-run, deployment, cutover, storage copy by Codex, public exposure, manual publication package creation, publishing, or production operation beyond the owner-run controlled pilot.

## Scope And Non-Goals

In scope:

- Record owner-provided final post-promotion-handoff backup evidence.
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
- Manual publication package creation.
- Publishing, scheduler, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- Stopping, restarting, or mutating containers by Codex.
- Docker Compose up/down by Codex.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing backup files, dump files, tar archives, checksum files, route evidence files, env files, secrets, `node_modules`, generated media, rendered MP4s, or storage artifacts.

## Backup Directory

Owner-provided final backup directory:

```text
/srv/pesona-studio/backups/psd-pilot-post-promotion-handoff-final-backup-20260703T093157Z
```

Backup artifacts remain on the server backup path only and must not be committed to Git.

## Backup Files And Sizes

Owner-provided backup artifact evidence:

| File | Size |
| --- | ---: |
| `approved-video-files.txt` | `201` bytes |
| `baseline-evidence.txt` | `224` bytes |
| `draft-video-files.txt` | `135` bytes |
| `final-promotion-handoff-counts.txt` | `306` bytes |
| `latest-approved-handoff.txt` | `1739` bytes |
| `latest-approved-promotion.txt` | `1519` bytes |
| `pilot-running-containers.txt` | `568` bytes |
| `postgres-dump-list.txt` | `11775` bytes |
| `postgres-pilot-post-promotion-handoff-final.dump` | `167720` bytes |
| `route-status.txt` | `79` bytes |
| `SHA256SUMS.txt` | `1144` bytes |
| `storage-archive-list.txt` | `647` bytes |
| `storage-pilot-post-promotion-handoff-final.tgz` | `5952185` bytes |

Backup directory size: `5.9M`.

No backup file, dump file, tar archive, checksum file, route evidence file, rendered MP4, or storage artifact is committed to this repository.

## Storage Evidence

Owner-provided storage evidence:

| Check | Evidence |
| --- | --- |
| `/srv/pesona-studio` size | `469G` |
| `/srv/pesona-studio` used | `31M` |
| `/srv/pesona-studio` available | `445G` |
| Backup directory size | `5.9M` |

## Integrity Checks

Owner-provided `sha256sum -c SHA256SUMS.txt` evidence passed for:

- `approved-video-files.txt`.
- `baseline-evidence.txt`.
- `draft-video-files.txt`.
- `final-promotion-handoff-counts.txt`.
- `latest-approved-handoff.txt`.
- `latest-approved-promotion.txt`.
- `pilot-running-containers.txt`.
- `postgres-dump-list.txt`.
- `postgres-pilot-post-promotion-handoff-final.dump`.
- `route-status.txt`.
- `storage-archive-list.txt`.
- `storage-pilot-post-promotion-handoff-final.tgz`.

Final checksum validation is PASS.

## Storage Archive Readability

Owner-provided evidence records that `storage-pilot-post-promotion-handoff-final.tgz` was readable.

Storage archive listing included:

- Source demo footage:
  `storage/footage/pilot-demo/pilot-sampul-raport-demo-001.mp4`.
- Draft render:
  `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4`.
- Approved video:
  `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`.

Final storage archive readability is PASS.

## PostgreSQL Dump Readability

Owner-provided evidence records that `postgres-pilot-post-promotion-handoff-final.dump` was readable through `pg_restore -l`.

Dump details:

- Database: `pesona_studio`.
- TOC entries: `306`.
- Format: `CUSTOM`.
- Dumped from PostgreSQL `16.14`.
- Included expected schema/data entries including:
  - `video_render_approved_promotions`.
  - `video_approved_handoff_records`.
  - `video_render_attempt_reviews`.
  - `video_render_attempts`.
  - `video_draft_jobs`.
  - `content_items`.
  - `footage_assets`.
  - Manual publication tables.

Final DB dump readability is PASS.

No restore was performed.

## Outcome

Final post-promotion-handoff backup is PASS.

Final checksum validation is PASS. Final DB dump readability is PASS. Final storage archive readability is PASS.

Pilot remained running.

This is final post-promotion-handoff pilot backup evidence only. It is not production backup and not cutover.

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
- No manual publication package creation.
- No publishing, scheduler, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, rendered MP4, or storage artifact committed.

## Next Safe Phase

Next safe phase: manual publication package evidence, final restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
