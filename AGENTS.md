# AGENTS.md — Instruksi untuk Codex

Dokumen ini adalah instruksi utama untuk Codex saat membangun repo **Pesona Studio Desk**.

## Peran Codex

Codex bertindak sebagai software engineer yang membangun sistem MVP secara bertahap. Codex tidak boleh mengubah arah produk tanpa konfirmasi owner.

## Baca sebelum coding

Sebelum mengerjakan task apa pun, baca file berikut:

1. `README.md`
2. `docs/PROJECT_BLUEPRINT.md`
3. `docs/SYSTEM_BOUNDARY.md`
4. `docs/AI_AGENTS_SPEC.md`
5. `docs/DATA_MODEL.md`
6. `docs/MVP_BUILD_SEQUENCE.md`
7. `configs/campaign_knowledge_base.json`

## Prinsip teknis

- Bangun MVP kecil dulu, jangan overengineering.
- Gunakan arsitektur local-first untuk MVP awal: server lokal kantor lebih dulu, VPS hanya jika owner menyetujui nanti.
- Gunakan Docker Compose untuk local/dev deployment dan server lokal kantor Ubuntu Server.
- Simpan semua secret di `.env`, jangan hard-code API key.
- Gunakan PostgreSQL untuk database utama.
- Gunakan Redis/queue untuk job render video dan mockup.
- Gunakan SSD lokal server sebagai storage kerja utama.
- Gunakan Google Drive hanya untuk backup/sharing penting, bukan storage kerja utama.
- Gunakan worker terpisah untuk render video dan mockup.
- Semua fitur berat harus asynchronous: render video, render mockup, upload/download file.
- Selalu buat migration/schema yang jelas.
- Selalu buat seed data minimal untuk campaign knowledge base.
- Utamakan UI sederhana dan operasional.
- Utamakan integrasi native platform lebih dulu untuk comment/DM: Meta Business Suite comment-to-DM, WA Business AI, CTA TikTok manual.
- Jaga biaya AI: local/rule-based dulu untuk pekerjaan rutin, GPT-5.4 mini untuk output final/quality check, premium model hanya dengan approval manual.

## Batasan produk yang tidak boleh dilanggar

Jangan membangun fitur berikut dalam MVP kecuali owner meminta secara eksplisit:

- Auto pricing
- Auto quotation
- Auto input semua lead ke Pesona Growth OS Lite
- WA chatbot panjang
- Lead scoring kompleks
- Auto closing sales
- Auto desain final Corel/PDF
- Auto revisi desain final
- Scraping ilegal atau automation yang melanggar platform
- Custom DM bot tanpa approval owner
- Integrasi ManyChat sebelum owner approval
- Integrasi WhatsApp API sebelum owner approval
- Integrasi TikTok API sebelum owner approval
- Mockup revision workflow
- Produk selain Sampul Raport dan Sampul Ijazah

## Alur bisnis wajib

Konten → komentar/DM → WA → manusia takeover → mockup awal → tanya harga/penawaran → Growth OS Lite → desain final gratis → revisi sampai Desain OK → DP → order/produksi.

## Bahasa UI

Gunakan Bahasa Indonesia.

Contoh istilah status:

- Direncanakan
- Script Siap
- Menunggu Footage
- Footage Masuk
- Draft Dirender
- Draft Siap Review
- Perlu Revisi
- Disetujui
- Dijadwalkan
- Terposting
- Gagal

## Style coding

- TypeScript untuk app dan worker.
- Pisahkan kode domain bisnis dari UI.
- Buat service layer untuk operasi penting.
- Buat validasi input.
- Gunakan enum untuk status.
- Buat komponen UI sederhana, bukan desain rumit.
- Tambahkan logging pada job render, storage lokal, dan backup/sharing Google Drive jika ada.

## Cara kerja task

Untuk setiap task:

1. Jelaskan rencana singkat.
2. Implementasi perubahan kecil.
3. Jalankan test/build/lint jika tersedia.
4. Laporkan file yang diubah.
5. Jangan lanjut ke task berikutnya sebelum owner approve.

## Acceptance standard

Sebuah fitur dianggap selesai jika:

- Bisa dijalankan di Docker/dev environment.
- Ada UI minimal untuk admin.
- Data tersimpan di PostgreSQL.
- Status workflow terlihat jelas.
- Error tidak membuat sistem berhenti total.
- Tidak ada credential bocor di repo.
