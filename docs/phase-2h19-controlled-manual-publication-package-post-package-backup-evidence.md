# Phase 2H.19 Controlled Manual Publication Package + Post-Package Backup Evidence

## Phase Name

Phase 2H.19 Controlled Manual Publication Package + Post-Package Backup Evidence.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `c2a171b`.
- Baseline tag: `phase-2h18-complete`.
- Current branch/state: `phase-2h19-controlled-manual-publication-package-post-package-backup-evidence` with docs-only evidence changes not committed.
- This phase records owner-provided manual publication package and post-package backup evidence only.

## Docs Created

- `docs/ops/CONTROLLED_MANUAL_PUBLICATION_PACKAGE_EVIDENCE.md`
- `docs/ops/PILOT_POST_MANUAL_PACKAGE_BACKUP_EVIDENCE.md`
- `docs/phase-2h19-controlled-manual-publication-package-post-package-backup-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Manual Publication Package Evidence Summary

Owner-provided evidence records controlled manual publication package creation on `psd_pilot`:

- Server: `pesona`.
- Repo path: `/srv/pesona-studio/repos/pesona-studio-desk`.
- Pilot project: `psd_pilot`.
- Web port: `3400`.
- Baseline tag on server: `phase-2h12-complete`.
- Git head on server: `ea4cc57120ebc9efa0a2d4f6d02079b73e23404f`.
- Git status short count: `0`.
- Backup timestamp UTC: `2026-07-04T04:51:48Z`.
- Package creation was DB-only and created from approved-video handoff.
- Counts showed `video_render_approved_promotions` 1, `video_approved_handoff_records` 1, `manual_publication_packages` 1, `manual_publication_package_channels` 4, `manual_publish_checklist_items` 0, `manual_publish_evidence_logs` 0, and `manual_publish_closeouts` 0.
- Package `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` was created from handoff `19614d06-6e0b-43bd-87c3-deb6829720ef` and promotion `1b9deb36-1468-436d-a2c5-2031dbe6dc51`.
- Package status remained `draft_package`.
- Approved output snapshot was `smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`.
- Approved size snapshot was `1950179` bytes.
- Approved SHA256 snapshot was `97b066a05d2de5689d7158592912f0f8d3d8a37565891b04bcb5b96940b29b0b`.
- Package title was `PILOT-DESAIN-GRATIS-01-D01 - Manual Package Smoke`.
- Caption, hashtags, CTA, and manual publish note explicitly marked pilot smoke/manual package only with no upload, publish, schedule, social API, or cutover.
- Four channel rows were created for `instagram`, `facebook`, `tiktok`, and `youtube`; each remained `draft_channel` with empty planned publish time, manual published time, and manual publish URL.
- Draft and approved video files were present on server storage as evidence.
- Routes `/health`, `/approved-videos`, `/publication-packages`, `/manual-publish-report`, and `/manual-publish-closeouts` returned HTTP 200.
- Pilot containers remained running.

This was controlled manual publication package evidence. It was not actual social publishing, scheduler/publisher automation, OpenAI live runtime, public exposure, or cutover.

No manual publish evidence log was created. No closeout was created.

## Post-Package Backup Evidence Summary

Owner-provided evidence records post-manual-package pilot backup:

- Backup directory: `/srv/pesona-studio/backups/psd-pilot-post-manual-package-backup-20260704T045148Z`.
- Backup files recorded as evidence only: `approved-video-files.txt`, `baseline-evidence.txt`, `draft-video-files.txt`, `latest-manual-publication-package.txt`, `manual-package-channels.txt`, `manual-package-counts.txt`, `pilot-running-containers.txt`, `postgres-dump-list.txt`, `postgres-pilot-post-manual-package.dump`, `route-status.txt`, `SHA256SUMS.txt`, `storage-archive-list.txt`, and `storage-pilot-post-manual-package.tgz`.
- Backup directory size was `6.0M`.
- `/srv/pesona-studio` storage was `469G` size, `37M` used, and `445G` available.
- `sha256sum -c SHA256SUMS.txt` passed for listed backup files.
- Storage archive listing included source demo footage, draft render, and approved video.
- PostgreSQL dump was readable via `pg_restore -l`, custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- No restore was performed.

## Outcome

Manual publication package created is PASS.

Four channel package rows created is PASS. Package status remains `draft_package` is PASS. Channel rows remain `draft_channel` is PASS. No manual publish evidence log is PASS. No closeout is PASS.

No upload, publish, schedule, social API, OpenAI live runtime, public exposure, or cutover occurred.

Post-package backup is PASS. Checksum validation is PASS. DB dump readability is PASS. Storage archive readability is PASS.

Pilot remained running.

Manual publish evidence log and closeout remain pending.

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
- No manual publish evidence log creation.
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
| Safety grep against changed docs only | PASS: expected sensitive/destructive/runtime/backup/restore/render/approval/promotion/handoff/package/publish terms appear only in evidence notes, warnings, non-goals, HOLD conditions, pending lists, or safety descriptions. |
| `git status --short --ignored` | PASS: docs/readme changes only, plus ignored local artifacts before commit. |

## Pending Execution List

The following remain pending and require separate owner approval:

- Manual publish evidence log evidence.
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

Recommended next safe phase: manual publish evidence log evidence, manual publish closeout evidence, final restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
