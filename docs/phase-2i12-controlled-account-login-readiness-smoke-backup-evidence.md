# Phase 2I.12 Controlled Account-Login Readiness Smoke + Backup Evidence

Phase 2I.12 records owner-provided controlled account-login readiness smoke and backup evidence for `psd_pilot` on `pesona`. This is a docs-only/read-only release in the repository.

## Baseline

- Repo baseline: `1fd4cbd`, tag `phase-2i11-complete`
- Runtime server: `pesona`
- Runtime repo path: `/srv/pesona-studio/repos/pesona-studio-desk`
- Runtime Git head: `8f675052be9cb97c1d70e685a04bedbc73d912ec`
- Runtime tag: `phase-2i4-complete`
- Pilot project: `psd_pilot`
- Web port: `3400`
- Package ID: `ca5a591f-fdf1-4b8c-bb61-9295c186a7be`
- Package status: `ready_manual_publish`
- `published_manually_at`: empty

This phase does not touch runtime. Codex did not run commands on `pesona` or Lenovo.

## Smoke Result

Owner manually confirmed account-login readiness and marked `account_login_ready` done for all four channels:

| Channel | Checked by | Checked at |
| --- | --- | --- |
| Facebook | `Rino` | `2026-07-07 04:15:51.876865+00` |
| Instagram | `Rino` | `2026-07-07 04:16:01.266627+00` |
| TikTok | `Rino` | `2026-07-07 04:16:12.275245+00` |
| YouTube | `Rino` | `2026-07-07 04:16:27.658222+00` |

Approved non-secret checklist note:

```text
CONTROLLED ACCOUNT-LOGIN READINESS SMOKE - PILOT ONLY. Human operator confirmed manual account access readiness for this channel. No credentials captured, no password/token/cookie/session stored, no upload, no publish, no URL, no schedule, no evidence log, no closeout.
```

Validation gate:

```text
24|8|2|0|ready_manual_publish|
account_login_ready_ok=ok
channel_distribution_ok=ok
publish_proof_blocked_ok=ok
secret_note_scan_ok=ok
```

## Checklist State

- Facebook: `8` total, `6` done, `2` pending
- Instagram: `8` total, `6` done, `2` pending
- TikTok: `8` total, `6` done, `2` pending
- YouTube: `8` total, `6` done, `2` pending
- Total: `32` total, `24` done, `8` pending

Remaining blocked items:

- `manual_post_created` remains pending for Facebook, Instagram, TikTok, and YouTube.
- `manual_url_recorded` remains pending for Facebook, Instagram, TikTok, and YouTube.
- These publish-proof items remain blocked until real manual posting and valid URL evidence are explicitly approved.

## Runtime Evidence Summary

- Route checks returned HTTP 200 for `/health`, `/publication-packages`, the package checklist page, the package closeout page, `/manual-publish-report`, and `/manual-publish-closeouts`.
- Pilot containers remained running, including web-app on `0.0.0.0:3400->3000`, n8n, campaign planner worker, mockup worker, video worker, healthy Postgres, and healthy Redis.
- Runtime DB counts remained `manual_publication_packages = 1`, `manual_publication_package_channels = 4`, `manual_publish_checklist_items = 32`, `manual_publish_evidence_logs = 2`, and `manual_publish_closeouts = 0`.
- Evidence log count remained unchanged at `2`.
- Existing Facebook `admin_note` remained `PILOT_SMOKE_NO_PUBLISH`, recorded by `Rino`.
- Existing blank YouTube `admin_note` anomaly remained visible, documented, and unchanged.
- Closeouts query returned `(0 rows)`.
- No closeout was created.

## Backup Evidence Summary

- Backup timestamp UTC: `2026-07-07T04:17:30Z`
- Backup directory: `/srv/pesona-studio/backups/psd-pilot-phase-2i12-account-login-readiness-smoke-backup-20260707T041730Z`
- Backup directory size: `6.0M`
- `/srv/pesona-studio` storage: size `469G`, used `91M`, available `445G`
- `sha256sum -c SHA256SUMS.txt` passed for all listed evidence, dump, and archive files.
- PostgreSQL dump was readable through `pg_restore -l`.
- Storage archive was readable.
- No restore was performed.

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
- Backup, checksum validation, DB dump readability, and storage archive readability: PASS.
- Pilot remained running per owner evidence.

## Warnings And Non-Goals

This is runtime account-login readiness smoke and backup evidence only. It is not actual posting, not upload, not evidence log creation, not publish-proof checklist completion, not credential capture, not closeout, not scheduler/publisher/social API activation, not OpenAI live runtime, not public exposure, and not cutover.

No backup artifacts, rendered MP4s, storage artifacts, env files, secrets, credentials, or generated files are committed in this phase. No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change is part of this docs-only release.

Closeout remains blocked. Cutover remains blocked.
