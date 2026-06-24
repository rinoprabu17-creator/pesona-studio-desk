CREATE TABLE manual_publish_closeouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES manual_publication_packages(id),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  closeout_status text NOT NULL DEFAULT 'closed',
  report_status_snapshot text NOT NULL,
  package_status_snapshot text NOT NULL,
  selected_channel_count_snapshot int NOT NULL,
  checklist_total_snapshot int NOT NULL,
  checklist_done_snapshot int NOT NULL,
  evidence_count_snapshot int NOT NULL,
  manual_url_channel_count_snapshot int NOT NULL,
  channels_with_manual_url_snapshot text NOT NULL,
  missing_manual_url_channels_snapshot text NOT NULL DEFAULT '',
  closed_by_name text,
  closeout_note text,
  closed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT manual_publish_closeouts_package_key UNIQUE (package_id),
  CONSTRAINT manual_publish_closeouts_status_check CHECK (closeout_status = 'closed'),
  CONSTRAINT manual_publish_closeouts_report_status_check CHECK (report_status_snapshot = 'ready_evidence_complete'),
  CONSTRAINT manual_publish_closeouts_selected_channel_count_check CHECK (selected_channel_count_snapshot > 0),
  CONSTRAINT manual_publish_closeouts_checklist_total_check CHECK (checklist_total_snapshot > 0),
  CONSTRAINT manual_publish_closeouts_checklist_done_check CHECK (checklist_done_snapshot = checklist_total_snapshot),
  CONSTRAINT manual_publish_closeouts_manual_url_count_check CHECK (manual_url_channel_count_snapshot = selected_channel_count_snapshot),
  CONSTRAINT manual_publish_closeouts_missing_manual_url_check CHECK (missing_manual_url_channels_snapshot = '')
);

CREATE INDEX manual_publish_closeouts_package_id_idx ON manual_publish_closeouts(package_id);
CREATE INDEX manual_publish_closeouts_content_item_id_idx ON manual_publish_closeouts(content_item_id);
CREATE INDEX manual_publish_closeouts_status_idx ON manual_publish_closeouts(closeout_status);
CREATE INDEX manual_publish_closeouts_closed_at_idx ON manual_publish_closeouts(closed_at);
CREATE INDEX manual_publish_closeouts_created_at_idx ON manual_publish_closeouts(created_at);
