CREATE TABLE video_render_attempt_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  render_attempt_id uuid NOT NULL REFERENCES video_render_attempts(id),
  render_manifest_id uuid NOT NULL REFERENCES video_render_manifests(id),
  video_draft_job_id uuid NOT NULL REFERENCES video_draft_jobs(id),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  review_status text NOT NULL DEFAULT 'pending_review',
  review_note text,
  reviewed_by_name text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_render_attempt_reviews_attempt_key UNIQUE (render_attempt_id),
  CONSTRAINT video_render_attempt_reviews_status_check CHECK (
    review_status = ANY (ARRAY['pending_review', 'approved', 'rejected', 'archived'])
  ),
  CONSTRAINT video_render_attempt_reviews_terminal_time_check CHECK (
    review_status NOT IN ('approved', 'rejected') OR reviewed_at IS NOT NULL
  )
);

CREATE INDEX video_render_attempt_reviews_attempt_id_idx ON video_render_attempt_reviews (render_attempt_id);
CREATE INDEX video_render_attempt_reviews_manifest_id_idx ON video_render_attempt_reviews (render_manifest_id);
CREATE INDEX video_render_attempt_reviews_video_draft_job_id_idx ON video_render_attempt_reviews (video_draft_job_id);
CREATE INDEX video_render_attempt_reviews_content_item_id_idx ON video_render_attempt_reviews (content_item_id);
CREATE INDEX video_render_attempt_reviews_status_idx ON video_render_attempt_reviews (review_status);
CREATE INDEX video_render_attempt_reviews_created_at_idx ON video_render_attempt_reviews (created_at);
