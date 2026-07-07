# Pilot Phase 2I.12 Account-Login Readiness Smoke Backup Evidence

Phase: 2I.12
Evidence type: owner-provided post-update backup evidence
Runtime server: `pesona`
Pilot project: `psd_pilot`

## Scope

This document records the owner-provided post-update backup evidence after the controlled account-login readiness smoke. It records backup file inventory, integrity checks, dump readability, storage archive readability, and the runtime state captured by the backup.

Codex did not run the backup, did not run restore, did not run restore dry-run, did not perform storage copy, did not run commands on `pesona`, did not run Docker Compose up/down, and did not mutate containers.

## Runtime Baseline

- Server: `pesona`
- Repo path: `/srv/pesona-studio/repos/pesona-studio-desk`
- Pilot project: `psd_pilot`
- Web port: `3400`
- Runtime Git head: `8f675052be9cb97c1d70e685a04bedbc73d912ec`
- Runtime tag: `phase-2i4-complete`
- Backup timestamp UTC: `2026-07-07T04:17:30Z`
- Backup directory: `/srv/pesona-studio/backups/psd-pilot-phase-2i12-account-login-readiness-smoke-backup-20260707T041730Z`
- Runtime git status short: `0`

## Backup File Inventory

Owner evidence listed these files in the backup directory:

| File | Size |
| --- | ---: |
| `account-login-and-publish-proof-focus-items.txt` | 12599 bytes |
| `account-login-readiness-smoke-assessment.txt` | 581 bytes |
| `approved-video-files.txt` | 201 bytes |
| `checklist-summary.txt` | 336 bytes |
| `evidence-log-summary.txt` | 220 bytes |
| `manual-publish-closeouts.txt` | 10 bytes |
| `manual-publish-evidence-logs.txt` | 2167 bytes |
| `package-runtime-status.txt` | 386 bytes |
| `pilot-running-containers.txt` | 592 bytes |
| `postgres-dump-list.txt` | 13329 bytes |
| `postgres-pilot-phase-2i12-account-login-readiness-smoke.dump` | 171101 bytes |
| `route-status.txt` | 240 bytes |
| `runtime-baseline.txt` | 263 bytes |
| `runtime-db-counts.txt` | 327 bytes |
| `SHA256SUMS.txt` | 1567 bytes |
| `storage-archive-list.txt` | 647 bytes |
| `storage-pilot-phase-2i12-account-login-readiness-smoke.tgz` | 5952185 bytes |

Backup directory size: `6.0M`

`/srv/pesona-studio` storage evidence:

- Size: `469G`
- Used: `91M`
- Available: `445G`

## Backup Integrity

- `sha256sum -c SHA256SUMS.txt` passed for all listed evidence, dump, and archive files.
- PostgreSQL dump was readable through `pg_restore -l`.
- Storage archive was readable.
- No restore was performed.

Dump details:

- Database: `pesona_studio`
- TOC entries: `306`
- Format: `CUSTOM`
- Dumped from PostgreSQL `16.14`
- Expected schema/data entries included `manual_publish_evidence_logs`, `manual_publish_closeouts`, `manual_publish_checklist_items`, `manual_publication_packages`, `manual_publication_package_channels`, `video_approved_handoff_records`, `video_render_approved_promotions`, `video_render_attempts`, `video_draft_jobs`, `content_items`, and `footage_assets`.

## Captured Runtime State

- Validation string: `24|8|2|0|ready_manual_publish|`
- `account_login_ready_ok=ok`
- `channel_distribution_ok=ok`
- `publish_proof_blocked_ok=ok`
- `secret_note_scan_ok=ok`
- Facebook checklist state: `6` done / `2` pending
- Instagram checklist state: `6` done / `2` pending
- TikTok checklist state: `6` done / `2` pending
- YouTube checklist state: `6` done / `2` pending
- Total checklist state: `24` done / `8` pending
- Evidence log count: `2`
- Closeout count: `0`
- Package status: `ready_manual_publish`
- `published_manually_at`: empty
- `manual_post_created` remained pending for all channels.
- `manual_url_recorded` remained pending for all channels.
- Existing blank YouTube `admin_note` anomaly remained visible and unchanged.

## File And Storage Evidence

- Approved video file: `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`
- Size: `1950179` bytes
- Storage archive included source demo footage, draft render, and approved video.

This repository phase records backup evidence only. It does not commit backup files, dump files, tar archives, checksum files, route evidence files, env files, secrets, node_modules, generated media, rendered MP4s, or storage artifacts.

## Outcome

- Backup: PASS.
- Checksum validation: PASS.
- DB dump readability: PASS.
- Storage archive readability: PASS.
- Controlled account-login readiness smoke evidence was captured after validation: PASS.
- No restore was performed.
- No production backup was run by Codex.
- Pilot remained running per owner evidence.

## Non-Goals And Safety Notes

This evidence does not authorize actual posting, upload, publish-proof checklist completion, evidence log creation, closeout creation, social API activation, scheduler/publisher automation, OpenAI live runtime, public exposure, or cutover.

The backup evidence includes only non-secret summaries. Passwords, tokens, cookies, sessions, recovery codes, phone numbers, account-sensitive screenshots, and credential records must not be captured in docs, logs, prompts, screenshots, or evidence files.
