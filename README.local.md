# Pesona Studio Desk - Local Development

Dokumen ini untuk menjalankan skeleton Phase 0 dari laptop dan menjadi acuan awal deployment local-first di kantor.

## Target server lokal kantor

MVP awal tidak membutuhkan VPS. Target operasional adalah server lokal kantor:

- Lenovo i7-7700
- Ubuntu Server
- RAM target 32GB
- SSD target 2TB sebagai storage kerja utama
- UPS
- Tanpa GPU pada fase awal
- Operasional sekitar 08.00-20.00, tidak wajib 24 jam

Google Drive dipakai untuk backup/sharing file penting, bukan sebagai storage kerja utama footage/output. Desain final PDF tetap dipegang admin desain terpisah dan tidak menjadi core storage Studio Desk.

Phase 2H.7 juga mencatat kandidat server native Ubuntu baru bernama `pesona` dengan CPU i5-13400F, RAM 16GB diterima dengan limit awal, storage kerja SATA SSD 512GB di `/srv/pesona-studio`, Docker non-sudo PASS, repo baseline `phase-2h6-complete`, dan Compose config PASS. Kandidat ini belum cutover: GPU driver, runtime smoke, backup evidence, restore dry-run, dan cutover tetap HOLD.

Phase 2H.8 mencatat owner-provided isolated server runtime smoke untuk `pesona` dengan Compose project `psd_server_smoke`. Stack bisa build/start dan route kunci PASS setelah migration isolated smoke DB diterapkan. Ini bukan cutover: public exposure tidak approved, GPU driver tetap HOLD, dan backup/restore/cutover tetap HOLD.

Phase 2H.9 mencatat owner-provided controlled smoke stop untuk `psd_server_smoke`: 7/7 container smoke berhenti dengan `docker compose stop`, tidak ada container smoke yang masih running, port `3000/5432/5678/6379` tidak listening, dan volume smoke tetap preserved. Tidak ada `down -v`, `docker volume rm`, atau storage deletion. Runtime smoke Phase 2H.8 tetap valid; cutover tetap blocked.

Phase 2H.10 mencatat owner-provided controlled smoke backup evidence untuk `psd_server_smoke` saja: checksum verification PASS, `storage-smoke.tgz` readable, dan `postgres-smoke.dump` readable via `pg_restore -l`. Ini bukan production backup, bukan restore, bukan restore dry-run, dan bukan cutover.

Phase 2H.11 mencatat owner-provided controlled smoke restore dry-run evidence untuk project isolated `psd_restore_dryrun`: backup checksum PASS, database restore ke Postgres isolated PASS dengan 30 tabel, storage archive extraction PASS, dan target restore berhenti aman. Ini bukan production restore, bukan restore ke active DB, dan bukan cutover.

Phase 2H.12 menambahkan pilot readiness gate dan server operating policy untuk kandidat `pesona`. Runtime smoke, controlled stop, smoke backup, dan smoke restore dry-run sudah PASS; RAM 16GB diterima dengan limit awal. Gate ini hanya untuk owner/operator readiness: akses tetap LAN/Tailscale-only, manual publish tetap default, backup plan harus diterima sebelum pilot data dianggap penting, dan cutover tetap blocked.

Phase 2H.13 mencatat owner-provided controlled pilot start evidence untuk `pesona` dengan project `psd_pilot`: release tag `phase-2h12-complete`, web hanya dipublish ke host port `3400`, Postgres/Redis/n8n internal-only, fake/local Campaign Planner provider, migration `001` sampai `018` applied, dan 8 route check HTTP 200. Ini bukan deployment/cutover approval: public exposure tidak approved, manual publish tetap default, production backup/restore/storage copy tidak dilakukan, dan cutover tetap blocked.

Phase 2H.14 mencatat pilot backup policy dan first pilot backup evidence untuk project `psd_pilot`: backup directory `/srv/pesona-studio/backups/psd-pilot-backup-20260702T091559Z`, pilot stack tetap running, checksum verification PASS, `storage-pilot.tgz` readable, dan `postgres-pilot.dump` readable via `pg_restore -l`. Ini pilot backup evidence, bukan production backup, bukan restore, bukan restore dry-run, dan bukan cutover.

Phase 2H.15 mencatat owner-provided controlled pilot UI flow evidence dan post-entry pilot backup evidence untuk project `psd_pilot`: satu pilot campaign, satu content item, satu script plan, empat shot steps, dan satu metadata-only video draft job tercatat; tidak ada render, footage upload/selection, render manifest, render attempt, atau manual publication package. Post-entry backup directory `/srv/pesona-studio/backups/psd-pilot-post-ui-backup-20260702T101832Z` tercatat dengan checksum PASS, `storage-pilot-post-ui.tgz` readable, dan `postgres-pilot-post-ui.dump` readable via `pg_restore -l`. Pilot tetap running. Ini bukan production backup, bukan restore, bukan restore dry-run, bukan deployment, bukan public exposure, dan bukan cutover.

Phase 2H.16 mencatat owner-provided controlled demo footage, controlled smoke render, dan post-render backup evidence untuk project `psd_pilot`: synthetic demo footage dipakai untuk empat shot steps, render manifest/preflight PASS, render attempt `manual_smoke` succeeded, draft MP4 dibuat di storage server, dan post-render backup directory `/srv/pesona-studio/backups/psd-pilot-post-render-backup-20260703T081638Z` checksum/readability PASS. Ini bukan production render, bukan approval/promotion, bukan manual publish package, bukan production backup, bukan restore, bukan restore dry-run, bukan deployment, bukan public exposure, dan bukan cutover.

Phase 2H.17 mencatat owner-provided controlled draft review approval dan post-review backup evidence untuk project `psd_pilot`: render attempt smoke disetujui DB-only sebagai evidence pilot, review record tercatat, approved-videos tetap placeholder-only, tidak ada promotion/handoff/manual publication package, dan post-review backup directory `/srv/pesona-studio/backups/psd-pilot-post-review-backup-20260703T084853Z` checksum/readability PASS. Ini bukan production approval, bukan approved-video promotion, bukan approved handoff, bukan manual publish package, bukan production backup, bukan restore, bukan restore dry-run, bukan deployment, bukan public exposure, dan bukan cutover.

Phase 2H.18 mencatat owner-provided controlled approved draft promotion, DB-only approved-video handoff, dan final post-promotion-handoff backup evidence untuk project `psd_pilot`: approved draft dipromote manual copy ke approved-videos, SHA256 source/approved match, handoff DB-only berstatus `ready_for_manual_publish`, manual publication package tetap `0`, dan final backup directory `/srv/pesona-studio/backups/psd-pilot-post-promotion-handoff-final-backup-20260703T093157Z` checksum/readability PASS. Ini bukan manual publish package, bukan upload/publish/schedule, bukan social API/publisher/scheduler automation, bukan OpenAI live runtime, bukan public exposure, dan bukan cutover.

Phase 2H.19 mencatat owner-provided controlled manual publication package dan post-package backup evidence untuk project `psd_pilot`: package DB-only dibuat dari approved-video handoff, satu manual publication package dan empat channel row tercatat, package tetap `draft_package`, channel tetap `draft_channel`, tidak ada manual publish evidence log, tidak ada closeout, dan backup directory `/srv/pesona-studio/backups/psd-pilot-post-manual-package-backup-20260704T045148Z` checksum/readability PASS. Ini bukan actual publish, bukan upload/schedule, bukan social API/publisher/scheduler automation, bukan OpenAI live runtime, bukan public exposure, dan bukan cutover.

Phase 2H.20 mencatat owner-provided controlled manual publish readiness, checklist board, dan post-readiness checklist backup evidence untuk project `psd_pilot`: package DB-only ditandai `ready_manual_publish`, 32 checklist item dibuat untuk 4 channel, semua item tetap pending, tidak ada manual publish evidence log, tidak ada closeout, dan backup directory `/srv/pesona-studio/backups/psd-pilot-post-manual-readiness-checklist-backup-20260704T054533Z` checksum/readability PASS. Ini bukan actual publish, bukan evidence log creation, bukan closeout, bukan upload/schedule, bukan social API/publisher/scheduler automation, bukan OpenAI live runtime, bukan public exposure, dan bukan cutover.

Phase 2H.21 mencatat owner-provided controlled manual evidence log sandbox dan post-evidence-log backup evidence untuk project `psd_pilot`: satu Facebook `admin_note` DB-only tercatat sebagai sandbox evidence, satu YouTube blank `admin_note` tercatat eksplisit sebagai anomaly harmless DB-only, package tetap `ready_manual_publish`, tidak ada publish URL/timestamp, tidak ada closeout, tidak ada checklist item yang done, dan backup directory `/srv/pesona-studio/backups/psd-pilot-post-manual-evidence-log-sandbox-backup-20260704T060835Z` checksum/readability PASS. Ini bukan actual publish, bukan real publish proof, bukan closeout, bukan upload/schedule, bukan social API/publisher/scheduler automation, bukan OpenAI live runtime, bukan public exposure, dan bukan cutover.

Phase 2H.22 mencatat owner-provided controlled manual closeout readiness review dan backup evidence untuk project `psd_pilot`: package tetap `ready_manual_publish`, semua channel tetap `draft_channel`, semua checklist item tetap pending, evidence log masih sandbox/admin_note, blank YouTube `admin_note` anomaly tetap terdokumentasi, closeout tetap 0, assessment `NOT_READY_FOR_CLOSEOUT`, dan backup directory `/srv/pesona-studio/backups/psd-pilot-manual-closeout-readiness-review-backup-20260704T062557Z` checksum/readability PASS. Ini bukan closeout, bukan actual publish, bukan real publish proof, bukan upload/schedule, bukan social API/publisher/scheduler automation, bukan OpenAI live runtime, bukan public exposure, dan bukan cutover.

Phase 2I.1 menambahkan UI/server guard untuk manual evidence log dan closeout safety: evidence log baru wajib punya `evidence_type`, `recorded_by_name`, dan minimal salah satu `evidence_value` atau `evidence_note` nonblank; closeout diblokir bila package belum `published_manually`, checklist belum selesai, tidak ada valid publish proof, ada blank evidence anomaly, atau closeout sudah ada. Blank YouTube `admin_note` anomaly lama tetap terlihat sebagai DB-only anomaly dan tidak dimutasi. Ini code safety patch lokal, bukan actual publish, bukan closeout, bukan deployment, bukan backup/restore, bukan public exposure, dan bukan cutover.

Phase 2I.2 mencatat owner-provided controlled server pull, runtime guard smoke, dan backup evidence untuk project `psd_pilot`: server runtime sudah berada di `phase-2i1-complete`, blank evidence guard PASS, closeout readiness guard PASS dengan UI `NOT_READY_FOR_CLOSEOUT`, evidence log count tetap `2` setelah blank submit, closeout tetap `0`, existing blank YouTube `admin_note` anomaly tetap terlihat dan unchanged, dan backup directory `/srv/pesona-studio/backups/psd-pilot-phase-2i2-runtime-guard-smoke-backup-20260706T034554Z` checksum/readability PASS. Ini runtime guard smoke evidence only, bukan actual publish, bukan closeout, bukan deployment, bukan production backup, bukan restore, bukan public exposure, dan bukan cutover.

Phase 2I.3 mencatat guard regression review dan owner go/no-go untuk project `psd_pilot`: manual evidence blank-input guard PASS, blank anomaly display PASS, closeout readiness guard PASS dengan `NOT_READY_FOR_CLOSEOUT`, evidence log count tetap `2`, closeout tetap `0`, package tetap `ready_manual_publish`, semua checklist item tetap pending, dan blank YouTube `admin_note` anomaly tetap documented/visible/unchanged. Owner decision: closeout NO, actual publish NO, cutover NO, social API/scheduler NO, continued controlled local pilot hardening YES. Ini review gate docs-only, bukan runtime smoke, bukan actual publish, bukan closeout, bukan deployment, bukan public exposure, dan bukan cutover.

Phase 2I.4 menambahkan UI/UX evidence form hardening: field Evidence Type dan Recorded By required, Add Evidence disabled saat evidence type/recorded by/value/note masih blank atau whitespace-only, helper text menjelaskan bahwa Evidence Value atau Evidence Note wajib diisi, dan blank evidence bukan valid publish proof. Server-side guard Phase 2I.1 tetap otoritas final. Blank YouTube `admin_note` anomaly lama tetap terlihat, documented, dan unchanged. Closeout tetap `NOT_READY_FOR_CLOSEOUT`; actual publish, social API/scheduler, public exposure, dan cutover tetap blocked.

Phase 2I.5 mencatat owner-provided controlled server pull, UI hardening smoke, dan backup evidence untuk project `psd_pilot`: server runtime berada di `phase-2i4-complete`, Add Evidence blank form tetap disabled PASS, helper text visible PASS, blank YouTube `admin_note` anomaly tetap visible/unchanged, closeout readiness tetap `NOT_READY_FOR_CLOSEOUT`, evidence log count tetap `2`, closeout tetap `0`, dan backup directory `/srv/pesona-studio/backups/psd-pilot-phase-2i5-ui-hardening-smoke-backup-20260706T045015Z` checksum/readability PASS. Ini runtime UI hardening smoke evidence only, bukan actual publish, bukan evidence log creation, bukan checklist completion, bukan closeout, bukan deployment, bukan production backup, bukan restore, bukan public exposure, dan bukan cutover.

Phase 2I.6 mencatat owner-provided controlled manual checklist update smoke dan backup evidence untuk project `psd_pilot`: server runtime tetap `phase-2i4-complete`, tepat satu checklist item ditandai done yaitu Facebook `video_file_confirmed`, validasi gate `1|31|2|0|ready_manual_publish|` PASS, evidence log count tetap `2`, closeout tetap `0`, blank YouTube `admin_note` anomaly tetap visible/unchanged, dan backup directory `/srv/pesona-studio/backups/psd-pilot-phase-2i6-manual-checklist-update-smoke-backup-20260706T052108Z` checksum/readability PASS. Ini runtime checklist update smoke evidence only, bukan actual publish, bukan evidence log creation, bukan additional checklist completion, bukan closeout, bukan deployment, bukan production backup, bukan restore, bukan public exposure, dan bukan cutover.

Phase 2I.7 mencatat checklist progress review dan owner go/no-go setelah Phase 2I.6: package tetap `ready_manual_publish`, `published_manually_at` tetap empty, checklist state `1` done dan `31` pending, done item hanya Facebook `video_file_confirmed`, evidence log count tetap `2`, closeout tetap `0`, dan blank YouTube `admin_note` anomaly tetap documented/unchanged. Decision: closeout NO, actual publish NO, social API/scheduler NO, public exposure NO, cutover NO, uncontrolled checklist batch update NO, controlled local checklist hardening YES. Ini review/go-no-go docs-only, bukan runtime smoke, bukan checklist mutation, bukan actual publish, bukan closeout, dan bukan cutover.

Phase 2I.8 mencatat owner-provided controlled Facebook content-prep checklist update smoke dan backup evidence untuk project `psd_pilot`: server runtime tetap `phase-2i4-complete`, empat low-risk checklist item Facebook (`caption_ready`, `hashtags_ready`, `cta_ready`, `final_visual_check`) ditandai done, Facebook menjadi `5` done / `3` pending, total checklist state `5` done / `27` pending, `manual_post_created` dan `manual_url_recorded` tetap pending, evidence log count tetap `2`, closeout tetap `0`, blank YouTube `admin_note` anomaly tetap visible/unchanged, dan backup directory `/srv/pesona-studio/backups/psd-pilot-phase-2i8-content-prep-checklist-smoke-backup-20260706T060858Z` checksum/readability PASS. Ini runtime content-prep checklist smoke evidence only, bukan actual publish, bukan evidence log creation, bukan publish-proof checklist completion, bukan closeout, bukan deployment, bukan production backup, bukan restore, bukan public exposure, dan bukan cutover.

Phase 2I.9 mencatat content-prep progress review dan owner go/no-go setelah Phase 2I.8: repo baseline `6efa045`, tag `phase-2i8-complete`, runtime server tetap `phase-2i4-complete` per owner evidence, package tetap `ready_manual_publish`, `published_manually_at` tetap empty, checklist state `5` done dan `27` pending, Facebook `5/8` done, Instagram/TikTok/YouTube masing-masing `0/8` done, evidence log count tetap `2`, closeout tetap `0`, dan blank YouTube `admin_note` anomaly tetap documented/unchanged. Decision: closeout NO, actual publish NO, social API/scheduler NO, public exposure NO, cutover NO, publish-proof checklist items NO, uncontrolled checklist batch update NO, controlled local content-prep hardening YES. Ini review/go-no-go docs-only, bukan runtime smoke, bukan checklist mutation, bukan evidence log creation, bukan actual publish, bukan closeout, dan bukan cutover.

Phase 2I.10 mencatat owner-provided controlled multi-channel content-prep checklist smoke dan backup evidence untuk project `psd_pilot`: server runtime tetap `phase-2i4-complete`, low-risk checklist item Instagram/TikTok/YouTube (`video_file_confirmed`, `caption_ready`, `hashtags_ready`, `cta_ready`, `final_visual_check`) ditandai done, semua channel menjadi `5` done / `3` pending, total checklist state `20` done / `12` pending, `account_login_ready`, `manual_post_created`, dan `manual_url_recorded` tetap pending di semua channel, evidence log count tetap `2`, closeout tetap `0`, blank YouTube `admin_note` anomaly tetap visible/unchanged, dan backup directory `/srv/pesona-studio/backups/psd-pilot-phase-2i10-multi-channel-content-prep-smoke-backup-20260707T034049Z` checksum/readability PASS. Ini runtime content-prep checklist smoke evidence only, bukan actual publish, bukan evidence log creation, bukan account-login atau publish-proof checklist completion, bukan closeout, bukan deployment, bukan production backup, bukan restore, bukan public exposure, dan bukan cutover.

Phase 2I.11 mencatat manual publish path readiness review dan owner go/no-go setelah Phase 2I.10: repo baseline `2943a90`, tag `phase-2i10-complete`, runtime server tetap `phase-2i4-complete` per owner evidence, package tetap `ready_manual_publish`, `published_manually_at` tetap empty, semua channel `5` done / `3` pending, total checklist state `20` done / `12` pending, `account_login_ready`, `manual_post_created`, dan `manual_url_recorded` tetap pending di semua channel, evidence log count tetap `2`, closeout tetap `0`, dan blank YouTube `admin_note` anomaly tetap documented/unchanged. Decision: closeout NO, actual publish NO, social API/scheduler NO, public exposure NO, cutover NO, publish-proof checklist items NO, uncontrolled checklist batch update NO, controlled local hardening YES. Account-login readiness boleh lanjut hanya tanpa credential capture dan tanpa posting.

Phase 2I.12 mencatat owner-provided controlled account-login readiness smoke dan backup evidence untuk project `psd_pilot`: server runtime tetap `phase-2i4-complete`, `account_login_ready` ditandai done untuk Facebook, Instagram, TikTok, dan YouTube, semua channel menjadi `6` done / `2` pending, total checklist state `24` done / `8` pending, `manual_post_created` dan `manual_url_recorded` tetap pending di semua channel, evidence log count tetap `2`, closeout tetap `0`, tidak ada publish timestamp atau URL, tidak ada credential captured/stored, blank YouTube `admin_note` anomaly tetap visible/unchanged, dan backup directory `/srv/pesona-studio/backups/psd-pilot-phase-2i12-account-login-readiness-smoke-backup-20260707T041730Z` checksum/readability PASS. Ini runtime account-login readiness smoke evidence only, bukan actual publishing, bukan upload, bukan evidence log creation, bukan publish-proof checklist completion, bukan closeout, bukan production backup by Codex, bukan restore, bukan public exposure, dan bukan cutover.

Phase 2I.13 mencatat final manual publish preflight dan owner go/no-go setelah Phase 2I.12: repo baseline `d104119`, tag `phase-2i12-complete`, runtime server tetap `phase-2i4-complete` per owner evidence, package tetap `ready_manual_publish`, `published_manually_at` tetap empty, semua channel tetap `6` done / `2` pending, total checklist state tetap `24` done / `8` pending, `manual_post_created` dan `manual_url_recorded` tetap pending di semua channel, evidence log count tetap `2`, closeout tetap `0`, dan blank YouTube `admin_note` anomaly tetap documented/unchanged. Decision: closeout NO, cutover NO, public exposure NO, social API/scheduler/publisher automation NO, OpenAI live runtime NO, uncontrolled checklist batch update NO, evidence log creation in this phase NO, publish-proof checklist items in this phase NO, future controlled one-channel manual publish pilot CONDITIONAL YES only after explicit owner approval and strict proof/safety rules. Preferred next safe phase adalah docs-only Manual Publish SOP / Proof Capture Plan sebelum real post.

Phase 2I.14 mencatat Manual Publish SOP / Proof Capture Plan sebagai docs-only release: runtime server tetap `phase-2i4-complete`, checklist tetap `24` done / `8` pending, semua channel tetap `6` done / `2` pending, `manual_post_created` dan `manual_url_recorded` tetap pending, evidence log count tetap `2`, closeout tetap `0`, dan blank YouTube `admin_note` anomaly tetap documented/unchanged. SOP menetapkan one-channel pilot first, proof harus real bukan dummy, credential/security data tidak boleh tertangkap, closeout/cutover tetap blocked, dan next phase yang direkomendasikan adalah owner approval gate untuk controlled one-channel manual publish pilot.

Phase 2I.15 mencatat Controlled One-Channel Manual Publish Pilot - Owner Approval Gate sebagai docs-only release: runtime server tetap `phase-2i4-complete`, checklist tetap `24` done / `8` pending, semua channel tetap `6` done / `2` pending, `manual_post_created` dan `manual_url_recorded` tetap pending, evidence log count tetap `2`, closeout tetap `0`, dan blank YouTube `admin_note` anomaly tetap documented/unchanged. Gate status adalah `HOLD / PENDING_OWNER_CHANNEL_SELECTION` karena owner belum memilih channel pertama dan detail publish final. Actual publish, upload, evidence log creation, checklist mutation, closeout, public exposure, scheduler/social API/publisher, OpenAI live runtime, dan cutover tetap NO pada phase ini.

Phase 2J.1 memulai Real Footage AI Content Engine Agent Activation Foundation: publishing track diparkir karena approved pilot MP4 saat ini hanya placeholder teknis 4 detik, bukan production-ready video. Fokus berpindah ke content engine untuk calendar, idea/angle, caption, hashtag, CTA, script, shot list, footage metadata, footage selection, video draft plan, dan public-readiness review. Default smoke memakai fake provider/offline melalui `npm run ai:content-engine:smoke`; live AI memerlukan env eksplisit dan secret handling. Phase ini tidak publish, tidak upload, tidak membuat evidence log, tidak update manual publish checklist, tidak closeout, tidak cutover, dan tidak mengaktifkan scheduler/social API/publisher.

Phase 2J.2 menambahkan Real Footage Intake & Metadata Batch Smoke sebagai local-only fixture smoke: manifest JSON di `packages/content-engine/fixtures/real-footage-intake-smoke.json` berisi metadata-only rows, bukan media scan. Command `npm run ai:real-footage-intake:smoke` membaca fixture, memvalidasi required fields, normalize tags, memfilter unusable/risky footage, membuat intake summary, lalu meneruskan usable rows ke fake content-engine pipeline untuk metadata, selection, dan draft plan. Phase ini tidak render video, tidak publish, tidak upload, tidak scan real storage folder, tidak membuat evidence log, tidak update checklist, tidak closeout, tidak cutover, dan tidak memerlukan OpenAI/live AI.

Untuk alignment Phase 2A.6A, baca `docs/phase-2a6-local-first-blueprint.md`.

Untuk operasi harian server lokal, baca:

- `docs/ops/LOCAL_SERVER_RUNBOOK.md`
- `docs/ops/DAILY_WEEKLY_SOP.md`
- `docs/ops/BACKUP_RESTORE_DRY_RUN.md`
- `docs/ops/TROUBLESHOOTING_INCIDENTS.md`
- `docs/ops/RELEASE_READINESS_CHECKLIST.md`
- `docs/ops/LOCAL_SERVER_DEPLOYMENT_REHEARSAL.md`
- `docs/ops/TECHNICIAN_HANDOFF.md`
- `docs/ops/OFFICE_SERVER_NETWORK_STORAGE_CHECKLIST.md`
- `docs/ops/CUTOVER_GO_NO_GO.md`
- `docs/ops/POST_CUTOVER_VERIFICATION.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/TECHNICIAN_EVIDENCE_INTAKE.md`
- `docs/ops/OFFICE_SERVER_PREFLIGHT_PRINTABLE.md`
- `docs/ops/OWNER_SIGNOFF_TEMPLATES.md`
- `docs/ops/DRY_RUN_EVIDENCE_TEMPLATE.md`
- `docs/ops/FINAL_LOCAL_OPS_RELEASE_AUDIT.md`
- `docs/ops/LOCAL_OPS_FREEZE_CANDIDATE_CHECKLIST.md`
- `docs/ops/OPS_DOCS_CONSISTENCY_AUDIT.md`
- `docs/ops/ROUTE_STORAGE_EVIDENCE_SNAPSHOT.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`
- `docs/ops/OWNER_REVIEW_CHECKLIST.md`
- `docs/ops/OFFICE_SERVER_READINESS_EVIDENCE.md`
- `docs/ops/OFFICE_SERVER_REPO_BOOTSTRAP_VERIFICATION.md`
- `docs/ops/ENV_HANDLING_VERIFICATION.md`
- `docs/ops/CUTOVER_HOLD_GATE.md`
- `docs/ops/BACKUP_EVIDENCE_PLAN.md`
- `docs/ops/BACKUP_RESTORE_SEQUENCE_GATE.md`
- `docs/ops/BACKUP_EVIDENCE_COLLECTION.md`
- `docs/ops/BACKUP_EVIDENCE_TEMPLATE.md`
- `docs/ops/OFFICE_SERVER_BOOTSTRAP_VERIFICATION.md`
- `docs/ops/OFFICE_SERVER_BOOTSTRAP_EVIDENCE_INTAKE.md`
- `docs/ops/LOCAL_VISUAL_DEMO_EVIDENCE.md`
- `docs/ops/NEW_SERVER_BOOTSTRAP_EVIDENCE.md`
- `docs/ops/ISOLATED_SERVER_RUNTIME_SMOKE_EVIDENCE.md`
- `docs/ops/CONTROLLED_SMOKE_STOP_EVIDENCE.md`
- `docs/ops/CONTROLLED_SMOKE_BACKUP_EVIDENCE.md`
- `docs/ops/CONTROLLED_SMOKE_RESTORE_DRYRUN_EVIDENCE.md`
- `docs/ops/PILOT_READINESS_GATE.md`
- `docs/ops/SERVER_OPERATING_POLICY.md`
- `docs/ops/CONTROLLED_PILOT_START_EVIDENCE.md`
- `docs/ops/PILOT_BACKUP_POLICY.md`
- `docs/ops/FIRST_PILOT_BACKUP_EVIDENCE.md`
- `docs/ops/PILOT_UI_FLOW_EVIDENCE.md`
- `docs/ops/PILOT_POST_ENTRY_BACKUP_EVIDENCE.md`
- `docs/ops/CONTROLLED_DEMO_RENDER_EVIDENCE.md`
- `docs/ops/PILOT_POST_RENDER_BACKUP_EVIDENCE.md`
- `docs/ops/CONTROLLED_DRAFT_REVIEW_EVIDENCE.md`
- `docs/ops/PILOT_POST_REVIEW_BACKUP_EVIDENCE.md`
- `docs/ops/CONTROLLED_APPROVED_DRAFT_PROMOTION_HANDOFF_EVIDENCE.md`
- `docs/ops/PILOT_POST_PROMOTION_HANDOFF_FINAL_BACKUP_EVIDENCE.md`
- `docs/ops/CONTROLLED_MANUAL_PUBLICATION_PACKAGE_EVIDENCE.md`
- `docs/ops/PILOT_POST_MANUAL_PACKAGE_BACKUP_EVIDENCE.md`
- `docs/ops/CONTROLLED_MANUAL_PUBLISH_READINESS_CHECKLIST_EVIDENCE.md`
- `docs/ops/PILOT_POST_MANUAL_READINESS_CHECKLIST_BACKUP_EVIDENCE.md`
- `docs/ops/CONTROLLED_MANUAL_EVIDENCE_LOG_SANDBOX_EVIDENCE.md`
- `docs/ops/PILOT_POST_MANUAL_EVIDENCE_LOG_SANDBOX_BACKUP_EVIDENCE.md`
- `docs/ops/CONTROLLED_MANUAL_CLOSEOUT_READINESS_REVIEW_EVIDENCE.md`
- `docs/ops/PILOT_CLOSEOUT_READINESS_REVIEW_BACKUP_EVIDENCE.md`
- `docs/ops/CONTENT_PREP_PROGRESS_REVIEW_GO_NO_GO.md`
- `docs/ops/CONTROLLED_MULTI_CHANNEL_CONTENT_PREP_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I10_MULTI_CHANNEL_CONTENT_PREP_SMOKE_BACKUP_EVIDENCE.md`
- `docs/ops/MANUAL_PUBLISH_PATH_READINESS_REVIEW_GO_NO_GO.md`
- `docs/ops/CONTROLLED_ACCOUNT_LOGIN_READINESS_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I12_ACCOUNT_LOGIN_READINESS_SMOKE_BACKUP_EVIDENCE.md`
- `docs/ops/FINAL_MANUAL_PUBLISH_PREFLIGHT_GO_NO_GO.md`
- `docs/ops/MANUAL_PUBLISH_SOP_PROOF_CAPTURE_PLAN.md`
- `docs/ops/CONTROLLED_ONE_CHANNEL_MANUAL_PUBLISH_OWNER_APPROVAL_GATE.md`
- `docs/ops/REAL_FOOTAGE_AI_CONTENT_ENGINE_AGENT_ACTIVATION.md`
- `docs/ops/REAL_FOOTAGE_INTAKE_METADATA_BATCH_SMOKE.md`

## Checklist local-first Phase 2A.6B

Sebelum menjalankan stack di server kantor:

- Ubuntu Server sudah terpasang dan bisa diakses admin.
- Docker Engine dan Docker Compose v2 tersedia.
- SSD 2TB dipakai sebagai storage kerja utama untuk folder `storage/`.
- UPS terpasang agar shutdown tidak memutus database/job secara mendadak.
- Tidak ada GPU yang diwajibkan untuk fase awal.
- `.env.local` dibuat dari `.env.local.example` dan tidak masuk git.
- Password PostgreSQL, n8n, dan token internal sudah diganti dari contoh.
- OpenAI tetap nonaktif kecuali owner sengaja mengaktifkan override OpenAI.
- Backup database dan file penting direncanakan sebelum data operasional dipakai.

## Prasyarat

- Node.js 24 atau lebih baru.
- Docker Desktop dengan Docker Compose v2.
- Untuk server kantor: Ubuntu Server dengan Docker Engine dan Docker Compose v2.

## Setup cepat

1. Salin env lokal:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

2. Jalankan stack lokal:

   ```powershell
   docker compose --env-file .env.local -f docker-compose.dev.yml up --build
   ```

3. Buka layanan:

   - Web dashboard: http://localhost:3000
   - n8n: http://localhost:5678
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

4. Stop stack:

   ```powershell
   docker compose --env-file .env.local -f docker-compose.dev.yml down
   ```

## Local Runtime Smoke Phase 2A.6C

Smoke ini memverifikasi runtime lokal bisa start dengan aman. Jangan pakai `docker compose down -v`, `docker volume rm`, reset database, atau hapus folder `storage/` saat smoke.

1. Siapkan env lokal:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

   Untuk server kantor, ganti placeholder lokal berikut sebelum runtime dipakai operasional:

   - `POSTGRES_PASSWORD`
   - `N8N_BASIC_AUTH_PASSWORD`
   - `N8N_ENCRYPTION_KEY`
   - `INTERNAL_API_TOKEN`

   Biarkan Campaign Planner pada mode lokal/fake:

   ```text
   CAMPAIGN_PLANNER_PROVIDER=fake
   CAMPAIGN_PLANNER_OPENAI_ENABLED=false
   OPENAI_MODEL=
   ```

2. Validasi Compose tanpa start container:

   ```powershell
   docker compose --env-file .env.local -f docker-compose.dev.yml config
   ```

   Pastikan service berikut ada: `postgres`, `redis`, `n8n`, `web-app`, `campaign-planner-worker`, `video-worker`, dan `mockup-worker`.

3. Start runtime lokal:

   ```powershell
   docker compose --env-file .env.local -f docker-compose.dev.yml up --build
   ```

   Command ini boleh menarik/build image jika belum ada. Tidak ada live OpenAI call pada mode default karena provider tetap `fake` dan override `docker-compose.openai.yml` tidak dipakai.

4. Cek service dari terminal lain:

   ```powershell
   docker compose --env-file .env.local -f docker-compose.dev.yml ps
   docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=80 web-app
   docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=80 campaign-planner-worker
   docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=80 video-worker
   docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=80 mockup-worker
   ```

   Indikator aman:

   - PostgreSQL dan Redis berstatus healthy.
   - Web dashboard terbuka di http://localhost:3000.
   - `campaign-planner-worker` log `event:"started"` dan tidak meminta OpenAI key.
   - `video-worker` log `event:"started"` dengan `storageDir:"/app/storage"`.
   - `mockup-worker` log `event:"started"` dengan `storageDir:"/app/storage"`.
   - Tidak ada log live OpenAI request.

5. Cek storage mount lokal:

   ```powershell
   docker compose --env-file .env.local -f docker-compose.dev.yml exec web-app ls -la /app/storage
   ```

   Pastikan folder `footage`, `draft-videos`, `approved-videos`, `mockups`, dan `brand-assets` terlihat. Folder itu berasal dari bind mount repo `./storage`.

6. Smoke aplikasi setelah database siap:

   ```powershell
   npm run db:migrate
   npm run db:seed
   ```

   Lalu buka:

   - http://localhost:3000/products
   - http://localhost:3000/campaigns
   - http://localhost:3000/content-calendar

7. Stop runtime tanpa menghapus volume:

   ```powershell
   docker compose --env-file .env.local -f docker-compose.dev.yml down
   ```

   Jangan tambah `-v` kecuali owner secara eksplisit meminta reset data.

## Jalankan tanpa Docker

Mode ini hanya untuk melihat placeholder web dan worker log. PostgreSQL dan Redis tidak otomatis menyala.

```powershell
npm run dev:web
npm run dev:video-worker
npm run dev:mockup-worker
```

## Check lokal

```powershell
npm run check
```

Check ini memvalidasi file skeleton, service Compose, rute Phase 1A, rute Campaign, rute Konten, rute Publikasi, rute Kalender Konten, Campaign Planner staging/review/import, migration bertahap, dan syntax TypeScript.

Integration test database-backed wajib memakai `TEST_DATABASE_URL`. Test tidak fallback ke `DATABASE_URL` development. Bootstrap test akan membuat database test bila belum ada, menjalankan migration 001-005, menjalankan seed library minimum, lalu mengarahkan koneksi proses test ke database test tersebut. Ini membuat `campaign-planner-worker` Docker yang sedang memakai database development tidak dapat mengambil run dari integration tests.

```powershell
npm run test:db:prepare
```

Gunakan nama database berbeda, misalnya:

```powershell
TEST_DATABASE_URL=postgresql://pesona:***@postgres:5432/pesona_studio_test
```

Campaign Planner Phase 2A.1 mempunyai test terpisah berbasis fake provider:

```powershell
npm run test:campaign-planner
```

Phase 2A.1 masih fake-only. Tidak ada OpenAI dependency, tidak ada OpenAI API key yang diperlukan, dan tidak ada live AI call.

## Environment variable lokal

File `.env.local.example` adalah template dokumentasi sekaligus default lokal. Nilai penting:

- `DEPLOYMENT_PROFILE=local_office` menandai runtime local-first.
- `SERVER_OPERATION_START=08:00` dan `SERVER_OPERATION_END=20:00` mendokumentasikan asumsi jam operasional.
- `APP_STORAGE_DIR=/app/storage` dipetakan ke folder repo `./storage` oleh `docker-compose.dev.yml`.
- `CONTENT_LAST_POST_TIME=19:00` dan `CONTENT_PRIME_TIME=20:00` hanya dokumentasi target konten, bukan auto posting.
- `CAMPAIGN_PLANNER_PROVIDER=fake` dan `CAMPAIGN_PLANNER_OPENAI_ENABLED=false` menjaga default tanpa paid API call.
- `OPENAI_MODEL=` dibiarkan kosong pada local default. Isi hanya jika OpenAI override sengaja dipakai.
- `TEST_DATABASE_URL` wajib berbeda dari `DATABASE_URL` untuk integration tests.

Jangan commit `.env`, `.env.local`, file secret, dump database, atau file storage operasional.

## Database Phase 1A

Jalankan migration dan seed secara eksplisit setelah PostgreSQL siap:

```powershell
npm run db:migrate
npm run db:seed
```

Migration runner membuat ledger `schema_migrations`, menjalankan file SQL berdasarkan urutan, dan menolak checksum mismatch.

Seed membaca `configs/campaign_knowledge_base.json` sebagai sumber canonical. Products, offers, dan pain points diperbarui dari JSON. Colors dan rekomendasi warna jenjang hanya ditambahkan jika belum ada agar perubahan admin tidak tertimpa.

Halaman library Phase 1A:

- http://localhost:3000/products
- http://localhost:3000/colors
- http://localhost:3000/school-level-color-defaults
- http://localhost:3000/offers
- http://localhost:3000/pain-points

## Campaign Phase 1B.1

Jalankan migration eksplisit untuk menambahkan tabel campaign:

```powershell
npm run db:migrate
```

Halaman campaign:

- http://localhost:3000/campaigns
- http://localhost:3000/campaigns/new

Phase 1B.1 hanya mengelola data campaign. Publication dan calendar belum dibuat.

## Content Item Phase 1B.2

Jalankan migration eksplisit untuk menambahkan tabel content item:

```powershell
npm run db:migrate
```

Alur manual:

1. Buat campaign di http://localhost:3000/campaigns/new
2. Buat konten dari http://localhost:3000/content-items/new
3. Atau buka detail campaign dan klik Tambah Konten.

Halaman content item:

- http://localhost:3000/content-items
- http://localhost:3000/content-items/new

Content code dan sequence dibuat otomatis dari kode campaign. Manual content calendar belum tersedia pada Phase 1B.2.

## Content Publication Phase 1B.3

Jalankan migration eksplisit untuk menambahkan tabel publication:

```powershell
npm run db:migrate
```

Alur manual:

1. Buat campaign di http://localhost:3000/campaigns/new
2. Buat content item di http://localhost:3000/content-items/new
3. Buka detail content item.
4. Klik Tambah Publikasi untuk membuat rencana channel/format.

Route publication:

- `/content-items/:id/publications/new`
- `/content-publications/:id`
- `/content-publications/:id/edit`

Publication mendukung channel Instagram, Facebook, TikTok, YouTube, dan WhatsApp Status. Auto posting, scheduler, dan API platform belum tersedia.

## Manual Content Calendar Phase 1B.4

Alur manual:

1. Buat campaign di http://localhost:3000/campaigns/new
2. Buat content item di http://localhost:3000/content-items/new
3. Tambahkan publication dari detail content item.
4. Pantau agenda content-first di http://localhost:3000/content-calendar

Route calendar:

- Page: `/content-calendar`
- API: `/api/content-calendar`

Filter tersedia:

- `month` dengan format `YYYY-MM`
- `campaign_id`
- `channel`
- `production_status`
- `publication_status`

Kalender mengelompokkan content item berdasarkan `planned_content_date`, lalu menampilkan seluruh publication yang relevan sebagai data nested. Kalender belum melakukan posting otomatis dan tidak membuat scheduler baru.

## Campaign Planner Phase 2A.2

Phase 2A.2 menambahkan generation run staging dengan Fake Provider dan worker PostgreSQL polling.

Command:

```powershell
npm run db:migrate
npm run worker:campaign-planner
npm run worker:campaign-planner:once
npm run test:campaign-planner-runs
```

Route:

- Generate page: `/campaigns/:id/plan-runs/new`
- Run detail: `/campaign-plan-runs/:id`
- API create/list: `/api/campaigns/:id/plan-runs`
- API detail: `/api/campaign-plan-runs/:id`
- API retry: `/api/campaign-plan-runs/:id/retry`
- API cancel: `/api/campaign-plan-runs/:id/cancel`

Phase ini masih fake-only untuk menguji lifecycle, lease, retry, validation, dan staging draft. Belum ada review/edit/approve/import draft, belum ada OpenAI provider, dan belum ada posting otomatis.

## Campaign Planner Phase 2A.3

Phase 2A.3 menambahkan review draft staging sebelum import operational.

Command:

```powershell
npm run test:campaign-plan-review
```

Route:

- Review run: `/campaign-plan-runs/:id/review`
- Edit draft item: `/campaign-plan-draft-items/:id/edit`
- API review run: `/api/campaign-plan-runs/:id/review`
- API draft item: `/api/campaign-plan-draft-items/:id`
- API approve/reject item: `/api/campaign-plan-draft-items/:id/approve`, `/api/campaign-plan-draft-items/:id/reject`
- API approve all: `/api/campaign-plan-runs/:id/approve-all`
- API approve/reject run: `/api/campaign-plan-runs/:id/approve`, `/api/campaign-plan-runs/:id/reject`

Alur lokal:

1. Generate rencana dari `/campaigns/:id/plan-runs/new`.
2. Jalankan worker sampai run menjadi `Siap Direview`.
3. Buka `/campaign-plan-runs/:id/review`.
4. Edit draft, approve/reject item, lalu approve atau reject run secara eksplisit.

Belum ada import ke `content_items` atau `content_publications` pada Phase 2A.3. Fake Provider masih digunakan; belum ada OpenAI provider dan belum ada posting otomatis.

## Campaign Planner Phase 2A.4

Phase 2A.4 menambahkan Approved Draft Import ke Kalender Konten manual.

Command:

```powershell
npm run test:campaign-plan-import
```

Route:

- Import confirmation page: `/campaign-plan-runs/:id/import`
- Import API: `POST /api/campaign-plan-runs/:id/import`
- Calendar verification: `/content-calendar`
- Calendar API: `/api/content-calendar?month=YYYY-MM`

Alur lokal:

1. Generate rencana dari `/campaigns/:id/plan-runs/new`.
2. Jalankan `campaign-planner-worker` sampai run menjadi `Siap Direview`.
3. Review draft di `/campaign-plan-runs/:id/review`.
4. Approve/reject item, lalu approve run.
5. Buka `/campaign-plan-runs/:id/import`.
6. Klik `Import ke Kalender Konten`.
7. Verifikasi hasil di `/content-calendar`.

Import hanya mengambil draft berstatus `Disetujui`. Draft `Ditolak` tetap tersimpan di staging dan tidak masuk Kalender Konten. Import berjalan all-or-nothing dan idempotent; retry atau double-click tidak membuat duplicate operational row.

OpenAI belum digunakan pada Phase 2A.4. Tidak ada env key OpenAI, provider OpenAI, Responses API, auto posting, publication scheduler, atau n8n workflow import.

## Campaign Planner Phase 2A.5A

Phase 2A.5A menambahkan OpenAI Provider sebagai provider tambahan. Default local development dan `docker-compose.dev.yml` tetap Fake Provider dan tidak membutuhkan API key.

Command test mocked tanpa network:

```powershell
npm run test:campaign-planner-openai
```

Konfigurasi nonsecret:

```powershell
CAMPAIGN_PLANNER_PROVIDER=fake
CAMPAIGN_PLANNER_OPENAI_ENABLED=false
CAMPAIGN_PLANNER_PROMPT_VERSION=campaign-planner-v1
OPENAI_MODEL=
OPENAI_TIMEOUT_MS=120000
OPENAI_MAX_OUTPUT_TOKENS=5000
```

Untuk mengaktifkan OpenAI secara manual:

1. Buat secret file lokal:

   ```powershell
   New-Item -ItemType Directory -Force secrets
   Set-Content -NoNewline secrets/openai_api_key.txt "<OPENAI_API_KEY>"
   ```

2. Set `OPENAI_MODEL` di `.env.local`.
3. Jalankan stack dengan override:

   ```powershell
   docker compose --env-file .env.local -f docker-compose.dev.yml -f docker-compose.openai.yml up --build
   ```

API key hanya dimount ke `campaign-planner-worker` sebagai Docker secret. `web-app` hanya menerima provider/model/prompt version nonsecret untuk create-run dan UI notice.

Kembali ke Fake Provider:

```powershell
docker compose --env-file .env.local -f docker-compose.dev.yml up --build
```

Manual smoke command tersedia tetapi tidak memanggil API kecuali flag eksplisit diset:

```powershell
npm run smoke:campaign-planner-openai
OPENAI_LIVE_SMOKE=1 npm run smoke:campaign-planner-openai
```

Jangan commit API key. Jangan paste API key ke chat/log. OpenAI request memakai Responses API, Structured Outputs, `store:false`, dan SDK retry dimatikan; retry tetap dikontrol Campaign Planner Worker.

## Folder storage lokal

- `storage/footage`
- `storage/draft-videos`
- `storage/approved-videos`
- `storage/mockups`
- `storage/brand-assets`

Isi folder storage diabaikan dari git. File `.gitkeep` hanya menjaga struktur folder. Google Drive hanya untuk backup/sharing file penting, bukan tempat kerja utama.

Jangan menjalankan reset atau penghapusan massal folder `storage/` tanpa backup dan approval owner. Untuk server kantor, pastikan folder ini berada di SSD lokal 2TB atau bind mount yang setara sebelum dipakai operasional.

## Safety runtime lokal

- Jangan jalankan command destructive seperti reset database, drop table, hapus volume Docker, atau hapus storage tanpa approval owner.
- Jangan set `CAMPAIGN_PLANNER_PROVIDER=openai` atau `OPENAI_LIVE_SMOKE=1` kecuali owner secara eksplisit meminta paid API call.
- Jangan expose n8n atau web dashboard ke internet tanpa password, reverse proxy, dan approval owner.
- Jangan menambah VPS, GPU, cloud storage utama, scheduler/publisher, atau API platform baru pada audit runtime lokal ini.

## Batas Phase 0

Skeleton ini belum mengimplementasikan fitur bisnis, auto pricing, auto quotation, WA bot, Google Drive, posting API, atau desain final otomatis.
