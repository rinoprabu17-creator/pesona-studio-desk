# Phase 2H.17 Controlled Draft Review Approval + Post-Review Backup Evidence

## Phase Name

Phase 2H.17 Controlled Draft Review Approval + Post-Review Backup Evidence.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `f09f542`.
- Baseline tag: `phase-2h16-complete`.
- Current branch/state: `phase-2h17-controlled-draft-review-post-review-backup-evidence` with docs-only evidence changes not committed.
- This phase records owner-provided controlled draft review approval and post-review backup evidence only.

## Docs Created

- `docs/ops/CONTROLLED_DRAFT_REVIEW_EVIDENCE.md`
- `docs/ops/PILOT_POST_REVIEW_BACKUP_EVIDENCE.md`
- `docs/phase-2h17-controlled-draft-review-post-review-backup-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Controlled Draft Review Evidence Summary

Owner-provided evidence records DB-only controlled draft review approval on `psd_pilot`:

- Server: `pesona`.
- Repo path: `/srv/pesona-studio/repos/pesona-studio-desk`.
- Pilot project: `psd_pilot`.
- Web port: `3400`.
- Baseline tag on server: `phase-2h12-complete`.
- Git head on server: `ea4cc57120ebc9efa0a2d4f6d02079b73e23404f`.
- Git status short count: `0`.
- Reviewed render attempt: `5de99c97-6cf0-4f76-9638-6b39b4a0ee7c`.
- Render manifest ID: `3f6e89a4-477e-43a2-84db-f5bc0da2d953`.
- Video draft job ID: `5c6ac9b9-ad97-4a2f-a5bb-a0af39d7811b`.
- Content item ID: `38a94f4f-4411-485e-9825-faeeeccd08d6`.
- Attempt status was `succeeded`, attempt mode was `manual_smoke`, output size was `1950179`, FFmpeg exit code was `0`, and error message was empty.
- Draft video remained under `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4`.
- Review record `b94a495d-e857-4fe8-955b-93a2e58ffc46` was created with review status `approved`, reviewer `Rino`, reviewed at `2026-07-03 08:47:53.236638+00`.
- Review note explicitly says the approval is for pilot smoke evidence only, not final production content, not published, not uploaded, and not copied to approved-videos.
- Review/approval counts showed `video_render_attempts` 1, `video_render_attempt_reviews` 1, `video_render_approved_promotions` 0, `video_approved_handoff_records` 0, and `manual_publication_packages` 0.
- Approved-videos remained placeholder-only with `storage/approved-videos/.gitkeep`.
- No copy/promotion to approved-videos occurred.
- Routes `/health`, `/content-items`, `/approved-videos`, and `/manual-publish-report` returned HTTP 200.
- Pilot containers remained running.

This was DB-only pilot evidence. It was not production approval, approved-video promotion, approved handoff, manual publication package creation, social publishing, OpenAI live runtime, scheduler/publisher automation, public exposure, or cutover.

## Post-Review Backup Evidence Summary

Owner-provided evidence records post-review pilot backup:

- Backup directory: `/srv/pesona-studio/backups/psd-pilot-post-review-backup-20260703T084853Z`.
- Backup files recorded as evidence only: `approved-video-files.txt`, `baseline-evidence.txt`, `draft-video-files.txt`, `latest-render-attempt.txt`, `latest-render-review.txt`, `pilot-running-containers.txt`, `postgres-dump-list.txt`, `postgres-pilot-post-review.dump`, `review-counts.txt`, `route-status.txt`, `SHA256SUMS.txt`, `storage-archive-list.txt`, and `storage-pilot-post-review.tgz`.
- Backup directory size was `4.1M`.
- `/srv/pesona-studio` storage was `469G` size, `445G` available, and used about `17M`.
- `sha256sum -c SHA256SUMS.txt` passed for listed post-review backup files.
- Storage archive listing included the draft smoke MP4, source demo footage, `storage/approved-videos/.gitkeep`, and no approved render copy.
- PostgreSQL dump was readable via `pg_restore -l`, custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- No restore was performed.

## Outcome

Controlled draft review approval is PASS.

Review record created is PASS. Approved-videos remained placeholder-only is PASS. No promotion/handoff/package is PASS.

Post-review backup is PASS. Post-review checksum validation is PASS. Post-review DB dump readability is PASS. Post-review storage archive readability is PASS.

Pilot remained running.

No backup artifacts, rendered MP4s, storage artifacts, env files, secrets, or generated files were committed.

Cutover remains blocked.

## Safety Confirmations

- Docs-only/read-only release in this repo.
- No command run by Codex on Lenovo.
- No new command run by Codex on the `pesona` server.
- No production approval.
- No approved-video promotion.
- No approved handoff.
- No manual publication package creation.
- No publishing.
- No production backup.
- No restore.
- No restore dry-run.
- No deployment.
- No cutover.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No Docker Compose up/down by Codex.
- No container stop, restart, or mutation by Codex.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
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
| Safety grep against changed docs only | PASS: expected sensitive/destructive/runtime/backup/restore/render/approval/publish terms appear only in evidence notes, warnings, non-goals, HOLD conditions, pending lists, or safety descriptions. |
| `git status --short --ignored` | PASS: docs/readme changes only, plus ignored local artifacts before commit. |

## Pending Execution List

The following remain pending and require separate owner approval:

- Controlled approved-video promotion evidence.
- Controlled approved handoff evidence.
- Manual publication package creation evidence.
- Post-review backup restore dry-run planning in a separate isolated environment.
- Post-review backup restore dry-run execution.
- Controlled pilot operating review evidence.
- Production backup policy acceptance.
- Production-like backup evidence.
- Production restore planning.
- Storage copy.
- Deployment.
- Cutover Go/No-Go.
- Actual cutover.
- GPU driver installation.
- Public exposure or Cloudflare Tunnel.
- `systemd`, cron, or autostart setup.
- Automated backup.
- Scheduler, publisher, social API, OpenAI live runtime, upload automation, queue expansion, or worker daemon changes.

## Recommended Next Phase

Recommended next safe phase: controlled approved-video promotion evidence, post-review backup restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
