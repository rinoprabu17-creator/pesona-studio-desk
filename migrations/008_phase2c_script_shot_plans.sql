CREATE TABLE content_item_script_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  plan_status text NOT NULL DEFAULT 'draft',
  video_format text NOT NULL DEFAULT 'short_video',
  hook_text text,
  main_message text,
  cta_text text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_item_script_plans_content_item_key UNIQUE (content_item_id),
  CONSTRAINT content_item_script_plans_status_check CHECK (
    plan_status = ANY (ARRAY['draft', 'reviewed', 'approved', 'archived'])
  ),
  CONSTRAINT content_item_script_plans_video_format_check CHECK (
    video_format = ANY (ARRAY['short_video', 'reels', 'tiktok', 'youtube_short', 'story', 'other'])
  )
);

CREATE TABLE content_item_shot_plan_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_plan_id uuid NOT NULL REFERENCES content_item_script_plans(id),
  content_item_footage_selection_id uuid REFERENCES content_item_footage_selections(id),
  sequence_number integer NOT NULL,
  step_type text NOT NULL DEFAULT 'scene',
  visual_note text,
  narration_text text,
  overlay_text text,
  duration_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_item_shot_plan_sequence_check CHECK (sequence_number > 0),
  CONSTRAINT content_item_shot_plan_step_type_check CHECK (
    step_type = ANY (ARRAY['hook', 'scene', 'product', 'process', 'packing', 'delivery', 'testimonial', 'b_roll', 'cta', 'closing', 'other'])
  ),
  CONSTRAINT content_item_shot_plan_duration_check CHECK (
    duration_seconds IS NULL OR (duration_seconds >= 1 AND duration_seconds <= 120)
  ),
  CONSTRAINT content_item_shot_plan_steps_plan_sequence_key UNIQUE (script_plan_id, sequence_number)
);

CREATE INDEX content_item_script_plans_content_item_id_idx ON content_item_script_plans (content_item_id);
CREATE INDEX content_item_script_plans_status_idx ON content_item_script_plans (plan_status);
CREATE INDEX content_item_shot_plan_steps_script_plan_id_idx ON content_item_shot_plan_steps (script_plan_id);
CREATE INDEX content_item_shot_plan_steps_footage_selection_id_idx ON content_item_shot_plan_steps (content_item_footage_selection_id);
CREATE INDEX content_item_shot_plan_steps_step_type_idx ON content_item_shot_plan_steps (step_type);
