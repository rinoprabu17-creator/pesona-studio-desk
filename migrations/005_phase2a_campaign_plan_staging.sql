CREATE TABLE campaign_plan_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id),
  status text NOT NULL DEFAULT 'queued',
  provider text NOT NULL DEFAULT 'fake',
  model text NOT NULL,
  prompt_version text NOT NULL,
  requested_content_count integer NOT NULL,
  selected_channels text[] NOT NULL,
  owner_brief text,
  default_posting_times jsonb,
  input_snapshot jsonb NOT NULL,
  strategy_snapshot jsonb NOT NULL,
  plan_summary text,
  validation_summary jsonb,
  error_code text,
  error_message text,
  attempt_count integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz,
  claimed_at timestamptz,
  claimed_by text,
  heartbeat_at timestamptz,
  lease_expires_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  imported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaign_plan_runs_status_check CHECK (
    status = ANY (ARRAY['queued', 'generating', 'validation_failed', 'ready_for_review', 'approved', 'importing', 'imported', 'failed', 'rejected', 'cancelled'])
  ),
  CONSTRAINT campaign_plan_runs_requested_count_check CHECK (requested_content_count BETWEEN 1 AND 30),
  CONSTRAINT campaign_plan_runs_attempt_count_check CHECK (attempt_count >= 0),
  CONSTRAINT campaign_plan_runs_selected_channels_nonempty_check CHECK (array_length(selected_channels, 1) >= 1),
  CONSTRAINT campaign_plan_runs_input_snapshot_object_check CHECK (jsonb_typeof(input_snapshot) = 'object'),
  CONSTRAINT campaign_plan_runs_strategy_snapshot_array_check CHECK (jsonb_typeof(strategy_snapshot) = 'array'),
  CONSTRAINT campaign_plan_runs_validation_summary_object_check CHECK (
    validation_summary IS NULL OR jsonb_typeof(validation_summary) = 'object'
  )
);

CREATE UNIQUE INDEX campaign_plan_runs_one_unresolved_per_campaign_idx
  ON campaign_plan_runs (campaign_id)
  WHERE status IN ('queued', 'generating', 'validation_failed', 'ready_for_review', 'approved', 'importing', 'failed');
CREATE INDEX campaign_plan_runs_campaign_id_idx ON campaign_plan_runs (campaign_id);
CREATE INDEX campaign_plan_runs_status_next_attempt_idx ON campaign_plan_runs (status, next_attempt_at);
CREATE INDEX campaign_plan_runs_lease_expires_at_idx ON campaign_plan_runs (lease_expires_at);
CREATE INDEX campaign_plan_runs_created_at_idx ON campaign_plan_runs (created_at);

CREATE TABLE campaign_plan_generation_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES campaign_plan_runs(id),
  batch_number integer NOT NULL,
  sequence_start integer NOT NULL,
  sequence_end integer NOT NULL,
  strategy_slots jsonb NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  provider text NOT NULL DEFAULT 'fake',
  model text NOT NULL,
  provider_response_id text,
  provider_output jsonb,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  attempt_count integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz,
  claimed_at timestamptz,
  claimed_by text,
  heartbeat_at timestamptz,
  lease_expires_at timestamptz,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaign_plan_batches_status_check CHECK (
    status = ANY (ARRAY['queued', 'generating', 'completed', 'validation_failed', 'failed', 'cancelled'])
  ),
  CONSTRAINT campaign_plan_batches_batch_number_check CHECK (batch_number > 0),
  CONSTRAINT campaign_plan_batches_sequence_start_check CHECK (sequence_start > 0),
  CONSTRAINT campaign_plan_batches_sequence_end_check CHECK (sequence_end >= sequence_start),
  CONSTRAINT campaign_plan_batches_attempt_count_check CHECK (attempt_count >= 0),
  CONSTRAINT campaign_plan_batches_strategy_slots_array_check CHECK (jsonb_typeof(strategy_slots) = 'array'),
  CONSTRAINT campaign_plan_batches_provider_output_object_check CHECK (
    provider_output IS NULL OR jsonb_typeof(provider_output) = 'object'
  ),
  CONSTRAINT campaign_plan_batches_usage_nonnegative_check CHECK (
    (input_tokens IS NULL OR input_tokens >= 0)
    AND (output_tokens IS NULL OR output_tokens >= 0)
    AND (total_tokens IS NULL OR total_tokens >= 0)
  ),
  CONSTRAINT campaign_plan_batches_run_batch_key UNIQUE (run_id, batch_number),
  CONSTRAINT campaign_plan_batches_run_sequence_key UNIQUE (run_id, sequence_start, sequence_end)
);

CREATE INDEX campaign_plan_batches_run_batch_idx ON campaign_plan_generation_batches (run_id, batch_number);
CREATE INDEX campaign_plan_batches_status_next_attempt_idx ON campaign_plan_generation_batches (status, next_attempt_at);
CREATE INDEX campaign_plan_batches_lease_expires_at_idx ON campaign_plan_generation_batches (lease_expires_at);

CREATE TABLE campaign_plan_draft_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES campaign_plan_runs(id),
  draft_sequence integer NOT NULL,
  planned_content_date date NOT NULL,
  title text NOT NULL,
  product_code text,
  school_level text,
  color_code text,
  audience_segment text NOT NULL,
  target_audience text NOT NULL,
  content_pillar text NOT NULL,
  primary_offer_code text,
  primary_pain_point_code text,
  hook text NOT NULL,
  angle text NOT NULL,
  cta_text text NOT NULL,
  cta_keyword text,
  planning_reason text NOT NULL,
  review_status text NOT NULL DEFAULT 'pending_review',
  owner_notes text,
  edited_at timestamptz,
  revision_number integer NOT NULL DEFAULT 0,
  validation_errors jsonb NOT NULL DEFAULT '[]',
  validation_warnings jsonb NOT NULL DEFAULT '[]',
  imported_content_item_id uuid REFERENCES content_items(id),
  imported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaign_plan_draft_items_sequence_check CHECK (draft_sequence > 0),
  CONSTRAINT campaign_plan_draft_items_revision_check CHECK (revision_number >= 0),
  CONSTRAINT campaign_plan_draft_items_validation_errors_array_check CHECK (jsonb_typeof(validation_errors) = 'array'),
  CONSTRAINT campaign_plan_draft_items_validation_warnings_array_check CHECK (jsonb_typeof(validation_warnings) = 'array'),
  CONSTRAINT campaign_plan_draft_items_review_status_check CHECK (
    review_status = ANY (ARRAY['pending_review', 'approved', 'rejected'])
  ),
  CONSTRAINT campaign_plan_draft_items_school_level_check CHECK (
    school_level IS NULL OR school_level = ANY (ARRAY['sd', 'smp', 'sma', 'smk', 'mi', 'mts', 'ma', 'other'])
  ),
  CONSTRAINT campaign_plan_draft_items_audience_segment_check CHECK (
    audience_segment = ANY (ARRAY['end_user_school', 'agent_marketer', 'mixed'])
  ),
  CONSTRAINT campaign_plan_draft_items_content_pillar_check CHECK (
    content_pillar = ANY (ARRAY['mockup_magnet', 'desain_gratis', 'trust_process', 'pain_point', 'product_proof', 'offer', 'agent', 'education'])
  ),
  CONSTRAINT campaign_plan_draft_items_run_sequence_key UNIQUE (run_id, draft_sequence)
);

CREATE INDEX campaign_plan_draft_items_run_id_idx ON campaign_plan_draft_items (run_id);
CREATE INDEX campaign_plan_draft_items_review_status_idx ON campaign_plan_draft_items (review_status);

CREATE TABLE campaign_plan_draft_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_item_id uuid NOT NULL REFERENCES campaign_plan_draft_items(id),
  channel text NOT NULL,
  publication_format text NOT NULL,
  planned_publish_at timestamptz,
  platform_title text,
  platform_caption text,
  imported_publication_id uuid REFERENCES content_publications(id),
  imported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaign_plan_draft_publications_item_channel_format_key UNIQUE (draft_item_id, channel, publication_format),
  CONSTRAINT campaign_plan_draft_publications_channel_check CHECK (
    channel = ANY (ARRAY['instagram', 'facebook', 'tiktok', 'youtube', 'whatsapp_status'])
  ),
  CONSTRAINT campaign_plan_draft_publications_format_check CHECK (
    publication_format = ANY (ARRAY['reel', 'short_video', 'feed_video', 'feed_image', 'carousel', 'status_video', 'status_image', 'standard_video'])
  ),
  CONSTRAINT campaign_plan_draft_publications_channel_format_check CHECK (
    (channel IN ('instagram', 'facebook') AND publication_format IN ('reel', 'feed_video', 'feed_image', 'carousel'))
    OR (channel = 'tiktok' AND publication_format = 'short_video')
    OR (channel = 'youtube' AND publication_format IN ('short_video', 'standard_video'))
    OR (channel = 'whatsapp_status' AND publication_format IN ('status_video', 'status_image'))
  ),
  CONSTRAINT campaign_plan_draft_publications_caption_null_check CHECK (platform_caption IS NULL)
);

CREATE INDEX campaign_plan_draft_publications_draft_item_id_idx ON campaign_plan_draft_publications (draft_item_id);
