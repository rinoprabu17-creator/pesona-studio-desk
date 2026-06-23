CREATE TABLE video_draft_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  script_plan_id uuid NOT NULL REFERENCES content_item_script_plans(id),
  job_status text NOT NULL DEFAULT 'draft_requested',
  target_format text NOT NULL DEFAULT 'vertical_9_16',
  render_mode text NOT NULL DEFAULT 'disabled_metadata_only',
  duration_target_seconds integer,
  planned_output_label text,
  request_notes text,
  blocking_reason text,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_draft_jobs_script_plan_key UNIQUE (script_plan_id),
  CONSTRAINT video_draft_jobs_status_check CHECK (
    job_status = ANY (ARRAY['draft_requested', 'planning_ready', 'blocked', 'cancelled', 'archived'])
  ),
  CONSTRAINT video_draft_jobs_target_format_check CHECK (
    target_format = ANY (ARRAY['vertical_9_16', 'square_1_1', 'horizontal_16_9', 'other'])
  ),
  CONSTRAINT video_draft_jobs_render_mode_check CHECK (
    render_mode = 'disabled_metadata_only'
  ),
  CONSTRAINT video_draft_jobs_duration_check CHECK (
    duration_target_seconds IS NULL OR (duration_target_seconds >= 5 AND duration_target_seconds <= 180)
  )
);

CREATE INDEX video_draft_jobs_content_item_id_idx ON video_draft_jobs (content_item_id);
CREATE INDEX video_draft_jobs_script_plan_id_idx ON video_draft_jobs (script_plan_id);
CREATE INDEX video_draft_jobs_job_status_idx ON video_draft_jobs (job_status);
CREATE INDEX video_draft_jobs_target_format_idx ON video_draft_jobs (target_format);
