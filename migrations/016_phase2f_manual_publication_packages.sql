CREATE TABLE manual_publication_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handoff_id uuid NOT NULL REFERENCES video_approved_handoff_records(id),
  promotion_id uuid NOT NULL REFERENCES video_render_approved_promotions(id),
  render_attempt_id uuid NOT NULL REFERENCES video_render_attempts(id),
  render_attempt_review_id uuid NOT NULL REFERENCES video_render_attempt_reviews(id),
  render_manifest_id uuid NOT NULL REFERENCES video_render_manifests(id),
  video_draft_job_id uuid NOT NULL REFERENCES video_draft_jobs(id),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  package_status text NOT NULL DEFAULT 'draft_package',
  approved_output_relative_path_snapshot text NOT NULL,
  approved_size_bytes_snapshot bigint,
  approved_sha256_snapshot text,
  package_title text,
  caption_text text,
  hashtags_text text,
  call_to_action text,
  manual_publish_note text,
  created_by_name text,
  ready_at timestamptz,
  published_manually_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT manual_publication_packages_handoff_key UNIQUE (handoff_id),
  CONSTRAINT manual_publication_packages_promotion_key UNIQUE (promotion_id),
  CONSTRAINT manual_publication_packages_status_check CHECK (
    package_status = ANY (ARRAY[
      'draft_package',
      'ready_manual_publish',
      'published_manually',
      'hold',
      'needs_revision',
      'archived'
    ])
  ),
  CONSTRAINT manual_publication_packages_output_path_check CHECK (
    approved_output_relative_path_snapshot ~ '^smoke/'
    AND approved_output_relative_path_snapshot ~ '[.]mp4$'
    AND approved_output_relative_path_snapshot !~ '^/'
    AND position(chr(92) in approved_output_relative_path_snapshot) = 0
    AND approved_output_relative_path_snapshot !~ '(^|/)[.][.]($|/)'
  ),
  CONSTRAINT manual_publication_packages_size_check CHECK (
    approved_size_bytes_snapshot IS NULL OR approved_size_bytes_snapshot >= 0
  ),
  CONSTRAINT manual_publication_packages_sha_check CHECK (
    approved_sha256_snapshot IS NULL OR approved_sha256_snapshot ~ '^[a-f0-9]{64}$'
  )
);

CREATE INDEX manual_publication_packages_handoff_id_idx ON manual_publication_packages(handoff_id);
CREATE INDEX manual_publication_packages_promotion_id_idx ON manual_publication_packages(promotion_id);
CREATE INDEX manual_publication_packages_content_item_id_idx ON manual_publication_packages(content_item_id);
CREATE INDEX manual_publication_packages_status_idx ON manual_publication_packages(package_status);
CREATE INDEX manual_publication_packages_created_at_idx ON manual_publication_packages(created_at);

CREATE TABLE manual_publication_package_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES manual_publication_packages(id),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  channel text NOT NULL,
  channel_status text NOT NULL DEFAULT 'draft_channel',
  publication_format text NOT NULL DEFAULT 'standard_video',
  planned_publish_at timestamptz,
  manual_published_at timestamptz,
  manual_publish_url text,
  manual_publish_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT manual_publication_package_channels_package_channel_key UNIQUE (package_id, channel),
  CONSTRAINT manual_publication_package_channels_channel_check CHECK (
    channel = ANY (ARRAY['instagram', 'facebook', 'tiktok', 'youtube'])
  ),
  CONSTRAINT manual_publication_package_channels_status_check CHECK (
    channel_status = ANY (ARRAY[
      'draft_channel',
      'ready_manual_publish',
      'published_manually',
      'skipped',
      'hold',
      'archived'
    ])
  ),
  CONSTRAINT manual_publication_package_channels_format_check CHECK (
    publication_format = ANY (ARRAY['standard_video', 'reel', 'short', 'feed_video', 'story'])
  )
);

CREATE INDEX manual_publication_package_channels_package_id_idx ON manual_publication_package_channels(package_id);
CREATE INDEX manual_publication_package_channels_content_item_id_idx ON manual_publication_package_channels(content_item_id);
CREATE INDEX manual_publication_package_channels_channel_idx ON manual_publication_package_channels(channel);
CREATE INDEX manual_publication_package_channels_status_idx ON manual_publication_package_channels(channel_status);
CREATE INDEX manual_publication_package_channels_planned_publish_at_idx ON manual_publication_package_channels(planned_publish_at);
