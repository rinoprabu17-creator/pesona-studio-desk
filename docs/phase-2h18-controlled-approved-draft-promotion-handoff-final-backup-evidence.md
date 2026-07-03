# Phase 2H.18 Controlled Approved Draft Promotion + Handoff + Final Backup Evidence

## Phase Name

Phase 2H.18 Controlled Approved Draft Promotion + Handoff + Final Backup Evidence.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `ff91b68`.
- Baseline tag: `phase-2h17-complete`.
- Current branch/state: `phase-2h18-controlled-approved-draft-promotion-handoff-final-backup-evidence` with docs-only evidence changes not committed.
- This phase records owner-provided approved draft promotion, DB-only handoff, and final backup evidence only.

## Docs Created

- `docs/ops/CONTROLLED_APPROVED_DRAFT_PROMOTION_HANDOFF_EVIDENCE.md`
- `docs/ops/PILOT_POST_PROMOTION_HANDOFF_FINAL_BACKUP_EVIDENCE.md`
- `docs/phase-2h18-controlled-approved-draft-promotion-handoff-final-backup-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Promotion And Handoff Evidence Summary

Owner-provided evidence records controlled approved draft promotion and handoff on `psd_pilot`:

- Server: `pesona`.
- Repo path: `/srv/pesona-studio/repos/pesona-studio-desk`.
- Pilot project: `psd_pilot`.
- Web port: `3400`.
- Baseline tag on server: `phase-2h12-complete`.
- Git head on server: `ea4cc57120ebc9efa0a2d4f6d02079b73e23404f`.
- Git status short count: `0`.
- Final backup timestamp UTC: `2026-07-03T09:31:57Z`.
- Final counts showed `video_render_attempts` 1, `video_render_attempt_reviews` 1, `video_render_approved_promotions` 1, `video_approved_handoff_records` 1, and `manual_publication_packages` 0.
- Promotion `1b9deb36-1468-436d-a2c5-2031dbe6dc51` succeeded in `manual_copy` mode from render attempt `5de99c97-6cf0-4f76-9638-6b39b4a0ee7c`.
- Source output was `smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4`.
- Approved output was `smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`.
- Source and approved sizes were both `1950179` bytes.
- Source and approved SHA256 were both `97b066a05d2de5689d7158592912f0f8d3d8a37565891b04bcb5b96940b29b0b`.
- Promotion started at `2026-07-03 09:17:49.907529+00` and completed at `2026-07-03 09:17:49.92971+00`.
- Handoff `19614d06-6e0b-43bd-87c3-deb6829720ef` was created for promotion `1b9deb36-1468-436d-a2c5-2031dbe6dc51`.
- Handoff status was `ready_for_manual_publish`.
- Handoff by `Rino` at `2026-07-03 09:29:31.950085+00`.
- Handoff note explicitly states pilot smoke only and that no publication package, upload, publish, schedule, or cutover occurred.
- Draft and approved video files were present on server storage as evidence.
- Routes `/health`, `/content-items`, `/approved-videos`, and `/manual-publish-report` returned HTTP 200.
- Pilot containers remained running.

This was controlled approved draft promotion + handoff evidence. It was not manual publication package creation, social publishing, scheduler/publisher automation, OpenAI live runtime, public exposure, or cutover.

## Final Backup Evidence Summary

Owner-provided evidence records final post-promotion-handoff pilot backup:

- Backup directory: `/srv/pesona-studio/backups/psd-pilot-post-promotion-handoff-final-backup-20260703T093157Z`.
- Backup files recorded as evidence only: `approved-video-files.txt`, `baseline-evidence.txt`, `draft-video-files.txt`, `final-promotion-handoff-counts.txt`, `latest-approved-handoff.txt`, `latest-approved-promotion.txt`, `pilot-running-containers.txt`, `postgres-dump-list.txt`, `postgres-pilot-post-promotion-handoff-final.dump`, `route-status.txt`, `SHA256SUMS.txt`, `storage-archive-list.txt`, and `storage-pilot-post-promotion-handoff-final.tgz`.
- Backup directory size was `5.9M`.
- `/srv/pesona-studio` storage was `469G` size, `31M` used, and `445G` available.
- `sha256sum -c SHA256SUMS.txt` passed for listed final backup files.
- Storage archive listing included source demo footage, draft render, and approved video.
- PostgreSQL dump was readable via `pg_restore -l`, custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- No restore was performed.

## Outcome

Approved draft promotion is PASS.

Approved video copy is PASS. SHA256 source/approved match is PASS. DB-only handoff record is PASS. Handoff marked `ready_for_manual_publish` is PASS. Manual publication package remained `0` is PASS.

Final post-promotion-handoff backup is PASS. Final checksum validation is PASS. Final DB dump readability is PASS. Final storage archive readability is PASS.

Pilot remained running.

Manual publication package remains pending.

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
- No manual publication package creation.
- No publishing.
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
| Safety grep against changed docs only | PASS: expected sensitive/destructive/runtime/backup/restore/render/approval/promotion/handoff/publish terms appear only in evidence notes, warnings, non-goals, HOLD conditions, pending lists, or safety descriptions. |
| `git status --short --ignored` | PASS: docs/readme changes only, plus ignored local artifacts before commit. |

## Pending Execution List

The following remain pending and require separate owner approval:

- Manual publication package creation evidence.
- Manual publish checklist evidence.
- Manual publish report evidence.
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

Recommended next safe phase: manual publication package evidence, final restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
