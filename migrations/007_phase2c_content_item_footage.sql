CREATE TABLE content_item_footage_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  footage_asset_id uuid NOT NULL REFERENCES footage_assets(id),
  sequence_number integer NOT NULL,
  role text NOT NULL DEFAULT 'other',
  usage_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_item_footage_sequence_check CHECK (sequence_number > 0),
  CONSTRAINT content_item_footage_role_check CHECK (
    role = ANY (ARRAY['opening', 'product', 'process', 'packing', 'delivery', 'testimonial', 'closing', 'b_roll', 'other'])
  ),
  CONSTRAINT content_item_footage_item_sequence_key UNIQUE (content_item_id, sequence_number),
  CONSTRAINT content_item_footage_item_asset_key UNIQUE (content_item_id, footage_asset_id)
);

CREATE INDEX content_item_footage_content_item_id_idx ON content_item_footage_selections (content_item_id);
CREATE INDEX content_item_footage_footage_asset_id_idx ON content_item_footage_selections (footage_asset_id);
CREATE INDEX content_item_footage_role_idx ON content_item_footage_selections (role);
