# Workflows — Pesona Studio Desk

## Workflow 1 — Generate Campaign 30 Hari

```text
Owner/Admin klik Generate Campaign
→ Campaign Planner Agent membaca campaign_knowledge_base
→ Sistem membuat 30 content_items
→ Sistem membuat folder Google Drive per content_code
→ Status content: Planned
```

## Workflow 2 — Generate Script + Shot List

```text
content.status = Planned
→ Script & Shot List Agent membuat script dan shot list
→ Status content: Waiting Footage
→ Petugas footage melihat daftar shot
```

## Workflow 3 — Upload Footage

```text
Petugas upload ke folder Google Drive sesuai content_code
→ n8n mendeteksi file baru
→ Sistem ambil metadata dan sample frame
→ Footage Intake & QA Agent mengecek footage
→ Status footage: Usable / Needs Reshoot / Low Quality
```

## Workflow 4 — Render Video Draft

```text
Footage minimum lengkap
→ Video Director Agent membuat edit_plan.json
→ Video Render Worker menjalankan render
→ Output MP4 diupload ke Google Drive
→ Status content: Draft Ready
```

## Workflow 5 — Approval / Revisi

```text
Reviewer membuka Approval Board
→ Lihat video, caption, CTA, risk flag
→ Approve / Revisi / Reject

Jika Approve:
→ Status content: Approved
→ Masuk scheduler

Jika Revisi:
→ Reviewer menulis catatan revisi
→ Video Director Agent membuat edit_plan baru
→ Render Worker render ulang v2
→ Kembali ke Draft Ready
```

## Workflow 6 — Scheduler Posting

Tahap 1 MVP:

```text
Approved
→ Ready to Post
→ Admin posting manual/semi-manual
→ Admin isi posted_url
→ Status: Posted
```

Tahap 2 nanti:

```text
Approved
→ Scheduler API IG/FB
→ Auto posting
→ Sistem simpan posted_url
```

## Workflow 7 — Mockup Awal Otomatis

```text
Lead masuk WA
→ Sales/admin takeover manusia
→ Admin buka Mockup Generator
→ Input nama sekolah + jenis sampul + warna/logo
→ Mockup Assistant Agent memilih template
→ Mockup Render Worker membuat PNG/JPG
→ Sales cek cepat
→ Sales kirim manual via WA
→ Lead status: Mockup Dikirim
```

## Workflow 8 — Lead Log Ringan

```text
Admin input lead awal
→ Status: WA Masuk
→ Jika mockup dikirim: Mockup Dikirim
→ Jika tanya harga serius: Tanya Harga
→ Jika dibuat penawaran: Masuk Penawaran
→ Admin input ke Pesona Growth OS Lite
```
