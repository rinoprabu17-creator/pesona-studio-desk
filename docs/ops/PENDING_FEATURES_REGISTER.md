# Pending Features Register

This register separates safe docs/read-only work from execution work. Every item below requires owner approval before implementation or operation.

| Category | Reason Pending | Risk Level | Prerequisites | Owner Approval Required | Recommended Future Phase |
| --- | --- | --- | --- | --- | --- |
| Office server actual deployment | Current phases only prepared docs and evidence templates | High | Technician evidence, backup plan, cutover plan | Yes | Local server deployment rehearsal execution |
| Backup execution | Backup SOP exists, but no backup was run in docs phases | High | Backup destination, access policy, operator | Yes | Backup evidence dry-run |
| Restore dry-run | Must use separate test environment and avoid active DB | High | Backup source, test DB, test storage path | Yes | Restore dry-run evidence phase |
| Storage copy/cutover | Storage contains operational media and must not be copied casually | High | Backup evidence, target SSD, owner window | Yes | Cutover rehearsal |
| Autostart/systemd/cron | Service startup policy not yet approved | Medium | Server deployment, owner operations policy | Yes | Server hardening phase |
| Cloudflare Tunnel/public exposure | Default is LAN-only; public access raises security risk | High | Security review, auth, owner approval | Yes | Remote access decision phase |
| Automated backup | Automation can damage or expose production data if wrong | High | Manual backup process proven, retention policy | Yes | Backup automation design phase |
| Scheduler/publisher/social API | Current publish process is manual evidence-based | High | Platform policy review, credentials, owner approval | Yes | Publishing integration research phase |
| OpenAI runtime automation | Local default avoids paid/live AI runtime behavior | Medium | Cost guard, secrets handling, owner approval | Yes | AI runtime governance phase |
| Queue/worker daemon expansion | Current docs pack does not add runtime behavior | Medium | Operational need, monitoring plan | Yes | Worker hardening phase |
| Monitoring/alerts | Useful later, but not needed for docs freeze | Medium | Deployment target, owner alert preference | Yes | Local ops monitoring phase |

## Phase 2H.1 Readiness Status

Owner reported these office server prerequisites as checked and OK:

- Ubuntu Server.
- Docker Engine + Compose plugin.
- Storage path to SSD 2TB.
- LAN access.
- UPS/power.

This status supports the next gated evidence step only. It does not remove the pending status of backup execution, restore dry-run, storage copy, deployment, cutover, public exposure, autostart/systemd/cron setup, automated backup, scheduler/publisher/social API activation, OpenAI runtime automation, queue expansion, or worker daemon changes.

## Phase 2H.2 Backup Evidence Planning Status

Phase 2H.2 adds backup evidence planning only:

- Backup sources to verify later.
- Backup destination options.
- Redacted evidence fields.
- Backup acceptance checklist.
- Sequence gate from accepted backup evidence through cutover.

This does not remove the pending status of backup execution, restore dry-run execution, storage copy, deployment, cutover, public exposure, autostart/systemd/cron setup, automated backup, scheduler/publisher/social API activation, OpenAI runtime automation, queue expansion, or worker daemon changes.

## Phase 2H.3 Backup Evidence Collection Pack Status

Phase 2H.3 adds collection templates only:

- Backup evidence collection rules.
- Safe paste and redaction guidance.
- PostgreSQL, Redis, storage, repo/tag, and destination evidence fields.
- Checksum/hash placeholder.
- Acceptance and owner review checklists.

This does not execute backup and does not remove the pending status of backup execution, restore dry-run planning/execution, storage copy, deployment, cutover, public exposure, autostart/systemd/cron setup, automated backup, scheduler/publisher/social API activation, OpenAI runtime automation, queue expansion, or worker daemon changes.

## Phase 2H.4 Office Server Bootstrap Verification Status

Phase 2H.4 adds a controlled bootstrap verification checklist only:

- OS, kernel, Docker, and Docker Compose evidence fields.
- Repo branch/tag/status evidence fields.
- SSD mount path and free disk space evidence fields.
- LAN-only and redacted IP evidence fields.
- `.env.local` existence and git tracking yes/no checks only.
- Docker Compose config pass/fail evidence.

This does not execute backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, autostart/systemd/cron setup, automated backup, scheduler/publisher/social API activation, OpenAI runtime automation, upload automation, queue expansion, or worker daemon changes.

## Phase 2H.5 Office Server Bootstrap Evidence Intake Status

Phase 2H.5 records owner-provided Lenovo bootstrap evidence only:

- Actual Lenovo server identity evidence.
- RAM evidence with 32GB target HOLD.
- Disk/storage evidence with 2TB SSD target HOLD.
- Docker Engine, Docker Compose, and non-sudo Docker access evidence.
- Existing container `0.0.0.0` bind caution without modification.
- Repo baseline at tag `phase-2h4-complete`, HEAD `2796057`, clean status.
- `.env.local` placeholder/template handling evidence without values.
- Docker Compose config pass evidence with storage warning.

Lenovo bootstrap is partial PASS with hardware/storage HOLD. This does not execute backup, restore, restore over active DB, restore dry-run execution, MP4/media read/copy/move/edit/rename/delete, storage copy, deployment, cutover, runtime smoke, `docker compose up`, public exposure, autostart/systemd/cron setup, automated backup, scheduler/publisher/social API activation, OpenAI runtime automation, upload automation, queue expansion, worker daemon changes, or existing Lenovo container changes.

## Phase 2H.6 Local Visual Demo Evidence Intake Status

Phase 2H.6 records laptop-only visual demo evidence:

- Docker Compose project `psd_visual_demo`.
- Host app URL `http://localhost:3300`.
- Synthetic demo content flow from calendar to controlled smoke draft render.
- Preflight result `ready`.
- Render attempt status `succeeded`.
- Approved/publish flow remained manual and inactive.
- `/approved-videos` showed no approved video.
- Host-port curl inconsistency warning with internal route checks returning HTTP 200.
- Demo env and generated demo media ignored and not committed.

This is not Lenovo readiness evidence, not production migration evidence, and not cutover evidence. It does not execute backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, social API activation, scheduler/publisher activation, upload automation, OpenAI live runtime, queue expansion, worker daemon expansion, or production/customer data/media use.

## Phase 2H.7 New Server Bootstrap Evidence Intake Status

Phase 2H.7 records owner-provided evidence for the new native Ubuntu server candidate named `pesona`:

- Native Ubuntu 22.04.5 LTS, kernel `5.15.0-185-generic`.
- Intel Core i5-13400F with 10 cores and 16 logical threads.
- RAM about `15Gi`; owner accepted 16GB with limit for initial use and deferred 32GB until the content system proves lead/order conversion.
- NVMe root disk SMART PASS and SATA SSD work storage mounted at `/srv/pesona-studio` with ext4 label `PSD_WORK`.
- HDD 1TB SMART PASS, candidate for backup/archive only.
- LAN and Tailscale evidence recorded; public exposure not approved.
- Docker non-sudo access for user `pesona` recorded as PASS.
- Existing unrelated containers were observed by owner but not stopped, restarted, or modified.
- Repo cloned at `/srv/pesona-studio/repos/pesona-studio-desk`, checked out at tag `phase-2h6-complete`, HEAD `3de1646`, clean status.
- `.env.local` created from template, ignored, and not tracked; env values were not pasted.
- `docker compose config --quiet` passed, but `docker compose up` was not executed.

New server bootstrap is a strong PASS for CPU, OS, Docker, storage mount, repo, env handling, and Compose config. GPU driver, runtime smoke, backup evidence, restore dry-run, and cutover remain HOLD. This phase does not execute server commands by Codex, backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, or existing container changes.

## Phase 2H.8 Isolated Server Runtime Smoke Evidence Intake Status

Phase 2H.8 records owner-provided isolated runtime smoke evidence for the new native Ubuntu server candidate `pesona`:

- Docker Compose project `psd_server_smoke`.
- Repo path `/srv/pesona-studio/repos/pesona-studio-desk`.
- Release baseline `phase-2h6-complete` at `3de1646`.
- Pre-start evidence showed existing containers on ports `3010`, `3020`, and `3030`; ports `3000`, `5432`, `5678`, and `6379` were free before smoke start.
- Owner manually started the isolated stack; Codex did not run server commands.
- Initial `/health` returned HTTP 200, while DB-backed routes returned HTTP 500 because the isolated smoke database had no schema.
- Migrations `001` through `018` were applied to the isolated smoke database; `psql \dt` then showed `30` tables.
- Basic and extended key routes returned HTTP 200 after migration.
- Runtime status showed `postgres` and `redis` healthy, with `web-app`, `n8n`, and worker containers up.
- Storage evidence showed `/srv/pesona-studio` on `/dev/sdb1` with `469G` total and `445G` available; repo `storage` size was `48K`.

Isolated server runtime smoke is PASS after migrations. This is not deployment, not production operation, and not cutover. The smoke stack binds ports to `0.0.0.0` and is visible to LAN/Tailscale, so public exposure remains not approved. GPU driver, backup evidence, restore dry-run, storage copy, deployment, and cutover remain HOLD. This phase does not execute new server commands by Codex, backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, production/customer data or media use, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.9 Controlled Smoke Stop Evidence Intake Status

Phase 2H.9 records owner-provided controlled stop evidence for the isolated server smoke project `psd_server_smoke` on `pesona`:

- Server path `/srv/pesona-studio/repos/pesona-studio-desk`.
- Owner used `docker compose --env-file .env.local -p psd_server_smoke -f docker-compose.dev.yml stop`.
- Stop result was `7/7` smoke containers stopped.
- Stopped containers: `psd_server_smoke-n8n-1`, `psd_server_smoke-video-worker-1`, `psd_server_smoke-web-app-1`, `psd_server_smoke-mockup-worker-1`, `psd_server_smoke-campaign-planner-worker-1`, `psd_server_smoke-postgres-1`, and `psd_server_smoke-redis-1`.
- Post-stop verification showed no running smoke containers and no listeners on ports `3000`, `5432`, `5678`, and `6379`.
- Post-stop `docker ps -a` showed all smoke containers exited. `psd_server_smoke-web-app-1` had `Exited (137)`, recorded as a stop warning only and not evidence of data loss.
- Smoke volumes remain present: `psd_server_smoke_n8n_data_dev`, `psd_server_smoke_postgres_data_dev`, and `psd_server_smoke_redis_data_dev`.
- No `docker compose down -v`, no `docker volume rm`, and no storage deletion was run.
- No backup, restore, restore dry-run, storage copy, deployment, public exposure, or cutover occurred.
- Smoke data and volumes should be considered preserved unless later verified otherwise.
- Existing non-smoke containers were not modified.

Controlled smoke stop is PASS. Phase 2H.8 runtime smoke evidence remains valid. This is not backup, restore, restore dry-run, storage copy, deployment, production operation, or cutover. This phase does not execute new server commands by Codex, backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.10 Controlled Smoke Backup Evidence Intake Status

Phase 2H.10 records owner-provided controlled smoke backup evidence for the isolated smoke project `psd_server_smoke` on `pesona`:

- Scope was isolated smoke stack only; this is not production backup, not restore, not restore dry-run, and not cutover.
- Repo path `/srv/pesona-studio/repos/pesona-studio-desk`, git head `76a9b0ca8ce9bb81c9043f8bda3b0881491c9146`, tag `phase-2h9-complete`, and git status short count `0`.
- Backup directory `/srv/pesona-studio/backups/psd-smoke-backup-20260702T075815Z`.
- Pre-backup and post-backup evidence showed no running smoke containers.
- Only `psd_server_smoke-postgres-1` was started for logical dump; Postgres readiness passed; Postgres was stopped again.
- `postgres-smoke.dump`, `postgres-table-list.txt`, `storage-smoke.tgz`, evidence text files, and `SHA256SUMS.txt` were created on the server backup path and must not be committed to Git.
- `/srv/pesona-studio` was mounted from `/dev/sdb1` with `469G` size and `445G` available; backup directory size was `196K`.
- `sha256sum -c SHA256SUMS.txt` passed for all listed files.
- `storage-smoke.tgz` was readable and listed expected placeholder storage paths.
- `postgres-smoke.dump` was readable via `pg_restore -l`; it was custom dump format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- No restore was performed.
- No `docker compose down -v`, no `docker volume rm`, and no storage deletion was run.

Controlled smoke backup evidence is PASS. Checksum verification, backup archive readability, and PostgreSQL dump listing readability are PASS. This is not production backup, restore, restore dry-run, storage copy, deployment, production operation, or cutover. This phase does not execute new server commands by Codex, production backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.11 Controlled Smoke Restore Dry-run Evidence Intake Status

Phase 2H.11 records owner-provided controlled smoke restore dry-run evidence on `pesona`:

- Restore dry-run was executed only against isolated Docker Compose project `psd_restore_dryrun`.
- Source backup `/srv/pesona-studio/backups/psd-smoke-backup-20260702T075815Z`.
- Restore root `/srv/pesona-studio/tmp/psd-smoke-restore-dryrun-20260702T083025Z`.
- Repo path `/srv/pesona-studio/repos/pesona-studio-desk`.
- This was not restore to active DB, not production restore, and not cutover.
- `sha256sum -c SHA256SUMS.txt` passed for all listed source backup files.
- Network `psd_restore_dryrun_default`, volume `psd_restore_dryrun_postgres_data_dev`, and container `psd_restore_dryrun-postgres-1` were created by owner during the dry-run.
- Postgres readiness check passed.
- `postgres-smoke.dump` was restored into isolated restore Postgres using `pg_restore`.
- Restored table list showed `30` public tables and table count validation returned `30`.
- `storage-smoke.tgz` was extracted into an isolated tmp restore path and listed expected storage placeholder paths.
- Restore dry-run Postgres was stopped after validation; post-stop running containers for `psd_restore_dryrun` were none; `psd_restore_dryrun-postgres-1` exited with code `0`.
- Restore volume was preserved; no `docker compose down -v`, no `docker volume rm`, and no storage deletion was run.
- Evidence files were created on the server restore evidence path and must not be committed to Git.
- `/srv/pesona-studio` was mounted from `/dev/sdb1` with `469G` size and `445G` available; restore evidence root size was `80K`.

Controlled smoke restore dry-run is PASS. Backup checksum validation, database restore validation, storage archive extraction validation, and restore target stopped safely are PASS. This is not production restore, restore to active DB, storage copy, deployment, production operation, or cutover. This phase does not execute new server commands by Codex, production backup, production restore, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.12 Pilot Readiness Gate + Operating Policy Status

Phase 2H.12 adds a pilot readiness gate and server operating policy for the new native Ubuntu server candidate `pesona`:

- Baseline tag `phase-2h11-complete`.
- Runtime smoke PASS from Phase 2H.8 remains valid.
- Controlled smoke stop PASS from Phase 2H.9 remains valid.
- Controlled smoke backup PASS from Phase 2H.10 remains valid.
- Controlled smoke restore dry-run PASS from Phase 2H.11 remains valid.
- New server bootstrap and storage evidence remain strong PASS for pilot readiness discussion.
- RAM `16GB` is accepted with limit for initial pilot; upgrade to `32GB` remains deferred until lead/order value is proven.
- Pilot entry criteria require owner-confirmed scope, LAN/Tailscale-only access, no public tunnel, no irreversible automation, manual publish default, accepted backup plan, and identified responsible operator.
- Pilot non-goals include no cutover, no public exposure, no social API/publisher, no OpenAI live runtime, and no production restore.

GPU driver, production backup policy, autostart/systemd, public exposure, scheduler/publisher/social API, OpenAI live runtime, and final cutover remain HOLD.

This phase does not execute server commands by Codex, backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, Docker Compose up/down, container mutation, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.13 Controlled Pilot Start Evidence Intake Status

Phase 2H.13 records owner-provided controlled pilot start evidence for the new native Ubuntu server candidate `pesona`:

- Server repo path `/srv/pesona-studio/repos/pesona-studio-desk`.
- Release tag `phase-2h12-complete`, HEAD `ea4cc57`, and clean git status before pilot start.
- Existing non-PSD containers on ports `3010`, `3020`, and `3030` were not stopped or modified.
- Temporary pilot override file existed at `/srv/pesona-studio/tmp/psd-pilot-compose.override.yml` and must not be committed to Git.
- Override published only web-app host port `3400`; Postgres, Redis, and n8n host port publishing were removed.
- Override kept `CAMPAIGN_PLANNER_PROVIDER=fake`, `CAMPAIGN_PLANNER_OPENAI_ENABLED=false`, and `OPENAI_MODEL=""`.
- Docker Compose config evidence showed only `web-app` published on host port `3400`; no host ports for `3000`, `5432`, `5678`, or `6379`.
- Pilot project `psd_pilot` started with Postgres and Redis first, then full stack with build.
- Pilot database migrations `001` through `018` applied successfully.
- Runtime status showed `web-app` published on `0.0.0.0:3400->3000/tcp`, while n8n, Postgres, and Redis were internal-only.
- Eight route checks on `127.0.0.1:3400` returned HTTP 200.
- Post-start host listener evidence showed PSD pilot web on `3400` plus existing `3010`, `3020`, and `3030`, with no listeners on `3000`, `5432`, `5678`, or `6379`.
- `/srv/pesona-studio` remained mounted on `/dev/sdb1` with `469G` size and `445G` available; repo storage usage was `48K`.
- Owner may review through LAN/Tailscale at `http://100.120.79.33:3400/content-calendar`.

Controlled pilot start is PASS. Route check, port isolation, and fake/local provider are PASS. Manual publish remains default. Public exposure remains not approved. This is not cutover approval and does not authorize social API, scheduler, publisher, upload automation, OpenAI live runtime, production backup, restore, restore dry-run, storage copy, or final deployment.

This phase does not execute new server commands by Codex, production backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, Docker Compose up/down by Codex, container mutation by Codex, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.14 Pilot Backup Policy + First Pilot Backup Evidence Status

Phase 2H.14 records pilot backup policy and owner-provided first pilot backup evidence for controlled pilot stack `psd_pilot` on `pesona`:

- Backup was executed for controlled pilot stack `psd_pilot`.
- This is pilot backup evidence, not production backup and not cutover.
- No restore was performed.
- No restore dry-run was performed.
- Pilot stack remained running after backup.
- Server repo path `/srv/pesona-studio/repos/pesona-studio-desk`.
- Git head `ea4cc57120ebc9efa0a2d4f6d02079b73e23404f`, tag `phase-2h12-complete`, and git status short count `0`.
- Backup directory `/srv/pesona-studio/backups/psd-pilot-backup-20260702T091559Z`.
- Pilot running container evidence showed n8n, web-app, campaign planner worker, mockup worker, video worker, Postgres, and Redis up; web remained on `0.0.0.0:3400->3000/tcp`, Postgres and Redis internal-only.
- Pilot route check, Postgres readiness, PostgreSQL custom dump, table list, table count, storage archive, and checksum evidence were created on the server backup path and must not be committed to Git.
- `sha256sum -c SHA256SUMS.txt` passed for listed pilot backup files.
- `storage-pilot.tgz` was readable and listed expected placeholder storage paths.
- `postgres-pilot.dump` was readable via `pg_restore -l`, custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- `/srv/pesona-studio` remained mounted from `/dev/sdb1` with `469G` size and `445G` available; backup directory size was `212K`.

Pilot backup policy requires manual pilot backup before pilot data is considered important and before any meaningful real content or test campaign data entry. Backup artifacts must stay outside Git. Restore dry-run for pilot backup is a separate phase. Cutover remains blocked.

First pilot backup evidence is PASS. Checksum verification, storage archive readability, and PostgreSQL dump readability are PASS. This phase does not execute new server commands by Codex, production backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, Docker Compose up/down by Codex, container mutation by Codex, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.15 Pilot UI Flow + Post-Entry Backup Evidence Status

Phase 2H.15 records owner-provided controlled pilot UI flow evidence and post-entry pilot backup evidence for `psd_pilot` on `pesona`:

- Pilot URL used: `http://100.120.79.33:3400`.
- One pilot campaign was created: `Desain Gratis - Pilot`, code `PILOT-DESAIN-GRATIS-01`, date range `2026-07-02` to `2026-07-31`, status `Aktif`.
- One content item was created: `PILOT-DESAIN-GRATIS-01-D01`, `Pilot Test - Sampul Raport Desain Gratis`, planned date `2026-07-03`, production status `planned`.
- One script plan exists and four shot steps were created.
- One video draft metadata job was created with status `draft_requested`, target format `vertical_9_16`, duration target `15`, planned output label `Pilot Test Sampul Raport - Draft 1`, and render mode `disabled_metadata_only`.
- DB count evidence after UI flow showed `campaigns` 1, `content_items` 1, `content_publications` 0, `footage_assets` 0, `content_item_script_plans` 1, `content_item_shot_plan_steps` 4, `video_draft_jobs` 1, `video_render_manifests` 0, `video_render_attempts` 0, and `manual_publication_packages` 0.
- Route evidence after UI flow returned HTTP 200 for `/health`, `/content-calendar`, `/content-items`, `/approved-videos`, `/publication-packages`, `/manual-publish-report`, and `/manual-publish-closeouts`.
- Post-entry backup directory `/srv/pesona-studio/backups/psd-pilot-post-ui-backup-20260702T101832Z` was recorded as evidence only.
- Post-entry backup checksum verification, storage archive readability, and PostgreSQL dump readability are PASS.
- Pilot remained running after backup.

Pilot UI flow evidence is PASS. Post-entry backup evidence is PASS. No render was executed, no footage was selected or uploaded, no render manifest was created, no render attempt was executed, and no manual publication package was created. This phase does not execute new server commands by Codex, production backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, Docker Compose up/down by Codex, container mutation by Codex, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.16 Controlled Demo Footage + Render + Post-Render Backup Evidence Status

Phase 2H.16 records owner-provided controlled demo footage, controlled smoke render, and post-render backup evidence for `psd_pilot` on `pesona`:

- Synthetic demo footage was created under `storage/footage/pilot-demo/pilot-sampul-raport-demo-001.mp4`; it was generated with `ffmpeg testsrc2`, vertical `720x1280`, around `5` seconds, about `2.0M`, and not production footage.
- Footage asset was scanned/cataloged, approved/reviewed, selected for `PILOT-DESAIN-GRATIS-01-D01`, and linked to all four shot steps.
- Render manifest `3f6e89a4-477e-43a2-84db-f5bc0da2d953` was created and approved; latest preflight `a3463232-1c80-431c-82ee-2915ba6e066b` was ready.
- Controlled smoke render attempt `5de99c97-6cf0-4f76-9638-6b39b4a0ee7c` succeeded in `manual_smoke` mode with FFmpeg exit code `0`.
- Draft output was `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4`, size `1950179` bytes; this rendered MP4 is a server storage artifact and is not committed to Git.
- Render DB count evidence showed `video_render_manifests` 1, `video_render_manifest_items` 4, `video_render_preflight_runs` 2, `video_render_attempts` 1, `video_render_attempt_reviews` 0, `video_approved_handoff_records` 0, and `manual_publication_packages` 0.
- Routes `/health`, `/content-items`, `/approved-videos`, and `/manual-publish-report` returned HTTP 200.
- First attempted post-render backup failed due wrong query column `status`; actual column is `attempt_status`. The corrected successful backup directory was `/srv/pesona-studio/backups/psd-pilot-post-render-backup-20260703T081638Z`.
- Post-render backup checksum verification, storage archive readability, and PostgreSQL dump readability are PASS.
- Pilot remained running after render and backup.

Controlled demo footage creation, footage metadata/catalog, footage selection, shot step footage linking, render manifest/preflight, controlled smoke render, draft MP4 creation, post-render backup, checksum validation, DB dump readability, and storage archive readability are PASS. This phase does not execute new server commands by Codex, production render, approval/promotion, manual publish package creation, production backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, Docker Compose up/down by Codex, container mutation by Codex, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.17 Controlled Draft Review Approval + Post-Review Backup Evidence Status

Phase 2H.17 records owner-provided DB-only controlled draft review approval and post-review backup evidence for `psd_pilot` on `pesona`:

- Render attempt `5de99c97-6cf0-4f76-9638-6b39b4a0ee7c` was reviewed. It remained a `succeeded` `manual_smoke` attempt with output `smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4`, output size `1950179`, and FFmpeg exit code `0`.
- Review record `b94a495d-e857-4fe8-955b-93a2e58ffc46` was created with status `approved`, reviewer `Rino`, and reviewed at `2026-07-03 08:47:53.236638+00`.
- Review note explicitly limits approval to pilot smoke evidence only and states it is not final production content, not published, not uploaded, and not copied to approved-videos.
- Review/approval counts showed `video_render_attempts` 1, `video_render_attempt_reviews` 1, `video_render_approved_promotions` 0, `video_approved_handoff_records` 0, and `manual_publication_packages` 0.
- Approved-videos remained placeholder-only with `storage/approved-videos/.gitkeep`; no copy/promotion to approved-videos occurred.
- Routes `/health`, `/content-items`, `/approved-videos`, and `/manual-publish-report` returned HTTP 200.
- Post-review backup directory `/srv/pesona-studio/backups/psd-pilot-post-review-backup-20260703T084853Z` was recorded as evidence only.
- Post-review backup checksum verification, storage archive readability, and PostgreSQL dump readability are PASS.
- Pilot remained running after review and backup.

Controlled draft review approval, review record creation, approved-videos placeholder-only check, no promotion/handoff/package check, post-review backup, checksum validation, DB dump readability, and storage archive readability are PASS. This phase does not execute new server commands by Codex, production approval, approved-video promotion, approved handoff, manual publication package creation, production backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, Docker Compose up/down by Codex, container mutation by Codex, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.18 Controlled Approved Draft Promotion + Handoff + Final Backup Evidence Status

Phase 2H.18 records owner-provided controlled approved draft promotion, DB-only approved-video handoff, and final post-promotion-handoff backup evidence for `psd_pilot` on `pesona`:

- Promotion record `1b9deb36-1468-436d-a2c5-2031dbe6dc51` succeeded in `manual_copy` mode from render attempt `5de99c97-6cf0-4f76-9638-6b39b4a0ee7c`.
- Source output `smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4` was copied to approved output `smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`.
- Source and approved output sizes both showed `1950179` bytes, with matching SHA256 `97b066a05d2de5689d7158592912f0f8d3d8a37565891b04bcb5b96940b29b0b`.
- DB-only handoff record `19614d06-6e0b-43bd-87c3-deb6829720ef` was created with status `ready_for_manual_publish`, handoff by `Rino`, and handoff at `2026-07-03 09:29:31.950085+00`.
- Final counts showed `video_render_attempts` 1, `video_render_attempt_reviews` 1, `video_render_approved_promotions` 1, `video_approved_handoff_records` 1, and `manual_publication_packages` 0.
- Routes `/health`, `/content-items`, `/approved-videos`, and `/manual-publish-report` returned HTTP 200.
- Final backup directory `/srv/pesona-studio/backups/psd-pilot-post-promotion-handoff-final-backup-20260703T093157Z` was recorded as evidence only.
- Final checksum validation, DB dump readability, and storage archive readability are PASS.
- Pilot remained running after promotion, handoff, and final backup.

Controlled approved draft promotion, approved video copy, SHA256 match, DB-only handoff record, handoff marked `ready_for_manual_publish`, manual publication package count remaining `0`, final backup, checksum validation, DB dump readability, and storage archive readability are PASS. This phase does not execute new server commands by Codex, production backup, restore, restore dry-run execution, storage copy from Codex, deployment, cutover, public exposure, Cloudflare Tunnel, Docker Compose up/down by Codex, container mutation by Codex, manual publication package creation, publishing, social API activation, scheduler/publisher activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.19 Controlled Manual Publication Package + Post-Package Backup Evidence Status

Phase 2H.19 records owner-provided controlled manual publication package and post-package backup evidence for `psd_pilot` on `pesona`:

- Scope was controlled manual publication package evidence only.
- Package creation was DB-only from the approved-video handoff.
- One manual publication package and four channel rows were created.
- Package status remains `draft_package`.
- Channel rows remain `draft_channel`.
- No manual publish evidence log was created.
- No closeout was created.
- No upload, publish, schedule, social API, OpenAI live runtime, public exposure, or cutover occurred.
- Post-package backup directory `/srv/pesona-studio/backups/psd-pilot-post-manual-package-backup-20260704T045148Z` was recorded as owner-provided evidence.
- Checksum validation PASS, PostgreSQL dump readability PASS, and storage archive readability PASS.
- Pilot remained running.

Manual publish evidence log and closeout remain pending. Cutover remains blocked.

This phase does not execute new server commands by Codex, production backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, Docker Compose up/down by Codex, container mutation by Codex, actual publishing, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, manual publish evidence log creation, closeout creation, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.21 Controlled Manual Evidence Log Sandbox + Post-Evidence-Log Backup Evidence Status

Phase 2H.21 records owner-provided controlled manual evidence log sandbox and post-evidence-log backup evidence for `psd_pilot` on `pesona`:

- Scope was controlled manual evidence log sandbox evidence only.
- Evidence logs were DB-only.
- Manual publish evidence log count increased to `2`.
- Intended Facebook `admin_note` log `cd2bba56-ea9e-4035-a24d-4a70c4a8479f` was recorded with value `PILOT_SMOKE_NO_PUBLISH`.
- Accidental blank YouTube `admin_note` log `0b4b5ff2-c994-46d9-8f1c-e5c6743a336c` was recorded as a harmless DB-only anomaly.
- The blank YouTube anomaly has no evidence value, no evidence note, and no recorded-by name.
- The blank YouTube anomaly has no publish URL, no publish timestamp, no package status change, and no closeout.
- The blank YouTube anomaly was not deleted, fixed, hidden, or mutated by Codex.
- Package `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` remains `ready_manual_publish`.
- No closeout was created.
- No checklist item was marked done.
- No upload, publish, schedule, social API, OpenAI live runtime, public exposure, or cutover occurred.
- Post-evidence-log backup directory `/srv/pesona-studio/backups/psd-pilot-post-manual-evidence-log-sandbox-backup-20260704T060835Z` was recorded as owner-provided evidence.
- Checksum validation PASS, PostgreSQL dump readability PASS, and storage archive readability PASS.
- Pilot remained running.

Manual publish closeout remains pending. Cutover remains blocked.

This phase does not execute new server commands by Codex, production backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, Docker Compose up/down by Codex, container mutation by Codex, actual publishing, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, closeout creation, anomaly deletion/fix/mutation, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Phase 2H.20 Controlled Manual Publish Readiness + Checklist Board + Post-Checklist Backup Evidence Status

Phase 2H.20 records owner-provided controlled manual publish readiness, checklist board, and post-readiness checklist backup evidence for `psd_pilot` on `pesona`:

- Scope was controlled manual publish readiness and checklist board evidence only.
- Readiness/checklist actions were DB-only.
- Package `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` was marked `ready_manual_publish`.
- `ready_at` was recorded as `2026-07-04 05:29:44.13736+00`.
- 32 checklist items were created.
- Four channels each have eight checklist items.
- All checklist items remain `pending`.
- All checklist `is_done` values remain `false`.
- No manual publish evidence log was created.
- No closeout was created.
- No manual publish URL or proof was recorded.
- No upload, publish, schedule, social API, OpenAI live runtime, public exposure, or cutover occurred.
- Post-readiness checklist backup directory `/srv/pesona-studio/backups/psd-pilot-post-manual-readiness-checklist-backup-20260704T054533Z` was recorded as owner-provided evidence.
- Checksum validation PASS, PostgreSQL dump readability PASS, and storage archive readability PASS.
- Pilot remained running.

Manual publish evidence log and closeout remain pending. Cutover remains blocked.

This phase does not execute new server commands by Codex, production backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, Docker Compose up/down by Codex, container mutation by Codex, actual publishing, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, manual publish evidence log creation, closeout creation, app/runtime code changes, migration file changes, or `scripts/prepare-test-db.mjs` changes.

## Current Safe Work

- Docs-only audit.
- Read-only route checks.
- Read-only DB counts.
- Storage listing by filename/size.
- Owner review preparation.
- New server Docker non-sudo verification and isolated runtime smoke planning, only after explicit owner approval.
- Server smoke review and controlled stop procedure planning, only after explicit owner approval.
- Backup evidence acceptance or controlled backup dry-run planning, only after explicit owner approval.
- Restore dry-run planning in a separate isolated environment, only after explicit owner approval.
- Owner Go/No-Go planning for cutover readiness review or production backup policy review, only after explicit owner approval.
- Controlled pilot start procedure planning or production backup policy review, only after explicit owner approval.
- Controlled pilot review and operating evidence, only after explicit owner approval.
- Pilot backup restore dry-run planning in a separate isolated environment, only after explicit owner approval.
- Post-entry pilot backup restore dry-run planning in a separate isolated environment, only after explicit owner approval.
- Post-render pilot backup restore dry-run planning in a separate isolated environment, only after explicit owner approval.
- Controlled approval/promotion evidence, only after explicit owner approval.
- Post-review pilot backup restore dry-run planning in a separate isolated environment, only after explicit owner approval.
- Controlled approved-video promotion and approved handoff evidence, only after explicit owner approval.
- Final post-promotion-handoff pilot backup restore dry-run planning in a separate isolated environment, only after explicit owner approval.
- Manual publish closeout evidence after manual evidence log sandbox, only after explicit owner approval.
- Post-readiness checklist pilot backup restore dry-run planning in a separate isolated environment, only after explicit owner approval.
- Post-evidence-log pilot backup restore dry-run planning in a separate isolated environment, only after explicit owner approval.

## Execution Work Still Pending

- Deployment.
- Backup.
- Restore.
- Storage copy.
- Cutover.
- Public exposure.
- Runtime automation.
- Controlled pilot runtime execution.
- Production backup policy acceptance.
- Treating pilot start as cutover or public exposure approval.
- Treating first pilot backup evidence as restore, restore dry-run, production backup, cutover, or public exposure approval.
- Treating pilot UI flow evidence as render execution, social publishing, production operation, cutover, or public exposure approval.
- Treating post-entry pilot backup evidence as restore, restore dry-run, production backup, cutover, or public exposure approval.
- Treating controlled demo render evidence as production render, approval/promotion, manual publish package creation, social publishing, production operation, cutover, or public exposure approval.
- Treating post-render pilot backup evidence as restore, restore dry-run, production backup, cutover, public exposure, approval/promotion, or publishing approval.
- Treating controlled draft review evidence as production approval, approved-video promotion, approved handoff, manual publication package creation, publishing, production operation, cutover, or public exposure approval.
- Treating post-review pilot backup evidence as restore, restore dry-run, production backup, cutover, public exposure, promotion, handoff, or publishing approval.
- Treating controlled approved draft promotion handoff evidence as manual publication package creation, upload, publishing, scheduler operation, social API activation, production operation, cutover, or public exposure approval.
- Treating final post-promotion-handoff pilot backup evidence as restore, restore dry-run, production backup, cutover, public exposure, storage copy from Codex, manual publication package creation, or publishing approval.
- Treating controlled manual publication package evidence as actual upload, publishing, scheduler operation, social API activation, production operation, public exposure, manual publish evidence log creation, closeout creation, or cutover approval.
- Treating post-manual-package pilot backup evidence as restore, restore dry-run, production backup, cutover, public exposure, storage copy from Codex, actual publishing, manual publish evidence log creation, or closeout creation approval.
- Treating controlled manual publish readiness checklist evidence as actual upload, publishing, scheduler operation, social API activation, production operation, public exposure, manual publish evidence log creation, closeout creation, or cutover approval.
- Treating post-manual-readiness checklist pilot backup evidence as restore, restore dry-run, production backup, cutover, public exposure, storage copy from Codex, actual publishing, manual publish evidence log creation, or closeout creation approval.
- Treating controlled manual evidence log sandbox evidence as actual upload, publishing, real publish proof, scheduler operation, social API activation, production operation, public exposure, blank YouTube anomaly deletion/fix/mutation, closeout creation, or cutover approval.
- Treating post-manual-evidence-log sandbox pilot backup evidence as restore, restore dry-run, production backup, cutover, public exposure, storage copy from Codex, actual publishing, blank YouTube anomaly deletion/fix/mutation, or closeout creation approval.
