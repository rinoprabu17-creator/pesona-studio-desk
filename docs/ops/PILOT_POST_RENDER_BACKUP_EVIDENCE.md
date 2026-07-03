# Pilot Post-Render Backup Evidence

## Purpose

This document records Phase 2H.16 owner-provided post-render pilot backup evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production backup, restore, restore dry-run, deployment, cutover, storage copy, public exposure, approval/promotion, publishing, or production operation beyond the owner-run controlled pilot.

## Scope And Non-Goals

In scope:

- Record owner-provided post-render pilot backup evidence after controlled demo render.
- Record successful backup directory, backup files and sizes, checksum verification, storage archive readability, PostgreSQL dump readability, and outcome.
- Record the failed partial backup warning caused by a wrong query column.
- Record that no backup artifact, rendered MP4, or storage artifact is committed to Git.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Production backup.
- Restore or restore dry-run.
- Deployment.
- Cutover.
- Storage copy.
- Public exposure or Cloudflare Tunnel.
- Approval/promotion.
- Manual publish package creation.
- Publishing, scheduler, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- Stopping, restarting, or mutating containers by Codex.
- Docker Compose up/down by Codex.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing backup files, dump files, tar archives, checksum files, route evidence files, env files, secrets, `node_modules`, generated media, rendered MP4s, or storage artifacts.

## Failed Partial Backup Warning

Owner-provided evidence records that the first attempted post-render backup failed because a query used the wrong column name `status`; the actual column is `attempt_status`.

This was corrected. The failed partial folder should be treated as partial evidence only and must not be committed to Git.

This warning is not a render failure and not a successful backup.

## Successful Backup Directory

Owner-provided successful post-render backup directory:

```text
/srv/pesona-studio/backups/psd-pilot-post-render-backup-20260703T081638Z
```

Backup artifacts remain on the server backup path only and must not be committed to Git.

## Backup Files And Sizes

Owner-provided backup artifact evidence:

| File | Size |
| --- | ---: |
| `baseline-evidence.txt` | `224` bytes |
| `draft-video-files.txt` | `135` bytes |
| `latest-render-attempt.txt` | `1142` bytes |
| `pilot-running-containers.txt` | `568` bytes |
| `postgres-dump-list.txt` | `10252` bytes |
| `postgres-pilot-post-render.dump` | `166579` bytes |
| `render-counts.txt` | `372` bytes |
| `route-status.txt` | `79` bytes |
| `SHA256SUMS.txt` | `724` bytes |
| `storage-archive-list.txt` | `471` bytes |
| `storage-pilot-post-render.tgz` | `4002802` bytes |

Backup directory size: `4.1M`.

No backup file, dump file, tar archive, checksum file, route evidence file, rendered MP4, or storage artifact is committed to this repository.

## Integrity Checks

Owner-provided `sha256sum -c SHA256SUMS.txt` evidence passed for:

- `baseline-evidence.txt`.
- `draft-video-files.txt`.
- `latest-render-attempt.txt`.
- `pilot-running-containers.txt`.
- `postgres-pilot-post-render.dump`.
- `render-counts.txt`.
- `route-status.txt`.
- `storage-pilot-post-render.tgz`.

Post-render checksum validation is PASS.

## Storage Archive Readability

Owner-provided evidence records that `storage-pilot-post-render.tgz` was readable.

Storage archive listing included both:

- Source demo footage:
  `storage/footage/pilot-demo/pilot-sampul-raport-demo-001.mp4`.
- Rendered draft video:
  `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4`.

Post-render storage archive readability is PASS.

## PostgreSQL Dump Readability

Owner-provided evidence records that `postgres-pilot-post-render.dump` was readable through `pg_restore -l`.

Dump details:

- Database: `pesona_studio`.
- TOC entries: `306`.
- Format: `CUSTOM`.
- Dumped from PostgreSQL `16.14`.
- Included expected schema/data entries such as:
  - `campaigns`.
  - `content_items`.
  - `footage_assets`.
  - `video_draft_jobs`.
  - `video_render_manifests`.
  - `video_render_attempts`.
  - `video_render_preflight_runs`.
  - Manual publish tables.
  - Related constraints.

Post-render DB dump readability is PASS.

No restore was performed.

## Outcome

Post-render backup is PASS.

Post-render checksum validation is PASS. Post-render DB dump readability is PASS. Post-render storage archive readability is PASS.

Pilot remained running.

This is post-render pilot backup evidence only. It is not production backup and not cutover.

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
- No approval/promotion.
- No manual publish package creation.
- No publishing, scheduler, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, rendered MP4, or storage artifact committed.

## Next Safe Phase

Next safe phase: post-render backup restore dry-run planning in a separate isolated environment, controlled approval/promotion evidence, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
