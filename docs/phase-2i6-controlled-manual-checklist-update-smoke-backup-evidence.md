# Phase 2I.6 Controlled Manual Checklist Update Smoke + Backup Evidence

## Summary

Phase 2I.6 records owner-provided controlled manual checklist update smoke and backup evidence for `psd_pilot` on `pesona`.

This is a docs-only/read-only release. Codex did not run commands on `pesona` or Lenovo. No app/runtime code, migration, `scripts/prepare-test-db.mjs`, backup artifact, storage artifact, rendered MP4, generated file, env file, secret, or dump/archive/checksum file is committed.

## Evidence Documents

- `docs/ops/CONTROLLED_MANUAL_CHECKLIST_UPDATE_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I6_MANUAL_CHECKLIST_UPDATE_SMOKE_BACKUP_EVIDENCE.md`
- `docs/phase-2i6-controlled-manual-checklist-update-smoke-backup-evidence.md`

## Runtime Baseline

Owner-provided runtime baseline:

| Item | Evidence |
| --- | --- |
| Server | `pesona` |
| Repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Pilot project | `psd_pilot` |
| Web port | `3400` |
| Runtime Git head | `8f675052be9cb97c1d70e685a04bedbc73d912ec` |
| Runtime tag | `phase-2i4-complete` |
| Backup timestamp UTC | `2026-07-06T05:21:09Z` |
| Backup directory | `/srv/pesona-studio/backups/psd-pilot-phase-2i6-manual-checklist-update-smoke-backup-20260706T052108Z` |

Runtime server remains at `phase-2i4-complete`.

## Checklist Update Smoke Result

Owner-provided controlled checklist update smoke result: `PASS`.

- Exactly one checklist item was updated.
- Checklist item ID: `99458d1a-758d-41cc-9946-4c11563e9771`.
- Channel: `facebook`.
- Checklist key: `video_file_confirmed`.
- Checklist label: `Video file confirmed`.
- Checklist status: `done`.
- Checked by: `Rino`.
- Checked at: `2026-07-06 05:14:49.29578+00`.
- Checklist note records pilot-only smoke and explicitly states no upload, no publish, no URL, no schedule, and no closeout.
- Validation string: `1|31|2|0|ready_manual_publish|`.
- Specific validation: `specific_ok=ok`.

## Runtime State

Owner-provided runtime evidence:

- Routes `/health`, `/publication-packages`, `/publication-packages/ca5a591f-fdf1-4b8c-bb61-9295c186a7be/checklist`, `/publication-packages/ca5a591f-fdf1-4b8c-bb61-9295c186a7be/closeout`, `/manual-publish-report`, and `/manual-publish-closeouts` returned HTTP 200.
- Pilot containers remained running.
- DB counts remained `manual_publication_packages = 1`, `manual_publication_package_channels = 4`, `manual_publish_checklist_items = 32`, `manual_publish_evidence_logs = 2`, and `manual_publish_closeouts = 0`.
- Package `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` remained `ready_manual_publish`.
- `published_manually_at` remained empty.
- Checklist state changed to `1` done and `31` pending.
- Facebook checklist summary is `8` total, `1` done, and `7` pending.
- Instagram, TikTok, and YouTube each remain `8` total, `0` done, and `8` pending.
- Existing Facebook `admin_note` evidence remained documented.
- Existing blank YouTube `admin_note` anomaly remained visible and unchanged.
- No new evidence log was created.
- Closeouts query returned `(0 rows)`.
- No publish timestamp or URL was recorded.

## Backup Evidence

Owner-provided backup evidence:

- Backup directory: `/srv/pesona-studio/backups/psd-pilot-phase-2i6-manual-checklist-update-smoke-backup-20260706T052108Z`.
- Backup directory size: `6.0M`.
- `/srv/pesona-studio` storage: size `469G`, used `73M`, available `445G`.
- `sha256sum -c SHA256SUMS.txt` passed for all listed evidence, dump, and archive files.
- PostgreSQL dump was readable through `pg_restore -l`.
- Dump was custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- Storage archive was readable and included source demo footage, draft render, and approved video.
- No restore was performed.

## Outcome

- Controlled one-item checklist update: PASS.
- Updated exactly one item: PASS.
- Facebook `video_file_confirmed` done: PASS.
- Checklist done/pending state is `1/31`: PASS.
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
- No additional checklist completion.
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

- Remaining checklist items remain pending.
- Real manual publish proof remains pending.
- Closeout remains blocked.
- Pilot backup restore dry-run planning remains separate.
- Cutover remains blocked pending explicit owner approval.
