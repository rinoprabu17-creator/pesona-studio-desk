# Pesona Studio Desk — Blueprint MVP

**Nama sistem:** Pesona Studio Desk  
**Tagline internal:** Dari kalender konten → footage → video siap posting → mockup lead magnet.

Sistem ini dibuat untuk membantu PT. Pesona Gama Solusindo memproduksi konten otomatis/semi-otomatis untuk produk **Sampul Raport** dan **Sampul Ijazah**, tanpa membebani Pesona Growth OS Lite.

## Arah deployment MVP

Pesona Studio Desk memakai arsitektur **local-first**. Target awal berjalan di server lokal kantor Ubuntu Server, bukan VPS, dengan storage kerja utama di SSD lokal 2TB. Google Drive dipakai untuk backup/sharing penting, bukan storage kerja harian utama.

Blueprint deployment terbaru ada di `docs/phase-2a6-local-first-blueprint.md`.

## Fungsi MVP

1. Kalender konten 30 hari
2. Script + shot list footage
3. Upload footage ke storage lokal server
4. Render video draft otomatis
5. Approval/revisi video
6. Scheduler posting
7. Mockup awal otomatis
8. Lead log ringan

## Batas sistem

Pesona Studio Desk hanya mengelola konten, mockup awal, dan lead ringan.

Pesona Growth OS Lite tetap digunakan untuk:

- Penawaran
- Desain final Corel/PDF
- Revisi desain final sampai “Desain OK”
- DP
- Order
- Produksi

## Prinsip utama

- AI membantu produksi dan administrasi awal.
- Manusia tetap approve konten, takeover WA, membuat penawaran, membuat desain final, dan closing.
- Mockup awal gratis adalah lead magnet, bukan desain final.
- Tidak ada revisi mockup awal.
- Desain final gratis terjadi setelah customer cocok penawaran.
- DP setelah desain final OK.

## Local Development

Skeleton laptop Phase 0 tersedia di `docker-compose.dev.yml`.

Baca `README.local.md` untuk menjalankan PostgreSQL, Redis, n8n, web dashboard placeholder, video worker placeholder, dan mockup worker placeholder dari laptop.

## Local Operations

Dokumen operasional server lokal tersedia di `docs/ops/`:

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
- `docs/phase-2i1-ui-guard-manual-evidence-closeout-safety.md`
- `docs/ops/CONTROLLED_SERVER_PULL_RUNTIME_GUARD_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I2_RUNTIME_GUARD_SMOKE_BACKUP_EVIDENCE.md`
- `docs/phase-2i2-controlled-server-pull-runtime-guard-smoke-backup-evidence.md`
- `docs/ops/GUARD_REGRESSION_REVIEW_OWNER_GO_NO_GO.md`
- `docs/phase-2i3-guard-regression-review-owner-go-no-go.md`
- `docs/phase-2i4-ui-evidence-form-hardening.md`
- `docs/ops/CONTROLLED_SERVER_PULL_UI_HARDENING_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I5_UI_HARDENING_SMOKE_BACKUP_EVIDENCE.md`
- `docs/phase-2i5-controlled-server-pull-ui-hardening-smoke-backup-evidence.md`
- `docs/ops/CONTROLLED_MANUAL_CHECKLIST_UPDATE_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I6_MANUAL_CHECKLIST_UPDATE_SMOKE_BACKUP_EVIDENCE.md`
- `docs/phase-2i6-controlled-manual-checklist-update-smoke-backup-evidence.md`
- `docs/ops/CHECKLIST_PROGRESS_REVIEW_GO_NO_GO.md`
- `docs/phase-2i7-checklist-progress-review-go-no-go.md`
- `docs/ops/CONTROLLED_CONTENT_PREP_CHECKLIST_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I8_CONTENT_PREP_CHECKLIST_SMOKE_BACKUP_EVIDENCE.md`
- `docs/phase-2i8-controlled-content-prep-checklist-smoke-backup-evidence.md`
- `docs/ops/CONTENT_PREP_PROGRESS_REVIEW_GO_NO_GO.md`
- `docs/phase-2i9-content-prep-progress-review-go-no-go.md`
- `docs/ops/CONTROLLED_MULTI_CHANNEL_CONTENT_PREP_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I10_MULTI_CHANNEL_CONTENT_PREP_SMOKE_BACKUP_EVIDENCE.md`
- `docs/phase-2i10-controlled-multi-channel-content-prep-smoke-backup-evidence.md`
- `docs/ops/MANUAL_PUBLISH_PATH_READINESS_REVIEW_GO_NO_GO.md`
- `docs/phase-2i11-manual-publish-path-readiness-review-go-no-go.md`
- `docs/ops/CONTROLLED_ACCOUNT_LOGIN_READINESS_SMOKE_EVIDENCE.md`
- `docs/ops/PILOT_PHASE_2I12_ACCOUNT_LOGIN_READINESS_SMOKE_BACKUP_EVIDENCE.md`
- `docs/phase-2i12-controlled-account-login-readiness-smoke-backup-evidence.md`
- `docs/ops/FINAL_MANUAL_PUBLISH_PREFLIGHT_GO_NO_GO.md`
- `docs/phase-2i13-final-manual-publish-preflight-go-no-go.md`
- `docs/ops/MANUAL_PUBLISH_SOP_PROOF_CAPTURE_PLAN.md`
- `docs/phase-2i14-manual-publish-sop-proof-capture-plan.md`
- `docs/ops/CONTROLLED_ONE_CHANNEL_MANUAL_PUBLISH_OWNER_APPROVAL_GATE.md`
- `docs/phase-2i15-controlled-one-channel-manual-publish-owner-approval-gate.md`
- `docs/ops/REAL_FOOTAGE_AI_CONTENT_ENGINE_AGENT_ACTIVATION.md`
- `docs/phase-2j1-real-footage-ai-content-engine-agent-activation-foundation.md`
- `docs/ops/REAL_FOOTAGE_INTAKE_METADATA_BATCH_SMOKE.md`
- `docs/phase-2j2-real-footage-intake-metadata-batch-smoke.md`
- `docs/ops/REAL_FOOTAGE_SCRIPT_TO_DRAFT_PLAN_BATCH_REVIEW.md`
- `docs/phase-2j3-real-footage-script-to-draft-plan-batch-review.md`
- `docs/ops/REAL_FOOTAGE_DRAFT_PLAN_QUALITY_TUNING.md`
- `docs/phase-2j4-real-footage-draft-plan-quality-tuning.md`
- `docs/ops/REAL_FOOTAGE_BATCH_METADATA_EXPANSION.md`
- `docs/phase-2j5-real-footage-batch-metadata-expansion.md`
- `docs/ops/REAL_FOOTAGE_METADATA_COVERAGE_REVIEW.md`
- `docs/phase-2j6-real-footage-metadata-coverage-review.md`
