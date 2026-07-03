# Phase 2H.16 Controlled Demo Footage + Render + Post-Render Backup Evidence

## Phase Name

Phase 2H.16 Controlled Demo Footage + Render + Post-Render Backup Evidence.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `7045ac6`.
- Baseline tag: `phase-2h15-complete`.
- Current branch/state: `phase-2h16-controlled-demo-render-post-render-backup-evidence` with docs-only evidence changes not committed.
- This phase records owner-provided controlled demo footage, render, and post-render backup evidence only.

## Docs Created

- `docs/ops/CONTROLLED_DEMO_RENDER_EVIDENCE.md`
- `docs/ops/PILOT_POST_RENDER_BACKUP_EVIDENCE.md`
- `docs/phase-2h16-controlled-demo-render-post-render-backup-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Controlled Demo Render Evidence Summary

Owner-provided evidence records controlled demo footage and render on `psd_pilot`:

- Server: `pesona`.
- Repo path: `/srv/pesona-studio/repos/pesona-studio-desk`.
- Pilot project: `psd_pilot`.
- Web port: `3400`.
- Baseline tag on server: `phase-2h12-complete`.
- Git head on server: `ea4cc57120ebc9efa0a2d4f6d02079b73e23404f`.
- Git status short count: `0`.
- Synthetic demo footage was created under `storage/footage/pilot-demo/pilot-sampul-raport-demo-001.mp4`.
- Demo footage was `720x1280`, vertical `9:16`, around `5` seconds, about `2.0M`, generated with `ffmpeg testsrc2` inside the pilot `web-app` container, and not production footage.
- Footage asset was scanned/cataloged, approved/reviewed, and selected for content `PILOT-DESAIN-GRATIS-01-D01`.
- Initial DB counts showed `footage_assets` 1, `content_item_footage_selections` 1, `content_item_shot_plan_steps` 4, `video_draft_jobs` 1, `video_render_manifests` 0, and `video_render_attempts` 0.
- Four shot steps were linked to the selected footage, and each used `pilot-demo/pilot-sampul-raport-demo-001.mp4`.
- Render manifest `3f6e89a4-477e-43a2-84db-f5bc0da2d953` was created and approved for content `PILOT-DESAIN-GRATIS-01-D01`.
- Latest preflight `a3463232-1c80-431c-82ee-2915ba6e066b` was ready. Earlier warning `manifest_status_draft` was resolved by approving the manifest.
- Controlled smoke render was run manually from the UI.
- Render attempt `5de99c97-6cf0-4f76-9638-6b39b4a0ee7c` succeeded with attempt mode `manual_smoke`.
- Output was `smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4`.
- Output physical file was `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4`.
- Output size was `1950179` bytes, FFmpeg exit code was `0`, and started/completed time was `2026-07-03 08:03:15 UTC`.
- Rerender was blocked because output already exists and overwrite is not allowed. This is expected and safe.
- Render DB counts after render showed `video_render_manifests` 1, `video_render_manifest_items` 4, `video_render_preflight_runs` 2, `video_render_attempts` 1, `video_render_attempt_reviews` 0, `video_approved_handoff_records` 0, and `manual_publication_packages` 0.
- Routes `/health`, `/content-items`, `/approved-videos`, and `/manual-publish-report` returned HTTP 200.
- Pilot containers remained running.

This was not production render, approved video promotion, manual publish package creation, social publishing, OpenAI live runtime, scheduler/publisher automation, or cutover.

## Post-Render Backup Evidence Summary

Owner-provided evidence records successful post-render pilot backup:

- First attempted post-render backup failed due wrong query column `status`; actual column is `attempt_status`. This was corrected. The failed partial folder is partial evidence only and must not be committed.
- Successful backup directory: `/srv/pesona-studio/backups/psd-pilot-post-render-backup-20260703T081638Z`.
- Backup files recorded as evidence only: `baseline-evidence.txt`, `draft-video-files.txt`, `latest-render-attempt.txt`, `pilot-running-containers.txt`, `postgres-dump-list.txt`, `postgres-pilot-post-render.dump`, `render-counts.txt`, `route-status.txt`, `SHA256SUMS.txt`, `storage-archive-list.txt`, and `storage-pilot-post-render.tgz`.
- Backup directory size was `4.1M`.
- `sha256sum -c SHA256SUMS.txt` passed for listed post-render backup files.
- Storage archive listing included the source demo footage and rendered draft video.
- PostgreSQL dump was readable via `pg_restore -l`, custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- No restore was performed.

## Outcome

Controlled demo footage creation is PASS.

Footage metadata/catalog is PASS. Footage selection is PASS. Shot step footage linking is PASS. Render manifest and preflight are PASS. Controlled smoke render is PASS. Draft MP4 creation is PASS.

Post-render backup is PASS. Post-render checksum validation is PASS. Post-render DB dump readability is PASS. Post-render storage archive readability is PASS.

Pilot remained running.

No backup artifacts, rendered MP4s, storage artifacts, env files, secrets, or generated files were committed.

Cutover remains blocked.

## Safety Confirmations

- Docs-only/read-only release in this repo.
- No command run by Codex on Lenovo.
- No new command run by Codex on the `pesona` server.
- No production render.
- No approval/promotion.
- No manual publish package creation.
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

- Controlled approval/promotion evidence.
- Manual publish package creation evidence.
- Post-render backup restore dry-run planning in a separate isolated environment.
- Post-render backup restore dry-run execution.
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

Recommended next safe phase: controlled approval/promotion evidence, post-render backup restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
