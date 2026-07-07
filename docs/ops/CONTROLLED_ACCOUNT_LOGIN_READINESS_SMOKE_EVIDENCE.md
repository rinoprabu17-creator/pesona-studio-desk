# Controlled Account-Login Readiness Smoke Evidence

Phase: 2I.12
Evidence type: owner-provided runtime account-login readiness smoke evidence
Runtime server: `pesona`
Pilot project: `psd_pilot`
Runtime tag: `phase-2i4-complete`

## Scope

This document records controlled account-login readiness smoke evidence for the pilot manual publish checklist. The owner manually confirmed human account access readiness for Facebook, Instagram, TikTok, and YouTube, then recorded the resulting runtime evidence and backup evidence.

This phase is not actual publishing, not upload, not evidence log creation, not `manual_post_created`, not `manual_url_recorded`, not closeout, not scheduler/publisher automation, not OpenAI live runtime, not public exposure, and not cutover. It must not include passwords, tokens, cookies, sessions, recovery codes, phone numbers, account-sensitive screenshots, or any credential record.

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

Codex did not run commands on `pesona`, did not run commands on Lenovo, did not deploy, did not run backup, did not run restore or restore dry-run, did not perform storage copy, did not run Docker Compose up/down, and did not mutate containers.

## Validation Gate

Validation string:

```text
24|8|2|0|ready_manual_publish|
```

Gate markers:

- `account_login_ready_ok=ok`
- `channel_distribution_ok=ok`
- `publish_proof_blocked_ok=ok`
- `secret_note_scan_ok=ok`

Meaning:

- Checklist done count: `24`
- Checklist pending count: `8`
- Evidence log count: `2`
- Closeout count: `0`
- Package status: `ready_manual_publish`
- `published_manually_at`: empty
- Each channel has exactly `6` done items.
- `account_login_ready` is done for all four channels.
- `manual_post_created` and `manual_url_recorded` remain pending for all four channels.
- Account-login notes use the approved non-secret safety sentence.
- Credential-like terms appear only inside the approved safety sentence, and no credential was captured.

## Updated Account-Login Readiness Items

| Channel | Checklist key | Checked by | Checked at |
| --- | --- | --- | --- |
| Facebook | `account_login_ready` | `Rino` | `2026-07-07 04:15:51.876865+00` |
| Instagram | `account_login_ready` | `Rino` | `2026-07-07 04:16:01.266627+00` |
| TikTok | `account_login_ready` | `Rino` | `2026-07-07 04:16:12.275245+00` |
| YouTube | `account_login_ready` | `Rino` | `2026-07-07 04:16:27.658222+00` |

Shared checklist note:

```text
CONTROLLED ACCOUNT-LOGIN READINESS SMOKE - PILOT ONLY. Human operator confirmed manual account access readiness for this channel. No credentials captured, no password/token/cookie/session stored, no upload, no publish, no URL, no schedule, no evidence log, no closeout.
```

## Current Checklist Summary

| Channel | Total | Done | Pending |
| --- | ---: | ---: | ---: |
| Facebook | 8 | 6 | 2 |
| Instagram | 8 | 6 | 2 |
| TikTok | 8 | 6 | 2 |
| YouTube | 8 | 6 | 2 |
| Total | 32 | 24 | 8 |

## Remaining Blocked Items

- `manual_post_created` remains pending for Facebook, Instagram, TikTok, and YouTube.
- `manual_url_recorded` remains pending for Facebook, Instagram, TikTok, and YouTube.
- These items were not touched in this phase.
- These items remain blocked until real manual posting and valid URL evidence are explicitly approved.

## Runtime Route Evidence

Owner-provided route checks returned HTTP 200:

- `/health`
- `/publication-packages`
- `/publication-packages/ca5a591f-fdf1-4b8c-bb61-9295c186a7be/checklist`
- `/publication-packages/ca5a591f-fdf1-4b8c-bb61-9295c186a7be/closeout`
- `/manual-publish-report`
- `/manual-publish-closeouts`

## Runtime Container Evidence

Owner evidence says pilot containers remained running:

- `psd_pilot-web-app-1` on `0.0.0.0:3400->3000`
- `psd_pilot-n8n-1`
- `psd_pilot-campaign-planner-worker-1`
- `psd_pilot-mockup-worker-1`
- `psd_pilot-video-worker-1`
- `psd_pilot-postgres-1` healthy
- `psd_pilot-redis-1` healthy

## Runtime DB Counts

- `manual_publication_packages = 1`
- `manual_publication_package_channels = 4`
- `manual_publish_checklist_items = 32`
- `manual_publish_evidence_logs = 2`
- `manual_publish_closeouts = 0`

## Package Runtime Status

- Package ID: `ca5a591f-fdf1-4b8c-bb61-9295c186a7be`
- Package status: `ready_manual_publish`
- Package title: `PILOT-DESAIN-GRATIS-01-D01 - Manual Package Smoke`
- `ready_at`: `2026-07-04 05:29:44.13736+00`
- `published_manually_at`: empty
- Updated at: `2026-07-04 05:29:44.13736+00`

## Evidence Log State

Summary:

- `facebook` / `admin_note`: total logs `1`, blank logs `0`
- `youtube` / `admin_note`: total logs `1`, blank logs `1`
- Existing blank YouTube `admin_note` anomaly remains visible and unchanged.
- No new evidence log was created.

Records:

- Intended Facebook admin note:
  - ID: `cd2bba56-ea9e-4035-a24d-4a70c4a8479f`
  - Evidence value: `PILOT_SMOKE_NO_PUBLISH`
  - Recorded by: `Rino`
  - Recorded at: `2026-07-04 06:06:45.943161+00`
- Blank YouTube admin note anomaly:
  - ID: `0b4b5ff2-c994-46d9-8f1c-e5c6743a336c`
  - Evidence type: `admin_note`
  - Evidence value: empty
  - Evidence note: empty
  - Recorded by: empty
  - Recorded at: `2026-07-04 06:04:04.545927+00`
  - Assessment: existing harmless DB-only anomaly, unchanged by this phase.

## Closeout State

- `manual_publish_closeouts = 0`
- Closeouts query returned `(0 rows)`.
- No closeout was created.

## File And Storage Evidence

- Approved video file: `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`
- Size: `1950179` bytes
- Storage archive included source demo footage, draft render, and approved video.

This document records paths and sizes only. It does not commit the approved MP4, storage archive, dump file, checksum file, or backup artifacts.

## Outcome

- Controlled account-login readiness smoke: PASS.
- `account_login_ready` is done for all four channels: PASS.
- Each channel now has `6` done / `2` pending: PASS.
- Total checklist state is `24` done / `8` pending: PASS.
- `manual_post_created` remains pending: PASS.
- `manual_url_recorded` remains pending: PASS.
- Evidence log count unchanged at `2`: PASS.
- Closeout count remains `0`: PASS.
- No publish timestamp or URL: PASS.
- No credentials captured or stored: PASS.
- Existing blank YouTube anomaly unchanged: PASS.
- Pilot remained running per owner evidence.

## Warnings And Non-Goals

This is runtime account-login readiness smoke evidence only. No actual posting occurred, no upload occurred, no evidence log was created, no publish-proof checklist item was completed, no credential was captured or stored, and no closeout was created.

No scheduler, publisher, social API, upload automation, OpenAI live runtime, public exposure, or cutover was enabled. The existing blank YouTube `admin_note` anomaly remains historical runtime data and must not be hidden, deleted, or mutated as part of this evidence phase.
