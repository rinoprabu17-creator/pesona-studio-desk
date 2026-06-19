# Phase 2A Plan - Campaign Planner Agent

Phase 2A.1 hanya membuat contract, strategy deterministic, fake provider, consolidation, dan validation. Belum ada OpenAI integration, route, staging table, worker, import flow, atau write ke operational tables.

## One Logical Agent

Campaign Planner tetap satu logical agent:

1. Deterministic Strategy Builder
2. Provider batch generation
3. Consolidation
4. Schema validation
5. Reference validation
6. Claim validation
7. Duplicate/diversity validation

Tidak ada multi-agent framework pada MVP.

## Deterministic Strategy

Strategy builder menentukan identity yang tidak boleh diubah provider:

- `draft_sequence`
- `planned_content_date`
- `product_code`
- `audience_segment`
- `content_pillar`
- `primary_offer_code`
- `primary_pain_point_code`
- publication channel, format, dan planned publish time

Distribusi pillar default untuk 30 konten:

- `mockup_magnet`: 7
- `desain_gratis`: 5
- `trust_process`: 4
- `pain_point`: 5
- `product_proof`: 3
- `offer`: 3
- `agent`: 2
- `education`: 1

Jumlah lain memakai largest-remainder allocation agar total persis dan stabil.

## Provider Responsibility

Provider hanya mengisi creative fields: title, school level, color suggestion, target audience, hook, angle, CTA, planning reason, dan YouTube title.

Provider tidak boleh menentukan tanggal, pillar, product, offer, pain point, channel, format, atau publish time.

Phase 2A.1 memakai `FakeCampaignPlannerProvider` saja. OpenAI provider ditunda ke Phase 2A.5.

## No Caption Generation

`platform_caption` selalu `null` pada Phase 2A. Caption final menjadi scope Copy, Caption & QA Agent pada fase lain.

## Staging Tables Untuk Fase Berikutnya

Migration belum dibuat pada Phase 2A.1. Fase berikutnya direncanakan memakai empat tabel:

1. `campaign_plan_runs`
2. `campaign_plan_generation_batches`
3. `campaign_plan_draft_items`
4. `campaign_plan_draft_publications`

Batch table wajib karena generation berjalan per batch, perlu retry per batch, provider response id per batch, usage per batch, error per batch, observability, dan recovery worker.

## Run Status

Status run untuk fase berikutnya:

- `queued`
- `generating`
- `validation_failed`
- `ready_for_review`
- `approved`
- `importing`
- `imported`
- `failed`
- `rejected`
- `cancelled`

`validation_failed` dan `failed` boleh retry ke `queued`. Run hanya boleh `approved` jika tidak ada item `pending_review`, minimal satu item `approved`, dan item `rejected` tidak diimport.

## Review Status

Draft item review status untuk fase berikutnya:

- `pending_review`
- `approved`
- `rejected`

Jangan gunakan `edited` sebagai review status. Gunakan `edited_at nullable` dan `revision_number integer default 0`. Jika item approved diedit, status kembali ke `pending_review` dan revision number bertambah.

## Batch Worker Recommendation

Fase worker belum diimplementasikan. Rekomendasi fase berikutnya:

- PostgreSQL polling
- `SELECT FOR UPDATE SKIP LOCKED`
- lease/heartbeat
- attempt count
- stale job recovery

Tidak memakai n8n sebagai core Campaign Planner. Tidak ada background scheduler untuk auto posting.

## Import Strategy

Import ke operational tables dilakukan pada fase berikutnya setelah owner approval eksplisit. Strategi MVP:

- all-or-nothing transaction
- lock run dan campaign
- revalidate active references
- gunakan logic existing content item untuk sequence dan content code
- publication masuk dengan `publication_status = planned`
- retry import tidak boleh membuat duplicate content

## Security

Phase 2A.1 tidak membutuhkan API key. OpenAI provider deferred ke Phase 2A.5. Saat nanti dibuat:

- API key hanya dari environment
- tidak dikirim ke browser
- tidak disimpan di database
- tidak dicetak ke log
- live API tidak dipakai automated test

## Explicit Non-Scope

Tidak ada OpenAI dependency, OpenAI API call, migration 005, staging table, route/page, worker, Redis queue/BullMQ, n8n workflow, operational content write, atau auto posting.
