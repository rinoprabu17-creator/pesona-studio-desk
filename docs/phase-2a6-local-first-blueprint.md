# Phase 2A.6A - Local-First Blueprint Alignment

Dokumen ini mencatat keputusan owner terbaru untuk Pesona Studio Desk. Scope phase ini hanya blueprint, dokumentasi, dan config non-runtime. Tidak ada migration, route baru, live API call, auto posting, custom DM bot, atau perubahan business rules Campaign Planner.

## 1. Local office server architecture

Pesona Studio Desk memakai arsitektur local-first untuk MVP awal. Target deployment utama adalah server lokal kantor:

- Lenovo i7-7700
- Ubuntu Server
- RAM target 32GB
- SSD target 2TB
- UPS
- Tanpa GPU pada fase awal
- Docker Compose untuk menjalankan app, PostgreSQL, Redis, n8n, dan worker

VPS tidak dibutuhkan pada MVP awal. VPS hanya dievaluasi lagi jika owner meminta akses publik, uptime lebih tinggi, atau kebutuhan operasional yang tidak cocok dengan server kantor.

## 2. Office-hours server assumption

Server lokal diasumsikan berjalan sekitar 08.00-20.00. Sistem tidak wajib 24 jam pada MVP awal.

Dampak operasional:

- Job berat seperti render video dan mockup dijalankan saat server hidup.
- Queue harus tahan retry jika server mati di luar jam operasional.
- Aktivitas frontliner 24 jam ditangani oleh WhatsApp Business AI, bukan core server Studio Desk.

## 3. Storage policy

SSD lokal 2TB adalah storage kerja utama untuk:

- footage masuk
- file kerja render
- output draft video
- output mockup awal
- export operasional yang masih aktif

Desain final PDF tetap dipegang admin desain terpisah dan bukan core storage Studio Desk.

Prinsip:

- Jangan menjadikan Google Drive sebagai working directory utama.
- Jangan hard-code path storage; gunakan env/config jika nanti diwiring.
- Cleanup output lama perlu direncanakan pada phase hardening berikutnya.

## 4. Google Drive/offsite backup role

Google Drive dipakai untuk backup/sharing penting:

- backup file output penting
- sharing file ke admin/desainer/sales jika perlu
- arsip terpilih yang perlu akses luar kantor

Google Drive bukan sumber utama footage harian dan bukan storage utama render/output. Integrasi Drive tetap boleh ada nanti sebagai backup/offsite workflow, bukan sebagai dependency utama produksi harian.

## 5. Native Meta/WA lead bridge

Flow MVP untuk IG/FB:

1. Konten memakai CTA keyword utama `MOCKUP`.
2. Test Meta Business Suite comment-to-DM native.
3. DM mengarahkan calon customer ke WhatsApp.
4. WhatsApp Business AI menjadi frontliner 24 jam.
5. Manusia takeover saat lead serius, tanya harga, atau perlu penawaran.

Studio Desk tetap mencatat lead ringan dan status handoff. Sistem tidak membuat custom DM bot pada MVP awal.

## 6. ManyChat deferred decision

ManyChat tidak masuk MVP awal. Statusnya deferred/cadangan.

ManyChat hanya boleh dievaluasi ulang jika native Meta Business Suite tidak cukup, volume lead meningkat, dan owner menyetujui integrasi baru.

## 7. TikTok limited/manual flow

TikTok dibuat lebih manual:

- CTA di video
- link WhatsApp di bio
- pinned comment menuju WhatsApp
- admin mencatat lead jika masuk

Tidak ada integrasi TikTok API, auto-DM rumit, scraping, atau automation yang berisiko melanggar platform pada MVP awal.

## 8. AI local vs OpenAI work split

AI lokal/rule-based dipakai untuk kerja murah/rutin:

- footage organization
- tagging
- draft hook/caption kasar
- repurpose caption
- claim checker
- lead scoring ringan
- template mockup awal
- render video template/FFmpeg

OpenAI GPT-5.4 mini tetap default paid API untuk:

- campaign planner final
- script final
- caption final
- quality check konten penting

Premium model hanya dipakai manual approval/sesekali. Jangan menambah Gemini, Claude, ManyChat, WhatsApp API, TikTok API, atau API baru pada phase ini.

## 9. Posting target

Posting terakhir ditargetkan jam 19.00 agar konten sudah siap sebelum prime time jam 20.00.

Implikasi:

- Calendar/scheduler harus menjaga target publish manual sekitar 19.00.
- Admin tetap melakukan review sebelum konten dianggap siap.
- Auto posting belum masuk MVP phase ini.

## 10. Explicitly out of MVP

Hal berikut tetap di luar MVP kecuali owner meminta eksplisit:

- Auto pricing
- Auto quotation
- Auto input semua lead ke Pesona Growth OS Lite
- WA chatbot panjang
- Custom DM bot
- Integrasi ManyChat
- Integrasi WhatsApp API
- Integrasi TikTok API
- TikTok auto-DM atau automation rumit
- Lead scoring kompleks
- Auto closing sales
- Auto desain final Corel/PDF
- Auto revisi desain final
- Scraping ilegal atau automation yang melanggar platform
- Mockup revision workflow
- Auto posting
- Produk selain Sampul Raport dan Sampul Ijazah

## 11. Phase 2A.6A checklist

- [ ] Local server readiness: Ubuntu Server, Docker Compose, RAM 32GB, SSD 2TB, UPS.
- [ ] Backup readiness: database backup, selected output backup, restore test plan.
- [ ] Meta Business Suite test: comment-to-DM native dengan keyword `MOCKUP`.
- [ ] WA AI rules test: frontliner 24 jam mengarah ke manusia saat lead serius.
- [ ] TikTok CTA test: video CTA, link WA bio, pinned comment.
- [ ] AI budget guard next phase: local/rule-based default dan paid model dibatasi.
