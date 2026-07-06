# Pilot Phase 2I.6 Manual Checklist Update Smoke Backup Evidence

## Purpose

This document records Phase 2I.6 owner-provided manual checklist update smoke backup evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production backup, restore, restore dry-run, deployment, cutover, storage copy by Codex, public exposure, closeout, evidence log creation, additional checklist completion, actual publishing, scheduler/publisher automation, OpenAI live runtime, or production operation beyond the owner-run controlled pilot.

## Scope And Non-Goals

In scope:

- Record owner-provided Phase 2I.6 manual checklist update smoke backup evidence.
- Record backup directory, backup files and sizes, storage evidence, checksum verification, storage archive readability, PostgreSQL dump readability, and outcome.
- Record that no backup artifact, rendered MP4, or storage artifact is committed to Git.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Creating evidence logs, additional checklist completions, closeout, real publish URL, or publish timestamp.
- Deleting, fixing, hiding, or mutating the blank YouTube evidence log anomaly.
- Production backup.
- Restore or restore dry-run.
- Deployment.
- Cutover.
- Storage copy by Codex.
- Public exposure or Cloudflare Tunnel.
- Actual publishing.
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

Owner-provided backup directory:

```text
/srv/pesona-studio/backups/psd-pilot-phase-2i6-manual-checklist-update-smoke-backup-20260706T052108Z
```

Backup artifacts remain on the server backup path only and must not be committed to Git.

## Backup Files And Sizes

Owner-provided backup artifact evidence:

| File | Size |
| --- | ---: |
| `approved-video-files.txt` | `201` bytes |
| `checklist-summary.txt` | `336` bytes |
| `checklist-update-smoke-assessment.txt` | `391` bytes |
| `evidence-log-summary.txt` | `220` bytes |
| `manual-publish-closeouts.txt` | `10` bytes |
| `manual-publish-evidence-logs.txt` | `2167` bytes |
| `package-runtime-status.txt` | `386` bytes |
| `pilot-running-containers.txt` | `568` bytes |
| `postgres-dump-list.txt` | `13329` bytes |
| `postgres-pilot-phase-2i6-manual-checklist-update-smoke.dump` | `170542` bytes |
| `route-status.txt` | `240` bytes |
| `runtime-baseline.txt` | `263` bytes |
| `runtime-db-counts.txt` | `327` bytes |
| `SHA256SUMS.txt` | `1537` bytes |
| `storage-archive-list.txt` | `647` bytes |
| `storage-pilot-phase-2i6-manual-checklist-update-smoke.tgz` | `5952185` bytes |
| `updated-checklist-item.txt` | `1161` bytes |

Backup directory size: `6.0M`.

No backup file, dump file, tar archive, checksum file, route evidence file, rendered MP4, or storage artifact is committed to this repository.

## Storage Evidence

Owner-provided storage evidence:

| Check | Evidence |
| --- | --- |
| `/srv/pesona-studio` size | `469G` |
| `/srv/pesona-studio` used | `73M` |
| `/srv/pesona-studio` available | `445G` |
| Backup directory size | `6.0M` |

## Integrity Checks

Owner-provided `sha256sum -c SHA256SUMS.txt` evidence passed for all listed evidence, dump, and archive files:

- `approved-video-files.txt`.
- `checklist-summary.txt`.
- `checklist-update-smoke-assessment.txt`.
- `evidence-log-summary.txt`.
- `manual-publish-closeouts.txt`.
- `manual-publish-evidence-logs.txt`.
- `package-runtime-status.txt`.
- `pilot-running-containers.txt`.
- `postgres-dump-list.txt`.
- `postgres-pilot-phase-2i6-manual-checklist-update-smoke.dump`.
- `route-status.txt`.
- `runtime-baseline.txt`.
- `runtime-db-counts.txt`.
- `storage-archive-list.txt`.
- `storage-pilot-phase-2i6-manual-checklist-update-smoke.tgz`.
- `updated-checklist-item.txt`.

Checksum validation is PASS.

## Storage Archive Readability

Owner-provided evidence records that `storage-pilot-phase-2i6-manual-checklist-update-smoke.tgz` was readable.

Storage archive listing included:

- Source demo footage.
- Draft render.
- Approved video:
  `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`.

Storage archive readability is PASS.

## PostgreSQL Dump Readability

Owner-provided evidence records that `postgres-pilot-phase-2i6-manual-checklist-update-smoke.dump` was readable through `pg_restore -l`.

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

DB dump readability is PASS.

No restore was performed.

## Outcome

Backup is PASS.

Checksum validation is PASS. DB dump readability is PASS. Storage archive readability is PASS.

Pilot remained running per owner evidence.

This is Phase 2I.6 manual checklist update smoke backup evidence only. It is not production backup and not cutover.

Cutover remains blocked.

## What Was Not Executed By Codex

- No command on Lenovo.
- No command on the `pesona` server.
- No production backup.
- No restore.
- No restore dry-run.
- No deployment.
- No cutover.
- No public exposure.
- No Cloudflare Tunnel.
- No storage copy by Codex.
- No deletion, fix, hiding, or mutation of the blank YouTube evidence log anomaly.
- No evidence log creation.
- No additional checklist completion.
- No closeout creation.
- No real publish URL creation.
- No publish timestamp creation.
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

Next safe phase: continue controlled manual checklist update smoke only if owner approves, real manual publish proof evidence after actual manual posting, manual publish closeout evidence after readiness gaps are closed, or pilot backup restore dry-run planning in a separate isolated environment.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
