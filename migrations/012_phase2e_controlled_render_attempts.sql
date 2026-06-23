CREATE TABLE video_render_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  render_manifest_id uuid NOT NULL REFERENCES video_render_manifests(id),
  preflight_run_id uuid NOT NULL REFERENCES video_render_preflight_runs(id),
  video_draft_job_id uuid NOT NULL REFERENCES video_draft_jobs(id),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  attempt_status text NOT NULL DEFAULT 'requested',
  attempt_mode text NOT NULL DEFAULT 'manual_smoke',
  output_relative_path text,
  output_size_bytes bigint,
  ffmpeg_exit_code integer,
  ffmpeg_command_preview text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_render_attempts_status_check CHECK (
    attempt_status = ANY (ARRAY['requested', 'running', 'succeeded', 'failed', 'blocked', 'archived'])
  ),
  CONSTRAINT video_render_attempts_mode_check CHECK (attempt_mode = 'manual_smoke'),
  CONSTRAINT video_render_attempts_output_path_check CHECK (
    output_relative_path IS NULL OR (
      output_relative_path ~ '^smoke/'
      AND output_relative_path ~ '[.]mp4$'
      AND output_relative_path !~ '^/'
      AND position(chr(92) in output_relative_path) = 0
      AND output_relative_path !~ '(^|/)\\.\\.($|/)'
    )
  ),
  CONSTRAINT video_render_attempts_output_size_check CHECK (
    output_size_bytes IS NULL OR output_size_bytes >= 0
  ),
  CONSTRAINT video_render_attempts_exit_code_check CHECK (
    ffmpeg_exit_code IS NULL OR ffmpeg_exit_code >= 0
  )
);

CREATE INDEX video_render_attempts_render_manifest_id_idx ON video_render_attempts (render_manifest_id);
CREATE INDEX video_render_attempts_preflight_run_id_idx ON video_render_attempts (preflight_run_id);
CREATE INDEX video_render_attempts_video_draft_job_id_idx ON video_render_attempts (video_draft_job_id);
CREATE INDEX video_render_attempts_content_item_id_idx ON video_render_attempts (content_item_id);
CREATE INDEX video_render_attempts_status_idx ON video_render_attempts (attempt_status);
CREATE INDEX video_render_attempts_created_at_idx ON video_render_attempts (created_at);
