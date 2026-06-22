# AI Agents Spec — Pesona Studio Desk

## Agent 1 — Campaign Planner Agent

### Tugas

Membuat kalender konten 30 hari berdasarkan:

- Offer Library
- Pain Point Library
- Product Library
- Color Library
- Claim Rules

### Input

```json
{
  "campaign_name": "Sampul Raport & Ijazah Juni",
  "duration_days": 30,
  "products": ["sampul_raport", "sampul_ijazah"],
  "target_channels": ["instagram", "facebook", "tiktok", "wa_status"],
  "target_audiences": ["sekolah", "tu_operator", "kepala_sekolah", "yayasan", "agen"]
}
```

### Output

```json
{
  "content_id": "SR-D01-MOCKUP",
  "date": "2026-06-01",
  "pillar": "mockup_magnet",
  "product": "sampul_raport",
  "target_audience": "tu_operator",
  "hook": "Mau lihat nama sekolahmu tampil di Sampul Raport custom?",
  "angle": "Mockup awal gratis",
  "cta_keyword": "MOCKUP",
  "offer_id": "free_mockup_initial",
  "pain_id": null,
  "footage_brief": "close-up sampul, layar mockup, stack produk",
  "risk_note": "Jangan sebut desain final gratis tanpa syarat"
}
```

## Agent 2 — Script & Shot List Agent

### Tugas

Mengubah content item menjadi script video detail dan shot list untuk petugas footage.

### Output wajib

- Durasi video
- Scene per detik
- Instruksi visual
- Angle kamera
- Text overlay
- Voice over opsional
- Catatan teknis footage

## Cost Guard Phase 2A.6A

MVP memakai pembagian kerja AI berikut:

- Local/rule-based untuk footage organization, tagging, draft hook/caption kasar, repurpose caption, claim checker, lead scoring ringan, template mockup awal, dan render video template/FFmpeg.
- OpenAI GPT-5.4 mini untuk campaign planner final, script final, caption final, dan quality check konten penting.
- Premium model hanya dipakai manual approval/sesekali.
- Jangan menambah Gemini, Claude, ManyChat, WhatsApp API, TikTok API, atau API baru tanpa approval owner.

## Agent 3 — Footage Intake & QA Agent

### Tugas

Mengecek footage yang masuk ke storage lokal server. Google Drive hanya menjadi backup/sharing penting.

### Output wajib

- File cocok dengan shot apa
- Orientasi video
- Kualitas visual
- Tag footage
- Warning jika butuh reshoot/blur

## Agent 4 — Video Director Agent

### Tugas

Membuat edit plan JSON untuk render worker.

Agent ini tidak merender video sendiri. Render dilakukan oleh Video Render Worker.

### Output wajib

- Template video
- Urutan scene
- Clip yang dipakai
- Durasi tiap clip
- Text overlay
- Timing overlay
- CTA
- Caption draft pointer

## Agent 5 — Copy, Caption & QA Agent

### Tugas

Membuat caption, hashtag, cover text, dan memeriksa klaim promosi.

### Claim rules wajib

- `Gratis Ongkir` harus menyebut `Kota Medan`.
- `Gratis Klise` harus menyebut `di atas 100 eksemplar` dan `setelah Desain OK`.
- `Garansi` harus dibatasi untuk `cacat produksi`.
- `Desain Gratis` harus menyebut `setelah cocok penawaran`.
- `DP` harus dikaitkan dengan `setelah Desain OK`.
- Jangan menjanjikan revisi mockup.

## Agent 6 — Mockup Assistant Agent

### Tugas

Membantu membuat mockup awal otomatis.

Agent ini memilih template, warna, logo default, dan aturan layout. Mockup renderer yang membuat PNG/JPG.

### Input minimal

- Nama sekolah
- Jenis sampul: Raport / Ijazah
- Warna: auto/manual
- Logo: default/upload
- Kota/kabupaten opsional

### Output

- Template terpilih
- Warna terpilih
- Logo terpilih
- Layout data
- Render job

## Agent opsional nanti

### Comment/DM Intent Agent

Belum perlu pada MVP. Awalnya cukup keyword trigger: MOCKUP, RAPORT, IJAZAH, DESAIN, AGEN, HARGA.

### Lead Parser Agent

Belum perlu pada MVP. Admin input lead manual dulu.
