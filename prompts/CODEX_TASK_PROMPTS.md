# Prompt Pack untuk Codex — Pesona Studio Desk

Gunakan prompt ini satu per satu. Jangan berikan semua sekaligus.

## Prompt 0 — Setup Repo

```text
Baca AGENTS.md, README.md, docs/PROJECT_BLUEPRINT.md, docs/SYSTEM_BOUNDARY.md, dan docs/MVP_BUILD_SEQUENCE.md.

Tugas: buat skeleton repo Pesona Studio Desk untuk MVP.

Target:
- Docker Compose untuk web app, postgres, redis, n8n, video-worker placeholder, mockup-worker placeholder.
- Web app TypeScript dengan halaman dashboard sederhana.
- .env.example lengkap.
- README setup lokal/VPS.

Jangan implementasi fitur bisnis dulu. Fokus skeleton yang bisa jalan.

Setelah selesai, jalankan build/check yang tersedia dan laporkan file yang dibuat.
```

## Prompt 1 — Data Model

```text
Baca docs/DATA_MODEL.md dan configs/campaign_knowledge_base.json.

Tugas: implementasikan schema database untuk Pesona Studio Desk MVP.

Buat model untuk:
- campaigns
- content_items
- content_scripts
- shot_lists
- footage_assets
- render_jobs
- content_approvals
- posting_schedules
- mockup_requests
- lead_logs
- templates
- users

Tambahkan seed minimal dari campaign_knowledge_base.

Acceptance:
- Migration berhasil.
- Seed berhasil.
- Ada halaman Settings read-only untuk melihat offers, pain points, colors.
```

## Prompt 2 — Campaign Calendar

```text
Baca docs/PROJECT_BLUEPRINT.md dan docs/WORKFLOWS.md.

Tugas: buat modul Campaign Calendar.

Fitur:
- List campaign
- Create campaign manual
- List content items
- Import/generate 30 content items dari JSON contoh
- Status content terlihat

MVP tidak perlu AI call dulu. Buat struktur supaya nanti agent bisa dipasang.
```

## Prompt 3 — Script & Shot List

```text
Baca docs/AI_AGENTS_SPEC.md bagian Script & Shot List Agent.

Tugas: buat modul Script & Shot List.

Fitur:
- Untuk content item, admin bisa generate script dummy berbasis template.
- Shot list muncul per scene.
- Petugas footage bisa melihat instruksi visual, angle, durasi, overlay.

MVP boleh rule-based dulu, AI integration dibuat interface/service yang bisa diganti nanti.
```

## Prompt 4 — Footage Inbox

```text
Baca docs/WORKFLOWS.md Workflow 3.

Tugas: buat Footage Inbox.

Fitur MVP:
- Admin bisa paste Google Drive file link ke content item dan shot_id.
- Simpan footage asset.
- Status footage bisa diubah manual: Usable, Needs Reshoot, Low Quality, Sensitive/Need Blur.
- Tampilkan footage per content item.

Jangan bangun Google Drive API penuh dulu. Buat adapter interface agar bisa ditambah nanti.
```

## Prompt 5 — Video Render Worker Stub

```text
Baca docs/VIDEO_RENDER_SPEC.md.

Tugas: buat video render worker tahap awal.

Fitur:
- Menerima edit_plan JSON.
- Untuk MVP awal, worker boleh membuat output placeholder MP4 atau composition sederhana.
- Simpan render job status: Queued, Rendering, Draft Ready, Failed.
- Web app bisa melihat output dan status.

Pisahkan worker dari web app.
```

## Prompt 6 — Approval Board

```text
Baca docs/WORKFLOWS.md Workflow 5.

Tugas: buat Approval Board.

Fitur:
- Tampilkan video draft, caption, CTA, status.
- Tombol Approve, Revisi, Reject.
- Jika Revisi, simpan revision_notes dan buat render job versi baru.
- Jika Approve, status content menjadi Approved dan masuk scheduler.
```

## Prompt 7 — Posting Scheduler

```text
Baca docs/WORKFLOWS.md Workflow 6.

Tugas: buat Posting Scheduler tahap semi-manual.

Fitur:
- Konten approved muncul sebagai Ready to Schedule.
- Admin bisa set channel dan waktu posting.
- Admin bisa tandai Posted dan isi posted_url.
- Tidak perlu auto-posting API dulu.
```

## Prompt 8 — Mockup Generator

```text
Baca docs/MOCKUP_SPEC.md dan configs/campaign_knowledge_base.json.

Tugas: buat Mockup Generator MVP.

Fitur:
- Input nama sekolah, jenis sampul, jenjang, warna, logo mode default/upload.
- Auto-detect jenjang dari nama sekolah jika memungkinkan.
- Auto-pilih warna default berdasarkan jenjang.
- Render output PNG/JPG dengan template sederhana.
- Tambahkan watermark kecil: Preview Mockup Awal.
- Tidak ada flow revisi mockup.
```

## Prompt 9 — Lead Log Ringan

```text
Baca docs/SYSTEM_BOUNDARY.md dan docs/DATA_MODEL.md bagian lead_logs.

Tugas: buat Lead Log Ringan.

Fitur:
- Create lead manual.
- List/filter lead berdasarkan status, channel, keyword.
- Status: WA Masuk, Mockup Dikirim, Tanya Harga, Masuk Penawaran, Tidak Lanjut.
- Jika status Masuk Penawaran, tampilkan reminder: input ke Pesona Growth OS Lite.

Jangan integrasikan otomatis ke Growth OS Lite.
```

## Prompt 10 — n8n Integration Skeleton

```text
Baca docs/N8N_WORKFLOWS.md.

Tugas: buat API endpoint internal untuk dipanggil n8n.

Endpoint minimal:
- POST /api/internal/content/:id/generate-script
- POST /api/internal/content/:id/render-video
- POST /api/internal/render-jobs/:id/callback
- POST /api/internal/mockups/generate
- POST /api/internal/footage/register

Gunakan internal API token dari env.
```
