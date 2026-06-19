# Pesona Studio Desk - Local Development

Dokumen ini untuk menjalankan skeleton Phase 0 dari laptop.

## Prasyarat

- Node.js 24 atau lebih baru.
- Docker Desktop dengan Docker Compose v2.

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

Check ini memvalidasi file skeleton, service Compose, rute Phase 1A, rute Campaign, rute Konten, migration bertahap, dan syntax TypeScript.

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

Content code dan sequence dibuat otomatis dari kode campaign. Publication, channel, jadwal posting, dan manual content calendar belum tersedia pada Phase 1B.2.

## Folder storage lokal

- `storage/footage`
- `storage/draft-videos`
- `storage/approved-videos`
- `storage/mockups`
- `storage/brand-assets`

Isi folder storage diabaikan dari git. File `.gitkeep` hanya menjaga struktur folder.

## Batas Phase 0

Skeleton ini belum mengimplementasikan fitur bisnis, auto pricing, auto quotation, WA bot, Google Drive, posting API, atau desain final otomatis.
