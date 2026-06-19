# Project Blueprint — Pesona Studio Desk

## 1. Tujuan

Membangun sistem ringan untuk mengurangi bottleneck produksi konten dan lead magnet mockup awal untuk PT. Pesona Gama Solusindo.

Sistem ini fokus pada produk:

- Sampul Raport
- Sampul Ijazah

## 2. Masalah yang diselesaikan

Sebelum sistem:

- Ide konten dibuat manual.
- Petugas footage bingung harus ambil video apa.
- Editing video jadi bottleneck.
- Approval dan posting tidak terstruktur.
- Mockup awal bisa jadi bottleneck jika manual.
- Lead awal dari konten belum tercatat rapi.

Setelah sistem:

- Kalender konten 30 hari dibuat dari offer dan pain point nyata.
- Script dan shot list memberi arahan jelas untuk petugas footage.
- Video draft dibuat otomatis dari template.
- Manusia cukup approve atau memberi catatan revisi.
- Konten approved masuk scheduler.
- Mockup awal dibuat otomatis dari template.
- Lead awal tercatat ringan, lalu lead serius masuk Growth OS Lite.

## 3. Modul MVP

### 3.1 Content Calendar

Menyimpan 30 hari rencana konten.

Field utama:

- Tanggal
- Produk
- Target audiens
- Pilar konten
- Hook
- CTA keyword
- Status

### 3.2 Script & Shot List

Mengubah ide konten menjadi panduan teknis untuk petugas footage.

Field utama:

- Content ID
- Scene
- Durasi
- Instruksi visual
- Angle kamera
- Text overlay
- Catatan footage

### 3.3 Footage Inbox

Menampilkan footage dari Google Drive dan status kelayakannya.

Status footage:

- Uploaded
- Usable
- Needs Reshoot
- Wrong Folder
- Low Quality
- Sensitive / Need Blur

### 3.4 Video Draft Queue

Menampilkan job render video otomatis.

Status render:

- Queued
- Rendering
- Draft Ready
- Failed
- Revision Requested

### 3.5 Approval Board

Tempat manusia review video, caption, dan CTA.

Aksi:

- Approve
- Revisi
- Reject

### 3.6 Posting Scheduler

Menjadwalkan konten approved.

MVP tahap awal boleh semi-manual:

- Approved → Ready to Post
- Admin bisa melihat jadwal dan file video/caption

Auto-posting bisa ditambah setelah sistem stabil.

### 3.7 Mockup Generator

Membuat mockup awal otomatis dari nama sekolah, jenis sampul, warna, dan logo default/upload.

Batas:

- Mockup awal tidak direvisi.
- Revisi hanya di desain final setelah cocok penawaran.

### 3.8 Lead Log Ringan

Pencatatan manual lead awal dari channel konten.

Status lead:

- WA Masuk
- Mockup Dikirim
- Tanya Harga
- Masuk Penawaran
- Tidak Lanjut

Jika status `Masuk Penawaran`, admin input ke Pesona Growth OS Lite.

## 4. Sistem AI Agent

MVP menggunakan 6 agent inti:

1. Campaign Planner Agent
2. Script & Shot List Agent
3. Footage Intake & QA Agent
4. Video Director Agent
5. Copy, Caption & QA Agent
6. Mockup Assistant Agent

Tidak perlu DM AI Agent dan Lead Parser Agent pada MVP.

## 5. Stack teknis rekomendasi

- VPS + Docker Compose
- Web dashboard: Next.js / TypeScript
- Database: PostgreSQL
- ORM: Prisma atau setara
- Queue: Redis + BullMQ atau setara
- Workflow automation: n8n self-hosted
- Video worker: Node.js + Remotion + FFmpeg
- Mockup worker: Node.js + SVG/Canvas/Sharp renderer
- Storage footage/output: Google Drive

## 6. Handoff ke Growth OS Lite

Pesona Studio Desk tidak menggantikan Growth OS Lite.

Rule handoff:

- Lead awal dari konten tetap di Studio Desk.
- Lead yang tanya harga dan dibuatkan penawaran masuk Growth OS Lite.
- Desain final dan order tetap di Growth OS Lite.
