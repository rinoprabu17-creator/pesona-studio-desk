CREATE TABLE manual_publish_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES manual_publication_packages(id),
  package_channel_id uuid NOT NULL REFERENCES manual_publication_package_channels(id),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  channel text NOT NULL,
  checklist_key text NOT NULL,
  checklist_label text NOT NULL,
  checklist_status text NOT NULL DEFAULT 'pending',
  is_done boolean NOT NULL DEFAULT false,
  checked_by_name text,
  checked_at timestamptz,
  checklist_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT manual_publish_checklist_items_channel_key UNIQUE (package_channel_id, checklist_key),
  CONSTRAINT manual_publish_checklist_items_channel_check CHECK (
    channel = ANY (ARRAY['instagram', 'facebook', 'tiktok', 'youtube'])
  ),
  CONSTRAINT manual_publish_checklist_items_status_check CHECK (
    checklist_status = ANY (ARRAY['pending', 'done', 'skipped', 'blocked'])
  ),
  CONSTRAINT manual_publish_checklist_items_key_check CHECK (
    checklist_key = ANY (ARRAY[
      'video_file_confirmed',
      'caption_ready',
      'hashtags_ready',
      'cta_ready',
      'account_login_ready',
      'manual_post_created',
      'manual_url_recorded',
      'final_visual_check'
    ])
  )
);

CREATE INDEX manual_publish_checklist_items_package_id_idx ON manual_publish_checklist_items(package_id);
CREATE INDEX manual_publish_checklist_items_package_channel_id_idx ON manual_publish_checklist_items(package_channel_id);
CREATE INDEX manual_publish_checklist_items_content_item_id_idx ON manual_publish_checklist_items(content_item_id);
CREATE INDEX manual_publish_checklist_items_channel_idx ON manual_publish_checklist_items(channel);
CREATE INDEX manual_publish_checklist_items_status_idx ON manual_publish_checklist_items(checklist_status);
CREATE INDEX manual_publish_checklist_items_is_done_idx ON manual_publish_checklist_items(is_done);
CREATE INDEX manual_publish_checklist_items_created_at_idx ON manual_publish_checklist_items(created_at);

CREATE TABLE manual_publish_evidence_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES manual_publication_packages(id),
  package_channel_id uuid NOT NULL REFERENCES manual_publication_package_channels(id),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  channel text NOT NULL,
  evidence_type text NOT NULL,
  evidence_value text,
  evidence_note text,
  recorded_by_name text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT manual_publish_evidence_logs_channel_check CHECK (
    channel = ANY (ARRAY['instagram', 'facebook', 'tiktok', 'youtube'])
  ),
  CONSTRAINT manual_publish_evidence_logs_type_check CHECK (
    evidence_type = ANY (ARRAY[
      'manual_post_url',
      'screenshot_reference',
      'admin_note',
      'issue_note',
      'confirmation_note'
    ])
  )
);

CREATE INDEX manual_publish_evidence_logs_package_id_idx ON manual_publish_evidence_logs(package_id);
CREATE INDEX manual_publish_evidence_logs_package_channel_id_idx ON manual_publish_evidence_logs(package_channel_id);
CREATE INDEX manual_publish_evidence_logs_content_item_id_idx ON manual_publish_evidence_logs(content_item_id);
CREATE INDEX manual_publish_evidence_logs_channel_idx ON manual_publish_evidence_logs(channel);
CREATE INDEX manual_publish_evidence_logs_type_idx ON manual_publish_evidence_logs(evidence_type);
CREATE INDEX manual_publish_evidence_logs_recorded_at_idx ON manual_publish_evidence_logs(recorded_at);
CREATE INDEX manual_publish_evidence_logs_created_at_idx ON manual_publish_evidence_logs(created_at);
