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
