CREATE TABLE video_render_preflight_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  render_manifest_id uuid NOT NULL REFERENCES video_render_manifests(id),
  video_draft_job_id uuid NOT NULL REFERENCES video_draft_jobs(id),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  run_status text NOT NULL DEFAULT 'completed',
  preflight_result text NOT NULL DEFAULT 'blocked',
  check_count integer NOT NULL DEFAULT 0,
  blocking_check_count integer NOT NULL DEFAULT 0,
  warning_check_count integer NOT NULL DEFAULT 0,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_render_preflight_runs_status_check CHECK (
    run_status = ANY (ARRAY['completed', 'archived'])
  ),
  CONSTRAINT video_render_preflight_runs_result_check CHECK (
    preflight_result = ANY (ARRAY['ready', 'blocked'])
  ),
  CONSTRAINT video_render_preflight_runs_check_count_check CHECK (check_count >= 0),
  CONSTRAINT video_render_preflight_runs_blocking_count_check CHECK (blocking_check_count >= 0),
  CONSTRAINT video_render_preflight_runs_warning_count_check CHECK (warning_check_count >= 0)
);

CREATE TABLE video_render_preflight_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preflight_run_id uuid NOT NULL REFERENCES video_render_preflight_runs(id),
  render_manifest_item_id uuid REFERENCES video_render_manifest_items(id),
  check_code text NOT NULL,
  check_level text NOT NULL,
  check_status text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_render_preflight_checks_code_check CHECK (btrim(check_code) <> ''),
  CONSTRAINT video_render_preflight_checks_level_check CHECK (
    check_level = ANY (ARRAY['info', 'warning', 'blocking'])
  ),
  CONSTRAINT video_render_preflight_checks_status_check CHECK (
    check_status = ANY (ARRAY['pass', 'fail'])
  )
);

CREATE INDEX video_render_preflight_runs_render_manifest_id_idx ON video_render_preflight_runs (render_manifest_id);
CREATE INDEX video_render_preflight_runs_video_draft_job_id_idx ON video_render_preflight_runs (video_draft_job_id);
CREATE INDEX video_render_preflight_runs_content_item_id_idx ON video_render_preflight_runs (content_item_id);
CREATE INDEX video_render_preflight_runs_result_idx ON video_render_preflight_runs (preflight_result);
CREATE INDEX video_render_preflight_checks_run_id_idx ON video_render_preflight_checks (preflight_run_id);
CREATE INDEX video_render_preflight_checks_manifest_item_id_idx ON video_render_preflight_checks (render_manifest_item_id);
CREATE INDEX video_render_preflight_checks_code_idx ON video_render_preflight_checks (check_code);
CREATE INDEX video_render_preflight_checks_level_idx ON video_render_preflight_checks (check_level);
