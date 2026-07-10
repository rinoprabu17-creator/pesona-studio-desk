CREATE TABLE ops_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  product_type text NOT NULL,
  theme text NOT NULL,
  start_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ops_campaigns_product_check CHECK (product_type = ANY (ARRAY['sampul_raport', 'sampul_ijazah'])),
  CONSTRAINT ops_campaigns_status_check CHECK (status = ANY (ARRAY['active', 'paused', 'completed', 'archived']))
);

CREATE TABLE ops_content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES ops_campaigns(id) ON DELETE CASCADE,
  planned_date date NOT NULL,
  content_code text NOT NULL,
  campaign_theme text NOT NULL,
  angle text NOT NULL,
  caption text NOT NULL,
  hashtags text[] NOT NULL DEFAULT '{}',
  cta text NOT NULL,
  script_json jsonb NOT NULL,
  shot_list_json jsonb NOT NULL,
  status text NOT NULL DEFAULT 'script_siap',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ops_content_items_code_key UNIQUE (campaign_id, content_code),
  CONSTRAINT ops_content_items_status_check CHECK (
    status = ANY (ARRAY[
      'direncanakan',
      'script_siap',
      'menunggu_footage',
      'footage_masuk',
      'draft_dirender',
      'draft_siap_review',
      'perlu_revisi',
      'disetujui',
      'dijadwalkan',
      'terposting',
      'gagal'
    ])
  )
);

CREATE TABLE ops_footage_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_root text NOT NULL,
  file_path text NOT NULL,
  relative_path text NOT NULL,
  filename text NOT NULL,
  extension text NOT NULL,
  size_bytes bigint NOT NULL,
  mtime_ms bigint NOT NULL,
  ffprobe_json jsonb NOT NULL,
  duration_seconds numeric,
  width integer,
  height integer,
  orientation text NOT NULL,
  qa_status text NOT NULL DEFAULT 'usable',
  tags text[] NOT NULL DEFAULT '{}',
  linked_content_item_id uuid REFERENCES ops_content_items(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ops_footage_assets_file_key UNIQUE (source_root, relative_path),
  CONSTRAINT ops_footage_assets_orientation_check CHECK (orientation = ANY (ARRAY['vertical', 'horizontal', 'square', 'unknown'])),
  CONSTRAINT ops_footage_assets_status_check CHECK (qa_status = ANY (ARRAY['usable', 'needs_review', 'invalid', 'blocked']))
);

CREATE TABLE ops_video_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES ops_content_items(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'queued',
  provider text NOT NULL DEFAULT 'mock',
  source_root text NOT NULL,
  output_root text NOT NULL,
  output_path text,
  render_plan_path text,
  caption text,
  hashtags text[] NOT NULL DEFAULT '{}',
  cta text,
  codec_video text,
  codec_audio text,
  width integer,
  height integer,
  pix_fmt text,
  duration_seconds numeric,
  size_bytes bigint,
  error_message text,
  revision_notes text,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 2,
  queued_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ops_video_jobs_status_check CHECK (
    status = ANY (ARRAY['queued', 'rendering', 'draft_ready', 'failed', 'revision_requested', 'approved', 'rejected'])
  )
);

CREATE TABLE ops_posting_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES ops_content_items(id) ON DELETE CASCADE,
  video_job_id uuid REFERENCES ops_video_jobs(id) ON DELETE SET NULL,
  channel text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  caption text NOT NULL,
  status text NOT NULL DEFAULT 'ready_to_post',
  posted_url text,
  posted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ops_posting_schedules_channel_check CHECK (channel = ANY (ARRAY['instagram', 'facebook', 'tiktok', 'youtube'])),
  CONSTRAINT ops_posting_schedules_status_check CHECK (status = ANY (ARRAY['ready_to_post', 'scheduled', 'posted', 'failed', 'cancelled']))
);

CREATE TABLE ops_mockup_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  school_name text NOT NULL,
  product_type text NOT NULL,
  color_mode text NOT NULL DEFAULT 'auto',
  color_hex text NOT NULL DEFAULT '#6E1F1F',
  city text,
  logo_path text,
  status text NOT NULL DEFAULT 'queued',
  output_path text,
  error_message text,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 2,
  queued_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ops_mockup_jobs_product_check CHECK (product_type = ANY (ARRAY['sampul_raport', 'sampul_ijazah'])),
  CONSTRAINT ops_mockup_jobs_status_check CHECK (status = ANY (ARRAY['queued', 'rendering', 'ready', 'failed']))
);

CREATE TABLE ops_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_date date NOT NULL DEFAULT current_date,
  name text NOT NULL,
  wa text,
  school_name text,
  channel text NOT NULL,
  content_item_id uuid REFERENCES ops_content_items(id) ON DELETE SET NULL,
  mockup_job_id uuid REFERENCES ops_mockup_jobs(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'WA Masuk',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ops_leads_status_check CHECK (
    status = ANY (ARRAY['WA Masuk', 'Mockup Dikirim', 'Tanya Harga', 'Masuk Penawaran', 'Tidak Lanjut'])
  )
);

ALTER TABLE ops_mockup_jobs
  ADD CONSTRAINT ops_mockup_jobs_lead_fk FOREIGN KEY (lead_id) REFERENCES ops_leads(id) ON DELETE SET NULL;

CREATE INDEX ops_content_items_campaign_id_idx ON ops_content_items(campaign_id);
CREATE INDEX ops_content_items_planned_date_idx ON ops_content_items(planned_date);
CREATE INDEX ops_footage_assets_status_idx ON ops_footage_assets(qa_status);
CREATE INDEX ops_video_jobs_status_idx ON ops_video_jobs(status);
CREATE INDEX ops_video_jobs_content_item_id_idx ON ops_video_jobs(content_item_id);
CREATE INDEX ops_posting_schedules_status_idx ON ops_posting_schedules(status);
CREATE INDEX ops_mockup_jobs_status_idx ON ops_mockup_jobs(status);
CREATE INDEX ops_leads_status_idx ON ops_leads(status);
CREATE INDEX ops_leads_channel_idx ON ops_leads(channel);
