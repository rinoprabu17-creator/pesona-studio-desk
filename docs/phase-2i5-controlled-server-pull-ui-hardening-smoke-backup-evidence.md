# Phase 2I.5 Controlled Server Pull + UI Hardening Smoke + Backup Evidence

## Summary

Phase 2I.5 records owner-provided controlled server pull, runtime UI hardening smoke, and backup evidence for `psd_pilot` on `pesona`.

This is a docs-only/read-only release. Codex did not run commands on `pesona` or Lenovo. No app/runtime code, migration, `scripts/prepare-test-db.mjs`, backup artifact, storage artifact, rendered MP4, generated file, env file, secret, or dump/archive/checksum file is committed.

## Evidence Documents

- `docs/ops/CONTROLLED_SERVER_PULL_UI_HARDENING_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I5_UI_HARDENING_SMOKE_BACKUP_EVIDENCE.md`
- `docs/phase-2i5-controlled-server-pull-ui-hardening-smoke-backup-evidence.md`

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
| Git status short count | `0` |
| Backup timestamp UTC | `2026-07-06T04:50:15Z` |
| Backup directory | `/srv/pesona-studio/backups/psd-pilot-phase-2i5-ui-hardening-smoke-backup-20260706T045015Z` |

Runtime server is confirmed at `phase-2i4-complete`.

## Runtime Update Notes

Owner manually ran `git fetch origin --tags`, checked out `phase-2i4-complete`, rebuilt the web-app image, and restarted `psd_pilot` web-app. Codex did not run server commands.

The first immediate route check after restart had transient `curl: (56) Recv failure: Connection reset by peer`. Owner reconnected by SSH and subsequent route checks passed. This is recorded as transient restart timing, not a final failure.

## Runtime UI Hardening Smoke Result

Owner-provided runtime UI hardening smoke result: `PASS`.

- Runtime tag: `phase-2i4-complete`.
- UI Add Evidence hardening: PASS.
- Blank form keeps Add Evidence disabled: PASS.
- Helper text visible: `Evidence Value or Evidence Note is required. Blank evidence is not valid publish proof.`
- Existing blank YouTube `admin_note` anomaly remains visible and unchanged.
- Closeout readiness remains `NOT_READY_FOR_CLOSEOUT`: PASS.
- Evidence log creation was not performed.
- Checklist completion was not performed.
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
- All checklist items remained pending.
- Existing Facebook `admin_note` evidence remained documented.
- Existing blank YouTube `admin_note` anomaly remained visible and unchanged.
- Closeouts query returned `(0 rows)`.
- No publish timestamp or URL was recorded.

## Backup Evidence

Owner-provided backup evidence:

- Backup directory: `/srv/pesona-studio/backups/psd-pilot-phase-2i5-ui-hardening-smoke-backup-20260706T045015Z`.
- Backup directory size: `6.0M`.
- `/srv/pesona-studio` storage: size `469G`, used `68M`, available `445G`.
- `sha256sum -c SHA256SUMS.txt` passed for all listed evidence, dump, and archive files.
- PostgreSQL dump was readable through `pg_restore -l`.
- Dump was custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- Storage archive was readable and included source demo footage, draft render, and approved video.
- No restore was performed.

## Outcome

- Server runtime at `phase-2i4-complete`: PASS.
- UI Add Evidence hardening smoke: PASS.
- Blank form keeps Add Evidence disabled: PASS.
- Helper text visible: PASS.
- Blank YouTube anomaly visible and unchanged: PASS.
- Closeout readiness remains `NOT_READY_FOR_CLOSEOUT`: PASS.
- Evidence log count unchanged: PASS.
- Closeout remained `0`: PASS.
- No publish timestamp or URL: PASS.
- All channels remain draft: PASS.
- Checklist remains pending: PASS.
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
- No checklist completion.
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

- Real manual publish proof remains pending.
- Closeout remains blocked.
- Pilot backup restore dry-run planning remains separate.
- Cutover remains blocked pending explicit owner approval.
