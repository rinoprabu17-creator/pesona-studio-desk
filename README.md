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
