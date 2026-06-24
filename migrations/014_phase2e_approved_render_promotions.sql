CREATE TABLE video_render_approved_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  render_attempt_review_id uuid NOT NULL REFERENCES video_render_attempt_reviews(id),
  render_attempt_id uuid NOT NULL REFERENCES video_render_attempts(id),
  render_manifest_id uuid NOT NULL REFERENCES video_render_manifests(id),
  video_draft_job_id uuid NOT NULL REFERENCES video_draft_jobs(id),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  promotion_status text NOT NULL DEFAULT 'requested',
  promotion_mode text NOT NULL DEFAULT 'manual_copy',
  source_output_relative_path text NOT NULL,
  approved_output_relative_path text,
  source_size_bytes bigint,
  approved_size_bytes bigint,
  source_sha256 text,
  approved_sha256 text,
  promoted_by_name text,
  promotion_note text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_render_approved_promotions_review_key UNIQUE (render_attempt_review_id),
  CONSTRAINT video_render_approved_promotions_attempt_key UNIQUE (render_attempt_id),
  CONSTRAINT video_render_approved_promotions_status_check CHECK (
    promotion_status = ANY (ARRAY['requested', 'running', 'succeeded', 'failed', 'blocked', 'archived'])
  ),
  CONSTRAINT video_render_approved_promotions_mode_check CHECK (promotion_mode = 'manual_copy'),
  CONSTRAINT video_render_approved_promotions_source_path_check CHECK (
    source_output_relative_path ~ '^smoke/' AND
    source_output_relative_path ~ '[.]mp4$' AND
    source_output_relative_path !~ '^/' AND
    position(chr(92) in source_output_relative_path) = 0 AND
    source_output_relative_path !~ '(^|/)[.][.]($|/)'
  ),
  CONSTRAINT video_render_approved_promotions_approved_path_check CHECK (
    approved_output_relative_path IS NULL OR (
      approved_output_relative_path ~ '^smoke/' AND
      approved_output_relative_path ~ '[.]mp4$' AND
      approved_output_relative_path !~ '^/' AND
      position(chr(92) in approved_output_relative_path) = 0 AND
      approved_output_relative_path !~ '(^|/)[.][.]($|/)'
    )
  ),
  CONSTRAINT video_render_approved_promotions_size_check CHECK (
    (source_size_bytes IS NULL OR source_size_bytes >= 0) AND
    (approved_size_bytes IS NULL OR approved_size_bytes >= 0)
  ),
  CONSTRAINT video_render_approved_promotions_sha_check CHECK (
    (source_sha256 IS NULL OR source_sha256 ~ '^[0-9a-f]{64}$') AND
    (approved_sha256 IS NULL OR approved_sha256 ~ '^[0-9a-f]{64}$')
  )
);

CREATE INDEX video_render_approved_promotions_review_id_idx ON video_render_approved_promotions (render_attempt_review_id);
CREATE INDEX video_render_approved_promotions_attempt_id_idx ON video_render_approved_promotions (render_attempt_id);
CREATE INDEX video_render_approved_promotions_manifest_id_idx ON video_render_approved_promotions (render_manifest_id);
CREATE INDEX video_render_approved_promotions_video_draft_job_id_idx ON video_render_approved_promotions (video_draft_job_id);
CREATE INDEX video_render_approved_promotions_content_item_id_idx ON video_render_approved_promotions (content_item_id);
CREATE INDEX video_render_approved_promotions_status_idx ON video_render_approved_promotions (promotion_status);
CREATE INDEX video_render_approved_promotions_created_at_idx ON video_render_approved_promotions (created_at);
