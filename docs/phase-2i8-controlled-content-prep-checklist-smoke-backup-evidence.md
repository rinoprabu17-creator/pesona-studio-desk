# Phase 2I.8 Controlled Checklist Content-Prep Update Smoke + Backup Evidence

## Summary

Phase 2I.8 records owner-provided controlled Facebook content-prep checklist update smoke and backup evidence for `psd_pilot` on `pesona`.

This is a docs-only/read-only release. Codex did not run commands on `pesona` or Lenovo. No app/runtime code, migration, `scripts/prepare-test-db.mjs`, backup artifact, storage artifact, rendered MP4, generated file, env file, secret, or dump/archive/checksum file is committed.

## Evidence Documents

- `docs/ops/CONTROLLED_CONTENT_PREP_CHECKLIST_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I8_CONTENT_PREP_CHECKLIST_SMOKE_BACKUP_EVIDENCE.md`
- `docs/phase-2i8-controlled-content-prep-checklist-smoke-backup-evidence.md`

## Runtime Baseline

| Item | Evidence |
| --- | --- |
| Server | `pesona` |
| Repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Pilot project | `psd_pilot` |
| Web port | `3400` |
| Runtime Git head | `8f675052be9cb97c1d70e685a04bedbc73d912ec` |
| Runtime tag | `phase-2i4-complete` |
| Backup timestamp UTC | `2026-07-06T06:08:59Z` |
| Backup directory | `/srv/pesona-studio/backups/psd-pilot-phase-2i8-content-prep-checklist-smoke-backup-20260706T060858Z` |

Runtime server remains at `phase-2i4-complete`.

## Smoke Result

Owner-provided validation:

```text
5|27|2|0|ready_manual_publish|
content_prep_ok=ok
blocked_items_ok=ok
```

Result: PASS.

- Four low-risk Facebook content-prep checklist items were marked done: `caption_ready`, `hashtags_ready`, `cta_ready`, and `final_visual_check`.
- Previously completed Facebook `video_file_confirmed` remained done.
- Facebook is now `5` done and `3` pending.
- Total checklist state is `5` done and `27` pending.
- `manual_post_created` remains pending.
- `manual_url_recorded` remains pending.
- Evidence log count remained unchanged at `2`.
- `manual_publish_closeouts` remained `0`.
- Package remained `ready_manual_publish`.
- `published_manually_at` remained empty.

## Runtime State

Owner-provided runtime evidence:

- Routes `/health`, `/publication-packages`, `/publication-packages/ca5a591f-fdf1-4b8c-bb61-9295c186a7be/checklist`, `/publication-packages/ca5a591f-fdf1-4b8c-bb61-9295c186a7be/closeout`, `/manual-publish-report`, and `/manual-publish-closeouts` returned HTTP 200.
- Pilot containers remained running.
- DB counts remained `manual_publication_packages = 1`, `manual_publication_package_channels = 4`, `manual_publish_checklist_items = 32`, `manual_publish_evidence_logs = 2`, and `manual_publish_closeouts = 0`.
- Package `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` remained `ready_manual_publish`.
- Existing Facebook `admin_note` evidence remained documented.
- Existing blank YouTube `admin_note` anomaly remained visible and unchanged.
- No new evidence log was created.
- Closeouts query returned `(0 rows)`.
- No publish timestamp or URL was recorded.

## Backup Evidence

Owner-provided backup evidence:

- Backup directory: `/srv/pesona-studio/backups/psd-pilot-phase-2i8-content-prep-checklist-smoke-backup-20260706T060858Z`.
- Backup directory size: `6.0M`.
- `/srv/pesona-studio` storage: size `469G`, used `79M`, available `445G`.
- `sha256sum -c SHA256SUMS.txt` passed for all listed evidence, dump, and archive files.
- PostgreSQL dump was readable through `pg_restore -l`.
- Dump was custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- Storage archive was readable and included source demo footage, draft render, and approved video.
- No restore was performed.

## Outcome

- Controlled Facebook content-prep checklist update: PASS.
- Four low-risk content-prep items done: PASS.
- Total checklist state is `5` done / `27` pending: PASS.
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

## Non-Goals

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
- No publish-proof checklist completion.
- No closeout creation.
- No actual publishing.
- No real publish URL or publish timestamp.
- No social API.
- No scheduler.
- No OpenAI live runtime.
- No worker expansion.
- No deletion, hiding, fix, or mutation of the existing blank YouTube `admin_note` anomaly.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change.
- No backup artifact, rendered MP4, storage artifact, env file, secret, or generated file committed.

## Pending

- Facebook publish-proof items remain pending.
- Instagram, TikTok, and YouTube checklist items remain pending.
- Real manual publish proof remains pending.
- Closeout remains blocked.
- Cutover remains blocked pending explicit owner approval.
