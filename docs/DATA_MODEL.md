# Data Model — Pesona Studio Desk MVP

## campaigns

```text
id
name
description
start_date
end_date
status
created_by
created_at
updated_at
```

## content_items

```text
id
campaign_id
content_code
planned_date
product_type
pillar
target_audience
hook
angle
cta_keyword
offer_id
pain_id
channel
status
created_at
updated_at
```

## content_scripts

```text
id
content_item_id
duration_seconds
script_text
voice_over_text
caption_draft
cover_text
status
created_at
updated_at
```

## shot_lists

```text
id
content_item_id
shot_id
scene_number
start_second
end_second
visual_instruction
camera_angle
overlay_text
required
status
created_at
updated_at
```

## footage_assets

```text
id
content_item_id
shot_id
local_file_path
google_drive_backup_file_id nullable
file_name
mime_type
duration_seconds
orientation
quality_score
tags_json
usable
warning
status
uploaded_at
created_at
updated_at
```

## render_jobs

```text
id
content_item_id
version
job_type -- video/mockup
edit_plan_json
input_assets_json
output_local_path
google_drive_backup_file_id nullable
share_url nullable
status
error_message
revision_notes
created_at
started_at
finished_at
```

## content_approvals

```text
id
content_item_id
render_job_id
reviewer_id
status -- approved/revision_requested/rejected
notes
created_at
```

## posting_schedules

```text
id
content_item_id
render_job_id
channel
scheduled_at
caption
status -- ready_to_post/scheduled/posted/failed
posted_url
created_at
updated_at
```

## mockup_requests

```text
id
lead_log_id nullable
nama_sekolah
jenis_sampul -- raport/ijazah
jenjang -- auto/sd/smp/sma/smk/mi/mts/ma
warna
logo_mode -- default/upload
logo_file_id nullable
template_id
output_file_id
status
created_by
created_at
updated_at
```

## lead_logs

```text
id
tanggal
nama
wa
nama_sekolah
channel
content_code
keyword
status -- wa_masuk/mockup_dikirim/tanya_harga/masuk_penawaran/tidak_lanjut
catatan
admin_id
created_at
updated_at
```

## templates

```text
id
template_type -- video/mockup
name
slug
product_type
color_id nullable
config_json
active
created_at
updated_at
```

## users

```text
id
name
email
password_hash
role -- owner/admin/designer/sales/footage/reviewer
active
created_at
updated_at
```

## knowledge_items

Opsional jika offer/pain point tidak hanya disimpan sebagai JSON config.

```text
id
type -- offer/pain/color/product/claim_rule
key
title
content_json
active
created_at
updated_at
```
