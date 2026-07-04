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
