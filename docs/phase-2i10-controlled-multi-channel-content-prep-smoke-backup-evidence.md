# Phase 2I.10 Controlled Multi-Channel Content-Prep Checklist Smoke + Backup Evidence

## Summary

Phase 2I.10 records owner-provided controlled multi-channel content-prep checklist smoke and backup evidence for `psd_pilot` on `pesona`.

This is a docs-only/read-only release. Codex did not run commands on `pesona` or Lenovo. No app/runtime code, migration, `scripts/prepare-test-db.mjs`, backup artifact, storage artifact, rendered MP4, generated file, env file, secret, or dump/archive/checksum file is committed.

## Evidence Documents

- `docs/ops/CONTROLLED_MULTI_CHANNEL_CONTENT_PREP_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I10_MULTI_CHANNEL_CONTENT_PREP_SMOKE_BACKUP_EVIDENCE.md`
- `docs/phase-2i10-controlled-multi-channel-content-prep-smoke-backup-evidence.md`

## Runtime Baseline

| Item | Evidence |
| --- | --- |
| Server | `pesona` |
| Repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Pilot project | `psd_pilot` |
| Web port | `3400` |
| Runtime Git head | `8f675052be9cb97c1d70e685a04bedbc73d912ec` |
| Runtime tag | `phase-2i4-complete` |
| Backup timestamp UTC | `2026-07-07T03:40:50Z` |
| Backup directory | `/srv/pesona-studio/backups/psd-pilot-phase-2i10-multi-channel-content-prep-smoke-backup-20260707T034049Z` |

Runtime server remains at `phase-2i4-complete`.

## Smoke Result

Owner-provided validation:

```text
20|12|2|0|ready_manual_publish|
multi_channel_prep_ok=ok
channel_distribution_ok=ok
blocked_items_ok=ok
```

Result: PASS.

- Low-risk content-prep checklist items were marked done for Instagram, TikTok, and YouTube: `video_file_confirmed`, `caption_ready`, `hashtags_ready`, `cta_ready`, and `final_visual_check`.
- Facebook previously remained `5` done and `3` pending.
- Instagram is now `5` done and `3` pending.
- TikTok is now `5` done and `3` pending.
- YouTube is now `5` done and `3` pending.
- Total checklist state is `20` done and `12` pending.
- `account_login_ready` remains pending across all channels.
- `manual_post_created` remains pending across all channels.
- `manual_url_recorded` remains pending across all channels.
- Evidence log count remained unchanged at `2`.
- `manual_publish_closeouts` remained `0`.
- Package remained `ready_manual_publish`.
- `published_manually_at` remained empty.

## Runtime State

Owner-provided runtime evidence:

- Routes `/health`, `/publication-packages`, `/publication-packages/ca5a591f-fdf1-4b8c-bb61-9295c186a7be/checklist`, `/publication-packages/ca5a591f-fdf1-4b8c-bb61-9295c186a7be/closeout`, `/manual-publish-report`, and `/manual-publish-closeouts` returned HTTP 200.
- Pilot containers remained running, including `psd_pilot-web-app-1` on `0.0.0.0:3400->3000`, n8n, campaign planner worker, mockup worker, video worker, healthy Postgres, and healthy Redis.
- DB counts remained `manual_publication_packages = 1`, `manual_publication_package_channels = 4`, `manual_publish_checklist_items = 32`, `manual_publish_evidence_logs = 2`, and `manual_publish_closeouts = 0`.
- Package `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` remained `ready_manual_publish`.
- Package title remained `PILOT-DESAIN-GRATIS-01-D01 - Manual Package Smoke`.
- `ready_at` and updated at remained `2026-07-04 05:29:44.13736+00`.
- Existing Facebook `admin_note` evidence remained documented.
- Existing blank YouTube `admin_note` anomaly remained visible and unchanged.
- No new evidence log was created.
- Closeouts query returned `(0 rows)`.
- No publish timestamp or URL was recorded.

## Backup Evidence

Owner-provided backup evidence:

- Backup directory: `/srv/pesona-studio/backups/psd-pilot-phase-2i10-multi-channel-content-prep-smoke-backup-20260707T034049Z`.
- Backup directory size: `6.0M`.
- `/srv/pesona-studio` storage: size `469G`, used `85M`, available `445G`.
- Backup files included runtime baseline, route status, container status, DB counts, checklist summary, multi-channel focus items, evidence log summary, evidence log records, closeout state, approved video file list, PostgreSQL dump/list, storage archive/list, assessment, and `SHA256SUMS.txt`.
- `sha256sum -c SHA256SUMS.txt` passed for all listed evidence, dump, and archive files.
- PostgreSQL dump was readable through `pg_restore -l`.
- Dump was custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- Storage archive was readable and included source demo footage, draft render, and approved video.
- No restore was performed.

## Outcome

- Controlled multi-channel content-prep checklist smoke: PASS.
- Instagram, TikTok, and YouTube each reached `5` done / `3` pending: PASS.
- All four channels now have `5` done / `3` pending: PASS.
- Total checklist state is `20` done / `12` pending: PASS.
- `account_login_ready` remains pending: PASS.
- `manual_post_created` remains pending: PASS.
- `manual_url_recorded` remains pending: PASS.
- Evidence log count unchanged at `2`: PASS.
- Closeout count remains `0`: PASS.
- No publish timestamp or URL: PASS.
- Existing blank YouTube anomaly unchanged: PASS.
- Backup: PASS.
- Checksum validation: PASS.
- DB dump readability: PASS.
- Storage archive readability: PASS.
- Pilot remained running per owner evidence.

## Warnings And Non-Goals

- No command on `pesona` or Lenovo by Codex.
- No production backup by Codex.
- No restore.
- No restore dry-run.
- No deployment.
- No cutover.
- No public exposure.
- No Docker Compose up/down by Codex.
- No container mutation by Codex.
- No evidence log creation.
- No account-login checklist completion.
- No publish-proof checklist completion.
- No closeout creation.
- No actual publishing.
- No real publish URL or publish timestamp.
- No social API.
- No scheduler.
- No OpenAI live runtime.
- No worker expansion.
- No deletion, hiding, fix, or mutation of the existing blank YouTube `admin_note` anomaly.
- Existing blank YouTube `admin_note` anomaly remains as historical runtime data.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change.
- No backup artifact, rendered MP4, storage artifact, env file, secret, or generated file committed.

## Pending

- Account-login checklist items remain pending.
- Publish-proof checklist items remain pending.
- Real manual publish proof remains pending.
- Closeout remains blocked.
- Cutover remains blocked pending explicit owner approval.
