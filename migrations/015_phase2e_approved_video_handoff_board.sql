CREATE TABLE video_approved_handoff_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL REFERENCES video_render_approved_promotions(id),
  render_attempt_id uuid NOT NULL REFERENCES video_render_attempts(id),
  render_attempt_review_id uuid NOT NULL REFERENCES video_render_attempt_reviews(id),
  render_manifest_id uuid NOT NULL REFERENCES video_render_manifests(id),
  video_draft_job_id uuid NOT NULL REFERENCES video_draft_jobs(id),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  handoff_status text NOT NULL DEFAULT 'pending_handoff',
  approved_output_relative_path_snapshot text NOT NULL,
  approved_size_bytes_snapshot bigint,
  approved_sha256_snapshot text,
  handoff_by_name text,
  handoff_note text,
  handoff_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_approved_handoff_records_promotion_key UNIQUE (promotion_id),
  CONSTRAINT video_approved_handoff_records_status_check CHECK (
    handoff_status = ANY (ARRAY['pending_handoff', 'ready_for_manual_publish', 'hold', 'needs_revision', 'archived'])
  ),
  CONSTRAINT video_approved_handoff_records_output_path_check CHECK (
    approved_output_relative_path_snapshot ~ '^smoke/' AND
    approved_output_relative_path_snapshot ~ '[.]mp4$' AND
    approved_output_relative_path_snapshot !~ '^/' AND
    position(chr(92) in approved_output_relative_path_snapshot) = 0 AND
    approved_output_relative_path_snapshot !~ '(^|/)[.][.]($|/)'
  ),
  CONSTRAINT video_approved_handoff_records_size_check CHECK (
    approved_size_bytes_snapshot IS NULL OR approved_size_bytes_snapshot >= 0
  ),
  CONSTRAINT video_approved_handoff_records_sha_check CHECK (
    approved_sha256_snapshot IS NULL OR approved_sha256_snapshot ~ '^[0-9a-f]{64}$'
  )
);

CREATE INDEX video_approved_handoff_records_promotion_id_idx ON video_approved_handoff_records (promotion_id);
CREATE INDEX video_approved_handoff_records_attempt_id_idx ON video_approved_handoff_records (render_attempt_id);
CREATE INDEX video_approved_handoff_records_review_id_idx ON video_approved_handoff_records (render_attempt_review_id);
CREATE INDEX video_approved_handoff_records_manifest_id_idx ON video_approved_handoff_records (render_manifest_id);
CREATE INDEX video_approved_handoff_records_video_draft_job_id_idx ON video_approved_handoff_records (video_draft_job_id);
CREATE INDEX video_approved_handoff_records_content_item_id_idx ON video_approved_handoff_records (content_item_id);
CREATE INDEX video_approved_handoff_records_status_idx ON video_approved_handoff_records (handoff_status);
CREATE INDEX video_approved_handoff_records_created_at_idx ON video_approved_handoff_records (created_at);
