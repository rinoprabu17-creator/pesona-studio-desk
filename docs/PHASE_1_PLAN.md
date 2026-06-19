# Phase 1 Plan

Dokumen ini mencatat keputusan Phase 1. Implementasi saat ini hanya Phase 1A — Data Foundation.

## Phase 1A — Data Foundation

Scope Phase 1A:

- Database connection PostgreSQL memakai `pg`.
- Migration ledger dan migration runner eksplisit.
- Migration library: `products`, `colors`, `school_level_color_defaults`, `offers`, `pain_points`.
- Seed idempotent dari `configs/campaign_knowledge_base.json`.
- API library.
- Halaman library.
- Edit warna dan rekomendasi warna jenjang.

Di luar scope Phase 1A:

- Campaign CRUD.
- Content item.
- Publication schedule.
- Manual content calendar.
- AI agent.
- Google Drive.
- Render video/mockup.
- Auto posting.
- WhatsApp/DM automation.
- Pricing/quotation.
- Growth OS Lite integration.
- Authentication.
- Analytics.

## Phase 1B — Manual Content Calendar

Phase 1B dipecah menjadi migration bertahap:

```text
migrations/002_phase1b_campaigns.sql
migrations/003_phase1b_content_items.sql
migrations/004_phase1b_content_publications.sql
```

Status implementasi bertahap:

- Migration 002: `campaigns` — implemented pada Phase 1B.1.
- Migration 003: `content_items` — implemented pada Phase 1B.2.
- Migration 004: `content_publications` — belum diimplementasikan.

## Keputusan Phase 1B

Catatan ini bukan izin untuk mengimplementasikan seluruh Phase 1B sekaligus.

Keputusan yang harus dipertahankan:

1. `campaigns.primary_product_id` nullable. Null berarti campaign campuran Sampul Raport dan Sampul Ijazah.
2. `content_items.product_id` nullable. Null berarti konten berlaku untuk kedua produk atau bersifat umum.
3. Gunakan `planned_content_date`, bukan `planned_date`, agar berbeda dari `content_publications.planned_publish_at`.
4. `content_items` memiliki:
   - `cta_text text not null`
   - `cta_keyword text nullable`
5. `school_level` memakai whitelist:
   - `sd`
   - `smp`
   - `sma`
   - `smk`
   - `mi`
   - `mts`
   - `ma`
   - `other`
6. `content_publications` unique:
   - `content_item_id + channel + publication_format`
7. Channel:
   - `instagram`
   - `facebook`
   - `tiktok`
   - `youtube`
   - `whatsapp_status`
8. YouTube MVP menggunakan `short_video`.
9. `standard_video` hanya struktur masa depan dan bukan fitur long-form Phase 1.

## Keputusan Phase 1B.2 — Content Items

Phase 1B.2 hanya mengelola ide/karya utama konten. Publication, channel, format, jadwal posting, dan calendar belum diimplementasikan.

Keputusan teknis:

- `content_items.product_id` nullable. Null berarti konten umum atau berlaku untuk Sampul Raport dan Sampul Ijazah.
- `planned_content_date` wajib dan harus berada dalam periode campaign.
- `cta_text` wajib.
- `cta_keyword` opsional, dinormalisasi uppercase, maksimal 40 karakter, format huruf/angka/underscore/tanda hubung.
- Identitas content item immutable setelah create:
  - `campaign_id`
  - `sequence_number`
  - `content_code`
- `content_code` dibuat otomatis dari `campaign.code + "-D" + sequence_number`.
- Sequence dibuat dalam transaction PostgreSQL:
  - `SELECT campaign FOR UPDATE`
  - ambil `MAX(sequence_number)`
  - insert content item
  - unique constraint tetap menjadi perlindungan tambahan.
- Jika campaign sudah memiliki content item:
  - `campaigns.code` tidak boleh diganti.
  - perubahan periode campaign tidak boleh membuat `planned_content_date` existing berada di luar periode baru.

Production status transition:

```text
planned -> script_ready | failed | archived
script_ready -> waiting_footage | failed | archived
waiting_footage -> footage_received | failed | archived
footage_received -> rendering | failed | archived
rendering -> draft_ready | failed | archived
draft_ready -> approved | needs_revision | failed | archived
needs_revision -> rendering | failed | archived
approved -> archived
failed -> archived
archived -> tidak ada next transition
```
