# Pilot Phase 2I.10 Multi-Channel Content-Prep Smoke Backup Evidence

## Purpose

This document records Phase 2I.10 owner-provided multi-channel content-prep checklist smoke backup evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production backup, restore, restore dry-run, deployment, cutover, storage copy by Codex, public exposure, closeout, evidence log creation, account-login checklist completion, publish-proof checklist completion, actual publishing, scheduler/publisher automation, OpenAI live runtime, or production operation beyond the owner-run controlled pilot.

## Backup Directory

Owner-provided backup directory:

```text
/srv/pesona-studio/backups/psd-pilot-phase-2i10-multi-channel-content-prep-smoke-backup-20260707T034049Z
```

Backup timestamp UTC: `2026-07-07T03:40:50Z`.

Backup artifacts remain on the server backup path only and must not be committed to Git.

## Backup Files And Sizes

| File | Size |
| --- | ---: |
| `approved-video-files.txt` | `201` bytes |
| `checklist-summary.txt` | `336` bytes |
| `evidence-log-summary.txt` | `220` bytes |
| `manual-publish-closeouts.txt` | `10` bytes |
| `manual-publish-evidence-logs.txt` | `2167` bytes |
| `multi-channel-checklist-focus-items.txt` | `34240` bytes |
| `multi-channel-content-prep-smoke-assessment.txt` | `612` bytes |
| `package-runtime-status.txt` | `386` bytes |
| `pilot-running-containers.txt` | `592` bytes |
| `postgres-dump-list.txt` | `13329` bytes |
| `postgres-pilot-phase-2i10-multi-channel-content-prep-smoke.dump` | `170917` bytes |
| `route-status.txt` | `240` bytes |
| `runtime-baseline.txt` | `263` bytes |
| `runtime-db-counts.txt` | `327` bytes |
| `SHA256SUMS.txt` | `1568` bytes |
| `storage-archive-list.txt` | `647` bytes |
| `storage-pilot-phase-2i10-multi-channel-content-prep-smoke.tgz` | `5952185` bytes |

Backup directory size: `6.0M`.

No backup file, dump file, tar archive, checksum file, route evidence file, rendered MP4, or storage artifact is committed to this repository.

## Storage Evidence

| Check | Evidence |
| --- | --- |
| `/srv/pesona-studio` size | `469G` |
| `/srv/pesona-studio` used | `85M` |
| `/srv/pesona-studio` available | `445G` |
| Backup directory size | `6.0M` |

## Integrity Checks

Owner-provided `sha256sum -c SHA256SUMS.txt` evidence passed for all listed evidence, dump, and archive files:

- `approved-video-files.txt`.
- `checklist-summary.txt`.
- `evidence-log-summary.txt`.
- `manual-publish-closeouts.txt`.
- `manual-publish-evidence-logs.txt`.
- `multi-channel-checklist-focus-items.txt`.
- `multi-channel-content-prep-smoke-assessment.txt`.
- `package-runtime-status.txt`.
- `pilot-running-containers.txt`.
- `postgres-dump-list.txt`.
- `postgres-pilot-phase-2i10-multi-channel-content-prep-smoke.dump`.
- `route-status.txt`.
- `runtime-baseline.txt`.
- `runtime-db-counts.txt`.
- `storage-archive-list.txt`.
- `storage-pilot-phase-2i10-multi-channel-content-prep-smoke.tgz`.

Checksum validation is PASS.

## Storage Archive Readability

Owner-provided evidence records that `storage-pilot-phase-2i10-multi-channel-content-prep-smoke.tgz` was readable.

Storage archive listing included:

- Source demo footage.
- Draft render.
- Approved video:
  `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`.

Storage archive readability is PASS.

## PostgreSQL Dump Readability

Owner-provided evidence records that `postgres-pilot-phase-2i10-multi-channel-content-prep-smoke.dump` was readable through `pg_restore -l`.

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

## Runtime State Captured By Backup Evidence

- Runtime server remained at `phase-2i4-complete`.
- Pilot containers remained running.
- Route checks returned HTTP 200.
- Runtime DB counts remained `manual_publication_packages = 1`, `manual_publication_package_channels = 4`, `manual_publish_checklist_items = 32`, `manual_publish_evidence_logs = 2`, and `manual_publish_closeouts = 0`.
- Checklist summary was `20` done and `12` pending.
- All four channels were `5` done and `3` pending.
- Evidence log count stayed unchanged at `2`.
- Existing blank YouTube `admin_note` anomaly remained unchanged.
- No closeout was created.
- No actual publishing occurred.

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
- No account-login checklist completion.
- No publish-proof checklist completion.
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

## Outcome

Backup is PASS. Checksum validation is PASS. DB dump readability is PASS. Storage archive readability is PASS.

Pilot remained running per owner evidence. Closeout remains blocked. Cutover remains blocked.
