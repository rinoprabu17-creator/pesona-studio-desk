# Pilot Post-Review Backup Evidence

## Purpose

This document records Phase 2H.17 owner-provided post-review pilot backup evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production backup, restore, restore dry-run, deployment, cutover, storage copy, public exposure, promotion, handoff, publication package creation, publishing, or production operation beyond the owner-run controlled pilot.

## Scope And Non-Goals

In scope:

- Record owner-provided post-review pilot backup evidence after DB-only controlled draft review approval.
- Record backup directory, backup files and sizes, storage evidence, checksum verification, storage archive readability, PostgreSQL dump readability, and outcome.
- Record that no backup artifact, rendered MP4, or storage artifact is committed to Git.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Production backup.
- Restore or restore dry-run.
- Deployment.
- Cutover.
- Storage copy.
- Public exposure or Cloudflare Tunnel.
- Promotion or approved handoff.
- Manual publication package creation.
- Publishing, scheduler, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- Stopping, restarting, or mutating containers by Codex.
- Docker Compose up/down by Codex.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing backup files, dump files, tar archives, checksum files, route evidence files, env files, secrets, `node_modules`, generated media, rendered MP4s, or storage artifacts.

## Backup Directory

Owner-provided post-review backup directory:

```text
/srv/pesona-studio/backups/psd-pilot-post-review-backup-20260703T084853Z
```

Backup artifacts remain on the server backup path only and must not be committed to Git.

## Backup Files And Sizes

Owner-provided backup artifact evidence:

| File | Size |
| --- | ---: |
| `approved-video-files.txt` | `42` bytes |
| `baseline-evidence.txt` | `224` bytes |
| `draft-video-files.txt` | `135` bytes |
| `latest-render-attempt.txt` | `1142` bytes |
| `latest-render-review.txt` | `970` bytes |
| `pilot-running-containers.txt` | `568` bytes |
| `postgres-dump-list.txt` | `10252` bytes |
| `postgres-pilot-post-review.dump` | `166909` bytes |
| `review-counts.txt` | `306` bytes |
| `route-status.txt` | `79` bytes |
| `SHA256SUMS.txt` | `906` bytes |
| `storage-archive-list.txt` | `471` bytes |
| `storage-pilot-post-review.tgz` | `4002802` bytes |

Backup directory size: `4.1M`.

No backup file, dump file, tar archive, checksum file, route evidence file, rendered MP4, or storage artifact is committed to this repository.

## Storage Evidence

Owner-provided storage evidence:

| Check | Evidence |
| --- | --- |
| `/srv/pesona-studio` size | `469G` |
| `/srv/pesona-studio` available | `445G` |
| `/srv/pesona-studio` used | About `17M` |
| Backup directory size | `4.1M` |

## Integrity Checks

Owner-provided `sha256sum -c SHA256SUMS.txt` evidence passed for:

- `approved-video-files.txt`.
- `baseline-evidence.txt`.
- `draft-video-files.txt`.
- `latest-render-attempt.txt`.
- `latest-render-review.txt`.
- `pilot-running-containers.txt`.
- `postgres-pilot-post-review.dump`.
- `review-counts.txt`.
- `route-status.txt`.
- `storage-pilot-post-review.tgz`.

Post-review checksum validation is PASS.

## Storage Archive Readability

Owner-provided evidence records that `storage-pilot-post-review.tgz` was readable.

Storage archive listing included:

- `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4`.
- `storage/footage/pilot-demo/pilot-sampul-raport-demo-001.mp4`.
- `storage/approved-videos/.gitkeep`.
- No approved render copy.

Post-review storage archive readability is PASS.

## PostgreSQL Dump Readability

Owner-provided evidence records that `postgres-pilot-post-review.dump` was readable through `pg_restore -l`.

Dump details:

- Database: `pesona_studio`.
- TOC entries: `306`.
- Format: `CUSTOM`.
- Dumped from PostgreSQL `16.14`.
- Included expected schema/data entries including:
  - Render attempts.
  - Render reviews.
  - Draft jobs.
  - Content items.
  - Footage assets.
  - Manual publish tables.

Post-review DB dump readability is PASS.

No restore was performed.

## Outcome

Post-review backup is PASS.

Post-review checksum validation is PASS. Post-review DB dump readability is PASS. Post-review storage archive readability is PASS.

Pilot remained running.

This is post-review pilot backup evidence only. It is not production backup and not cutover.

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
- No promotion.
- No approved handoff.
- No manual publication package creation.
- No publishing, scheduler, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, rendered MP4, or storage artifact committed.

## Next Safe Phase

Next safe phase: post-review backup restore dry-run planning in a separate isolated environment, controlled approved-video promotion evidence, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
