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

Task Phase 1B.1 hanya mengimplementasikan migration 002 untuk campaign management.
Migration 003 dan 004 belum diimplementasikan.

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
