# Phase 2I.2 Controlled Server Pull + Runtime Guard Smoke + Backup Evidence

## Summary

Phase 2I.2 records owner-provided controlled server pull, runtime guard smoke, and backup evidence for `psd_pilot` on `pesona`.

This is a docs-only/read-only release. Codex did not run commands on `pesona` or Lenovo. No app/runtime code, migration, `scripts/prepare-test-db.mjs`, backup artifact, storage artifact, rendered MP4, generated file, env file, secret, or dump/archive/checksum file is committed.

## Evidence Documents

- `docs/ops/CONTROLLED_SERVER_PULL_RUNTIME_GUARD_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I2_RUNTIME_GUARD_SMOKE_BACKUP_EVIDENCE.md`
- `docs/phase-2i2-controlled-server-pull-runtime-guard-smoke-backup-evidence.md`

## Runtime Baseline

Owner-provided runtime baseline:

| Item | Evidence |
| --- | --- |
| Server | `pesona` |
| Repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Pilot project | `psd_pilot` |
| Web port | `3400` |
| Runtime Git head | `4fa59910229c81038d7ec36a5efc4c0bba8df363` |
| Runtime tag | `phase-2i1-complete` |
| Git status short count | `0` |
| Backup timestamp UTC | `2026-07-06T03:45:54Z` |
| Backup directory | `/srv/pesona-studio/backups/psd-pilot-phase-2i2-runtime-guard-smoke-backup-20260706T034554Z` |

Runtime server is confirmed at `phase-2i1-complete`.

## Runtime Guard Smoke Result

Owner-provided runtime guard smoke result: `PASS`.

- Blank evidence guard: PASS.
- UI rejected blank evidence submit with required recorder/name validation.
- Evidence log count after blank submit remained unchanged at `2`.
- No new blank evidence row was created.
- Closeout readiness guard: PASS.
- UI showed `NOT_READY_FOR_CLOSEOUT`.
- Closeout creation was not performed.
- Manual publish was not performed.
- Social API, scheduler, and publisher were not enabled.
- Cutover remains blocked.

## Runtime State

Owner-provided runtime evidence:

- Routes `/health`, `/publication-packages`, `/publication-packages/ca5a591f-fdf1-4b8c-bb61-9295c186a7be/checklist`, `/publication-packages/ca5a591f-fdf1-4b8c-bb61-9295c186a7be/closeout`, `/manual-publish-report`, and `/manual-publish-closeouts` returned HTTP 200.
- Pilot containers remained running.
- DB counts remained `manual_publication_packages = 1`, `manual_publication_package_channels = 4`, `manual_publish_checklist_items = 32`, `manual_publish_evidence_logs = 2`, and `manual_publish_closeouts = 0`.
- Package `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` remained `ready_manual_publish`.
- `published_manually_at` remained empty.
- All four channels remained `draft_channel` with empty planned publish time, manual publish time, and manual publish URL.
- All checklist items remained pending.
- Existing Facebook `admin_note` evidence remained documented.
- Existing blank YouTube `admin_note` anomaly remained visible and unchanged.
- Closeouts query returned `(0 rows)`.

## Backup Evidence

Owner-provided backup evidence:

- Backup directory: `/srv/pesona-studio/backups/psd-pilot-phase-2i2-runtime-guard-smoke-backup-20260706T034554Z`.
- Backup directory size: `6.0M`.
- `/srv/pesona-studio` storage: size `469G`, used `61M`, available `445G`.
- `sha256sum -c SHA256SUMS.txt` passed for all listed evidence, dump, and archive files.
- PostgreSQL dump was readable through `pg_restore -l`.
- Dump was custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- Storage archive was readable and included source demo footage, draft render, and approved video.
- No restore was performed.

## Outcome

- Server runtime updated to `phase-2i1-complete`: PASS.
- Runtime blank evidence guard: PASS.
- Runtime closeout readiness guard: PASS.
- Evidence log count stayed unchanged after blank submit: PASS.
- No new blank evidence row: PASS.
- Closeout remained `0`: PASS.
- No publish timestamp or URL: PASS.
- All channels remain draft: PASS.
- Checklist remains pending: PASS.
- Existing YouTube blank anomaly remained documented and unchanged: PASS.
- Backup: PASS.
- Checksum validation: PASS.
- DB dump readability: PASS.
- Storage archive readability: PASS.
- Pilot remained running per owner evidence.

## Non-Goals

- No command on `pesona` or Lenovo by Codex.
- No production backup.
- No restore.
- No restore dry-run.
- No deployment.
- No cutover.
- No public exposure.
- No Docker Compose up/down by Codex.
- No container mutation.
- No closeout creation.
- No actual publishing.
- No social API.
- No scheduler.
- No OpenAI live runtime.
- No worker expansion.
- No deletion, hiding, fix, or mutation of the existing blank YouTube `admin_note` anomaly.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change.
- No backup artifact, rendered MP4, storage artifact, env file, secret, or generated file committed.

## Pending

- Real manual publish proof remains pending.
- Closeout remains blocked.
- Pilot backup restore dry-run planning remains separate.
- Cutover remains blocked pending explicit owner approval.
