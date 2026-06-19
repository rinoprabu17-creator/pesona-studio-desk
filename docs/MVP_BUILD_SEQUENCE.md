# MVP Build Sequence — Kerjakan Bertahap dengan Codex

Jangan minta Codex membangun semua sekaligus. Jalankan fase ini satu per satu.

## Phase 0 — Repo & Docker Skeleton

Goal:

- Repo siap.
- Docker Compose jalan.
- App web, database, redis, n8n, worker placeholder berjalan.

Acceptance:

- `docker compose up -d` berhasil.
- Web dashboard terbuka.
- Database terhubung.

## Phase 1 — Auth & Layout Admin

Goal:

- Login admin sederhana.
- Sidebar menu MVP.

Menu:

- Dashboard
- Campaign Calendar
- Shot List
- Footage Inbox
- Draft Video
- Approval Board
- Posting Scheduler
- Mockup Generator
- Lead Log
- Settings

## Phase 2 — Data Model & Seed Knowledge Base

Goal:

- Schema database dibuat.
- Seed offer, pain point, color, product dari config.

Acceptance:

- Admin bisa melihat offer/pain/color di Settings read-only.

## Phase 3 — Campaign Calendar

Goal:

- CRUD campaign.
- Generate/import 30 content items.
- Status content terlihat.

MVP boleh manual generate dulu dari JSON contoh.

## Phase 4 — Script & Shot List

Goal:

- Generate script dan shot list dari content item.
- Tampilkan shot list untuk petugas footage.

## Phase 5 — Google Drive Footage Intake

Goal:

- Simpan Google Drive folder per content item.
- Admin bisa paste Drive file link manual dulu.
- Nanti baru n8n watcher.

## Phase 6 — Video Render Worker Stub

Goal:

- Worker menerima edit_plan JSON.
- Untuk awal boleh render video sederhana dari 1–3 clip.
- Output MP4 tersimpan.

## Phase 7 — Approval Board

Goal:

- Preview video.
- Lihat caption.
- Approve/Revisi/Reject.
- Revisi membuat render job baru.

## Phase 8 — Posting Scheduler

Goal:

- Konten approved masuk scheduler.
- Admin bisa set tanggal dan channel.
- Status Ready to Post/Posted.

## Phase 9 — Mockup Generator

Goal:

- Input nama sekolah, jenis sampul, warna, logo default/upload.
- Output PNG/JPG preview.
- Tidak ada revisi mockup.

## Phase 10 — Lead Log Ringan

Goal:

- Admin input lead.
- Status lead sederhana.
- Filter berdasarkan status/channel.

## Phase 11 — n8n Integration

Goal:

- n8n panggil API internal untuk trigger script/render/drive watcher.

## Phase 12 — Hardening

Goal:

- Backup database.
- Logging job.
- Error state.
- Basic role permission.
- Dokumentasi deploy.
