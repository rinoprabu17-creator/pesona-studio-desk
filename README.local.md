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

Check ini memvalidasi file skeleton, service Compose, rute dashboard, dan syntax TypeScript.

## Folder storage lokal

- `storage/footage`
- `storage/draft-videos`
- `storage/approved-videos`
- `storage/mockups`
- `storage/brand-assets`

Isi folder storage diabaikan dari git. File `.gitkeep` hanya menjaga struktur folder.

## Batas Phase 0

Skeleton ini belum mengimplementasikan fitur bisnis, auto pricing, auto quotation, WA bot, Google Drive, posting API, atau desain final otomatis.
