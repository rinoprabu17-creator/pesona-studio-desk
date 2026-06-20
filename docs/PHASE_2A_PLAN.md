# Phase 2A Plan - Campaign Planner Agent

Phase 2A berjalan bertahap. Phase 2A.1 membuat contract dan fake provider, Phase 2A.2 menambahkan generation run staging dan worker, Phase 2A.3 menambahkan review/approval, Phase 2A.4 menambahkan import manual draft approved ke operational calendar, dan Phase 2A.5A menambahkan OpenAI provider tanpa live API pada automated test.

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

Phase 2A.1 memakai `FakeCampaignPlannerProvider` saja. Phase 2A.5A menambahkan `OpenAICampaignPlannerProvider` sebagai provider tambahan yang harus diaktifkan eksplisit; default tetap Fake.

## No Caption Generation

`platform_caption` selalu `null` pada Phase 2A. Caption final menjadi scope Copy, Caption & QA Agent pada fase lain.

## Phase 2A.2 Generation Runs

Status: implemented.

Phase 2A.2 membuat migration `005_phase2a_campaign_plan_staging.sql` dengan empat staging table:

1. `campaign_plan_runs`
2. `campaign_plan_generation_batches`
3. `campaign_plan_draft_items`
4. `campaign_plan_draft_publications`

Batch table wajib karena generation berjalan per batch, perlu retry per batch, provider response id per batch, usage per batch, error per batch, observability, dan recovery worker.

Implemented scope:

- create run dari campaign owner
- input snapshot dan strategy snapshot immutable
- generation batch records ukuran default 5
- PostgreSQL polling worker
- `SELECT FOR UPDATE SKIP LOCKED`
- lease, heartbeat, stale recovery, attempt count
- Fake Provider execution
- consolidation dan validation Phase 2A.1
- draft item/publication masuk staging saat valid
- manual retry dan cancel
- minimal generate form dan run status page

Tidak ada write ke `content_items` atau `content_publications`.

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

## Phase 2A.3 Draft Review & Approval

Status: implemented.

Phase 2A.3 menambahkan review UI dan API untuk staging draft hasil generation run. Review hanya dapat dilakukan ketika run berstatus `ready_for_review`; run `approved` dan `rejected` menjadi read-only dan tidak kembali ke `ready_for_review`.

Editable creative fields:

- `title`
- `school_level`
- `color_code`
- `target_audience`
- `hook`
- `angle`
- `cta_text`
- `cta_keyword`
- `planning_reason`
- `owner_notes`
- YouTube `platform_title`

Strategy identity tetap immutable:

- `run_id`
- `draft_sequence`
- `planned_content_date`
- `product_code`
- `audience_segment`
- `content_pillar`
- `primary_offer_code`
- `primary_pain_point_code`
- publication `channel`, `publication_format`, `planned_publish_at`, dan `platform_caption`

Setiap edit dan review action item memakai `expected_revision_number`. Creative edit menaikkan `revision_number`, mengisi `edited_at`, dan mengembalikan `review_status` menjadi `pending_review`. Owner notes saja tidak menaikkan revision number dan tidak mengubah review status.

Setiap creative edit merekonstruksi `CampaignPlanDraft` dari staging rows, lalu menjalankan validasi package Campaign Planner: schema/runtime validation, reference/business validation, claim validation, duplicate title/hook validation, diversity warnings, dan YouTube title validation. Hard error menolak save dan rollback; warning disimpan dan tidak memblokir approval.

Review action item:

- approve item hanya untuk run `ready_for_review`, wajib revision cocok, dan tidak boleh ada `validation_errors`
- reject item hanya untuk run `ready_for_review`, wajib revision cocok, dan boleh membawa owner notes
- approve/reject item tidak menaikkan `revision_number`

Approve all semantics:

- action "Setujui Semua yang Siap" lock run dan seluruh item
- revalidate seluruh draft
- pending valid menjadi `approved`
- rejected tetap `rejected`
- pending dengan hard error tetap `pending_review`
- run tetap `ready_for_review`

Run approval dan rejection eksplisit:

- "Setujui Rencana" hanya `ready_for_review -> approved`
- approval run membutuhkan tidak ada pending, minimal satu approved, dan approved item bebas validation error
- approved run menunggu import pada Phase 2A.4
- "Tolak Rencana" hanya `ready_for_review -> rejected`
- rejected run terminal untuk review dan tidak menghapus staging audit

Phase 2A.3 tetap fake-only. Tidak ada OpenAI dependency, tidak ada env key OpenAI, tidak ada Responses API, tidak ada provider baru, dan tidak ada n8n workflow baru.

## Phase 2A.4 Approved Draft Import

Status: implemented.

Phase 2A.4 menambahkan import manual untuk run berstatus `approved` ke operational tables:

- hanya draft item `approved` yang diimport
- draft item `rejected` dilewati dan tetap menjadi audit staging
- `content_items` dibuat dengan `production_status = planned`
- `content_publications` dibuat dengan `publication_status = planned`
- `platform_caption`, published fields, dan failure reason tetap `null`
- staging mapping memakai `imported_content_item_id`, `imported_publication_id`, dan `imported_at`
- run selesai sebagai `imported` dengan `imported_at`

Import berjalan all-or-nothing dalam satu transaction. Lock order wajib: run `FOR UPDATE`, campaign `FOR UPDATE`, draft items berurut `draft_sequence`, draft publications berurut draft sequence/channel/format, resolve reference live, create operational rows, update mapping staging, lalu finalize run. Jika gagal, insert operational dan mapping staging rollback; run kembali terlihat `approved`.

Import reuse service operational existing:

- `createContentItemWithClient` tetap menjadi source of truth sequence, content code, campaign lock, validation, dan default production status
- `createContentPublicationWithClient` tetap menjadi source of truth channel/format matrix, duplicate guard, validation, dan default publication status
- tidak ada content code generator kedua di import service

Guard import:

- run harus `approved`, memiliki `approved_at`, belum `imported`, dan tidak memiliki pending review item
- minimal satu draft item approved
- approved item tidak boleh memiliki validation error
- reference live product/color/offer/pain point harus masih tersedia dan aktif jika digunakan
- campaign code harus sama dengan snapshot, campaign tidak completed/archived, dan tanggal approved tetap dalam periode campaign current
- mapping staging parsial pada run approved ditolak sebagai state inconsistent

Import idempotent. Jika run sudah `imported`, API dan page merekonstruksi summary dari mapping staging tanpa membuat row baru. Double-click, retry browser, dan concurrent request pada run sama aman karena lock transaction.

Route:

- Page konfirmasi: `/campaign-plan-runs/:id/import`
- API import: `POST /api/campaign-plan-runs/:id/import`

Phase 2A.4 tidak menambahkan OpenAI dependency, env key OpenAI, Responses API, provider baru, n8n workflow, auto posting, scheduler publication, atau worker import.

## Phase 2A.5A OpenAI Provider

Status: implemented.

Phase 2A.5A menambahkan OpenAI Campaign Planner Provider tanpa mengubah review, approval, import, atau kalender manual. Fake Provider tetap default untuk local development dan Docker Compose standar.

Implemented scope:

- Official `openai` JavaScript/TypeScript SDK
- Responses API melalui `client.responses.parse()`
- Structured Outputs via `zodTextFormat`
- `store: false`
- `background: false`
- tanpa tools, web search, file search, function calling, conversation state, streaming, atau previous response
- prompt builder versioned dengan default `campaign-planner-v1`
- provider factory `fake` / `openai` tanpa silent fallback
- provider/model/prompt version dipersist pada run dan batch
- existing run memakai provider/model/prompt version yang tersimpan walaupun environment berubah
- SDK retry dimatikan dengan `maxRetries: 0`; retry tetap dikontrol worker lease/max attempts
- typed error classification untuk timeout, network, rate limit, auth, request invalid, model unavailable, refusal, incomplete, dan invalid structured output
- token usage dan provider response ID dipetakan ke `campaign_plan_generation_batches`
- automated tests memakai mocked OpenAI client tanpa network dan tanpa API key nyata

OpenAI Provider tetap hanya menghasilkan creative fields:

- `title`
- `school_level`
- `color_code`
- `target_audience`
- `hook`
- `angle`
- `cta_text`
- `cta_keyword`
- `planning_reason`
- `youtube_title`

Strategy identity tetap authority deterministic builder dan consolidation:

- `draft_sequence`
- `planned_content_date`
- `product_code`
- `audience_segment`
- `content_pillar`
- `primary_offer_code`
- `primary_pain_point_code`
- publication `channel`, `publication_format`, dan `planned_publish_at`

Manual review/import tetap unchanged. Tidak ada auto posting, scheduler publication, n8n workflow, OpenAI Agents SDK, multi-agent framework, pricing, quotation, Growth OS Lite integration, Google Drive integration, video render, atau mockup render pada Phase 2A.5A.

## Batch Worker

Phase 2A.2 memakai worker `campaign-planner-worker` dengan PostgreSQL polling. Worker dapat berjalan long-running melalui Docker Compose atau one-shot untuk test.

Tidak memakai n8n sebagai core Campaign Planner. Tidak ada background scheduler untuk auto posting.

## Security

Phase 2A.1 sampai Phase 2A.4 tidak membutuhkan API key. Phase 2A.5A membuat OpenAI provider optional:

- API key hanya dibaca server-side oleh worker
- prioritas `OPENAI_API_KEY_FILE` lalu `OPENAI_API_KEY`
- tidak dikirim ke browser
- tidak disimpan di database
- tidak dicetak ke log
- live API tidak dipakai automated test

## Explicit Non-Scope

Tidak ada OpenAI dependency, OpenAI API call, Redis queue/BullMQ, n8n workflow baru, auto posting, publication scheduler, Google Drive integration, video render, mockup render, pricing, quotation, Growth OS Lite integration, authentication, atau analytics dashboard pada Phase 2A.4.
