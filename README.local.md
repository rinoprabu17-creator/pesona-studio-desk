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

Check ini memvalidasi file skeleton, service Compose, rute Phase 1A, rute Campaign, rute Konten, rute Publikasi, rute Kalender Konten, migration bertahap, dan syntax TypeScript.

Campaign Planner Phase 2A.1 mempunyai test terpisah berbasis fake provider:

```powershell
npm run test:campaign-planner
```

Phase 2A.1 masih fake-only. Tidak ada OpenAI dependency, tidak ada OpenAI API key yang diperlukan, dan tidak ada live AI call.

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

## Folder storage lokal

- `storage/footage`
- `storage/draft-videos`
- `storage/approved-videos`
- `storage/mockups`
- `storage/brand-assets`

Isi folder storage diabaikan dari git. File `.gitkeep` hanya menjaga struktur folder.

## Batas Phase 0

Skeleton ini belum mengimplementasikan fitur bisnis, auto pricing, auto quotation, WA bot, Google Drive, posting API, atau desain final otomatis.
