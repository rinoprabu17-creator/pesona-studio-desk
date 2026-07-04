# Phase 2H.21 Controlled Manual Evidence Log Sandbox + Post-Evidence-Log Backup Evidence

## Phase Name

Phase 2H.21 Controlled Manual Evidence Log Sandbox + Post-Evidence-Log Backup Evidence.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `d00c15e`.
- Baseline tag: `phase-2h20-complete`.
- Current branch/state: `phase-2h21-controlled-manual-evidence-log-sandbox-backup-evidence` with docs-only evidence changes not committed.
- This phase records owner-provided manual evidence log sandbox, anomaly note, and post-evidence-log backup evidence only.

## Docs Created

- `docs/ops/CONTROLLED_MANUAL_EVIDENCE_LOG_SANDBOX_EVIDENCE.md`
- `docs/ops/PILOT_POST_MANUAL_EVIDENCE_LOG_SANDBOX_BACKUP_EVIDENCE.md`
- `docs/phase-2h21-controlled-manual-evidence-log-sandbox-backup-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Manual Evidence Log Sandbox Summary

Owner-provided evidence records controlled manual evidence log sandbox activity on `psd_pilot`:

- Server: `pesona`.
- Repo path: `/srv/pesona-studio/repos/pesona-studio-desk`.
- Pilot project: `psd_pilot`.
- Web port: `3400`.
- Baseline tag on server: `phase-2h12-complete`.
- Git head on server: `ea4cc57120ebc9efa0a2d4f6d02079b73e23404f`.
- Git status short count: `0`.
- Backup timestamp UTC: `2026-07-04T06:08:35Z`.
- Evidence logs were DB-only.
- Counts showed `manual_publication_packages` 1, `manual_publication_package_channels` 4, `manual_publish_checklist_items` 32, `manual_publish_evidence_logs` 2, and `manual_publish_closeouts` 0.
- Package `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` remained `ready_manual_publish`.
- `published_manually_at` remained empty.
- Intended Facebook `admin_note` evidence log `cd2bba56-ea9e-4035-a24d-4a70c4a8479f` was recorded with value `PILOT_SMOKE_NO_PUBLISH`.
- Intended evidence note explicitly states DB-only sandbox, no upload, no publish, no schedule, no social API, no real posting URL, and no closeout.
- Accidental blank YouTube `admin_note` evidence log `0b4b5ff2-c994-46d9-8f1c-e5c6743a336c` exists with empty value, note, and recorded-by fields.
- The blank YouTube `admin_note` is recorded as a harmless DB-only anomaly with no publish URL, no publish timestamp, no package status change, and no closeout.
- The blank YouTube anomaly was not deleted, fixed, hidden, or mutated by Codex.
- Evidence log summary showed `facebook` `admin_note` total logs 1 and blank logs 0, plus `youtube` `admin_note` total logs 1 and blank logs 1.
- Closeouts query returned `(0 rows)`.
- Checklist summary remained 8 total, 0 done, and 8 pending for each of `facebook`, `instagram`, `tiktok`, and `youtube`.
- No checklist item was marked done in this phase.
- Approved video files were present on server storage as evidence.
- Routes `/health`, `/publication-packages`, `/manual-publish-report`, and `/manual-publish-closeouts` returned HTTP 200.
- Pilot containers remained running.

This was controlled manual evidence log sandbox evidence. It was not actual social publishing, real publish proof, closeout, scheduler/publisher automation, OpenAI live runtime, public exposure, or cutover.

## Post-Evidence-Log Backup Evidence Summary

Owner-provided evidence records post-evidence-log pilot backup:

- Backup directory: `/srv/pesona-studio/backups/psd-pilot-post-manual-evidence-log-sandbox-backup-20260704T060835Z`.
- Backup files recorded as evidence only: `approved-video-files.txt`, `baseline-evidence.txt`, `checklist-summary-by-channel.txt`, `evidence-log-sandbox-counts.txt`, `evidence-log-summary.txt`, `latest-package-status.txt`, `manual-publish-closeouts.txt`, `manual-publish-evidence-logs.txt`, `pilot-running-containers.txt`, `postgres-dump-list.txt`, `postgres-pilot-post-manual-evidence-log-sandbox.dump`, `route-status.txt`, `SHA256SUMS.txt`, `storage-archive-list.txt`, and `storage-pilot-post-manual-evidence-log-sandbox.tgz`.
- Backup directory size was `6.0M`.
- `/srv/pesona-studio` storage was `469G` size, `49M` used, and `445G` available.
- `sha256sum -c SHA256SUMS.txt` passed for listed backup files.
- Storage archive listing included source demo footage, draft render, and approved video.
- PostgreSQL dump was readable via `pg_restore -l`, custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- No restore was performed.

## Outcome

Evidence log sandbox is PASS.

Intended Facebook `admin_note` recorded is PASS. Blank YouTube `admin_note` anomaly captured is PASS. No publish URL recorded is PASS. No publish timestamp is PASS. Package remains `ready_manual_publish` is PASS. No closeout is PASS. No checklist item marked done is PASS.

No upload, publish, schedule, social API, OpenAI live runtime, public exposure, or cutover occurred.

Post-evidence-log backup is PASS. Checksum validation is PASS. DB dump readability is PASS. Storage archive readability is PASS.

Pilot remained running.

Manual publish closeout remains pending.

No backup artifacts, rendered MP4s, storage artifacts, env files, secrets, or generated files were committed.

Cutover remains blocked.

## Safety Confirmations

- Docs-only/read-only release in this repo.
- No command run by Codex on Lenovo.
- No new command run by Codex on the `pesona` server.
- No restore.
- No restore dry-run.
- No production backup.
- No deployment.
- No cutover.
- No public exposure.
- No storage copy by Codex.
- No Docker Compose up/down by Codex.
- No container stop, restart, or mutation by Codex.
- No deletion, fix, or mutation of the blank YouTube evidence log anomaly.
- No closeout creation.
- No actual publishing.
- No social API.
- No scheduler.
- No OpenAI live runtime.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, rendered MP4, or storage artifact committed.

## Validation Results

Local validation on laptop/WSL completed for this docs-only evidence branch:

| Check | Result |
| --- | --- |
| `git diff --check` | PASS: no whitespace errors in tracked diff. |
| `npm run check` | PASS. |
| `git diff --name-only \| grep "workers/video" \|\| true` | PASS: no `workers/video` diff. |
| Path safety check | PASS: changed paths do not include forbidden app/runtime, migration, script, storage, backup, tmp, env, secret, `node_modules`, media, dump, archive, checksum, route evidence, rendered MP4, or backup artifact paths. |
| Safety grep against changed docs only | PASS: expected sensitive/destructive/runtime/backup/restore/render/approval/promotion/handoff/package/publish/checklist/evidence/closeout/anomaly terms appear only in evidence notes, warnings, non-goals, anomaly notes, HOLD conditions, pending lists, or safety descriptions. |
| `git status --short --ignored` | PASS: docs/readme changes only, plus ignored local artifacts before commit. |

## Pending Execution List

The following remain pending and require separate owner approval:

- Manual publish closeout evidence.
- Final restore dry-run planning in a separate isolated environment.
- Final restore dry-run execution.
- Controlled pilot operating review evidence.
- Production backup policy acceptance.
- Production-like backup evidence.
- Production restore planning.
- Storage copy by owner/operator.
- Deployment.
- Cutover Go/No-Go.
- Actual cutover.
- GPU driver installation.
- Public exposure or Cloudflare Tunnel.
- `systemd`, cron, or autostart setup.
- Automated backup.
- Scheduler, publisher, social API, OpenAI live runtime, upload automation, queue expansion, or worker daemon changes.

## Recommended Next Phase

Recommended next safe phase: manual publish closeout evidence, final restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
