CREATE TABLE video_render_manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_draft_job_id uuid NOT NULL REFERENCES video_draft_jobs(id),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  script_plan_id uuid NOT NULL REFERENCES content_item_script_plans(id),
  manifest_status text NOT NULL DEFAULT 'draft',
  manifest_mode text NOT NULL DEFAULT 'metadata_only',
  target_format text NOT NULL,
  planned_output_label text,
  item_count integer NOT NULL DEFAULT 0,
  estimated_duration_seconds integer,
  selected_footage_count integer NOT NULL DEFAULT 0,
  missing_footage_step_count integer NOT NULL DEFAULT 0,
  manifest_warnings text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_render_manifests_job_key UNIQUE (video_draft_job_id),
  CONSTRAINT video_render_manifests_status_check CHECK (
    manifest_status = ANY (ARRAY['draft', 'reviewed', 'approved', 'blocked', 'archived'])
  ),
  CONSTRAINT video_render_manifests_mode_check CHECK (manifest_mode = 'metadata_only'),
  CONSTRAINT video_render_manifests_target_format_check CHECK (
    target_format = ANY (ARRAY['vertical_9_16', 'square_1_1', 'horizontal_16_9', 'other'])
  ),
  CONSTRAINT video_render_manifests_item_count_check CHECK (item_count >= 0),
  CONSTRAINT video_render_manifests_selected_count_check CHECK (selected_footage_count >= 0),
  CONSTRAINT video_render_manifests_missing_count_check CHECK (missing_footage_step_count >= 0),
  CONSTRAINT video_render_manifests_duration_check CHECK (
    estimated_duration_seconds IS NULL OR (estimated_duration_seconds >= 1 AND estimated_duration_seconds <= 600)
  )
);

CREATE TABLE video_render_manifest_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id uuid NOT NULL REFERENCES video_render_manifests(id),
  shot_plan_step_id uuid NOT NULL REFERENCES content_item_shot_plan_steps(id),
  content_item_footage_selection_id uuid REFERENCES content_item_footage_selections(id),
  footage_asset_id uuid REFERENCES footage_assets(id),
  sequence_number integer NOT NULL,
  step_type text NOT NULL,
  visual_note text,
  narration_text text,
  overlay_text text,
  duration_seconds integer,
  source_relative_path_snapshot text,
  source_filename_snapshot text,
  source_file_extension_snapshot text,
  source_size_bytes_snapshot bigint,
  item_warnings text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_render_manifest_items_sequence_check CHECK (sequence_number > 0),
  CONSTRAINT video_render_manifest_items_manifest_sequence_key UNIQUE (manifest_id, sequence_number),
  CONSTRAINT video_render_manifest_items_step_type_check CHECK (
    step_type = ANY (ARRAY['hook', 'scene', 'product', 'process', 'packing', 'delivery', 'testimonial', 'b_roll', 'cta', 'closing', 'other'])
  ),
  CONSTRAINT video_render_manifest_items_duration_check CHECK (
    duration_seconds IS NULL OR (duration_seconds >= 1 AND duration_seconds <= 120)
  ),
  CONSTRAINT video_render_manifest_items_relative_path_check CHECK (
    source_relative_path_snapshot IS NULL OR (
      source_relative_path_snapshot !~ '^/'
      AND position(chr(92) in source_relative_path_snapshot) = 0
      AND source_relative_path_snapshot !~ '(^|/)\\.\\.($|/)'
    )
  )
);

CREATE INDEX video_render_manifests_video_draft_job_id_idx ON video_render_manifests (video_draft_job_id);
CREATE INDEX video_render_manifests_content_item_id_idx ON video_render_manifests (content_item_id);
CREATE INDEX video_render_manifests_script_plan_id_idx ON video_render_manifests (script_plan_id);
CREATE INDEX video_render_manifests_status_idx ON video_render_manifests (manifest_status);
CREATE INDEX video_render_manifest_items_manifest_id_idx ON video_render_manifest_items (manifest_id);
CREATE INDEX video_render_manifest_items_shot_plan_step_id_idx ON video_render_manifest_items (shot_plan_step_id);
CREATE INDEX video_render_manifest_items_footage_selection_id_idx ON video_render_manifest_items (content_item_footage_selection_id);
CREATE INDEX video_render_manifest_items_footage_asset_id_idx ON video_render_manifest_items (footage_asset_id);
