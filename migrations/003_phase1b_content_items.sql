CREATE TABLE content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id),
  sequence_number integer NOT NULL,
  content_code text NOT NULL UNIQUE,
  title text NOT NULL,
  planned_content_date date NOT NULL,
  product_id uuid REFERENCES products(id),
  school_level text,
  color_id uuid REFERENCES colors(id),
  audience_segment text NOT NULL,
  target_audience text NOT NULL,
  content_pillar text NOT NULL,
  primary_offer_id uuid REFERENCES offers(id),
  primary_pain_point_id uuid REFERENCES pain_points(id),
  hook text NOT NULL,
  angle text NOT NULL,
  cta_text text NOT NULL,
  cta_keyword text,
  production_status text NOT NULL DEFAULT 'planned',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_items_campaign_sequence_key UNIQUE (campaign_id, sequence_number),
  CONSTRAINT content_items_sequence_positive_check CHECK (sequence_number > 0),
  CONSTRAINT content_items_school_level_check CHECK (
    school_level IS NULL OR school_level = ANY (ARRAY['sd', 'smp', 'sma', 'smk', 'mi', 'mts', 'ma', 'other'])
  ),
  CONSTRAINT content_items_audience_segment_check CHECK (
    audience_segment = ANY (ARRAY['end_user_school', 'agent_marketer', 'mixed'])
  ),
  CONSTRAINT content_items_content_pillar_check CHECK (
    content_pillar = ANY (ARRAY['mockup_magnet', 'desain_gratis', 'trust_process', 'pain_point', 'product_proof', 'offer', 'agent', 'education'])
  ),
  CONSTRAINT content_items_production_status_check CHECK (
    production_status = ANY (ARRAY['planned', 'script_ready', 'waiting_footage', 'footage_received', 'rendering', 'draft_ready', 'needs_revision', 'approved', 'failed', 'archived'])
  )
);

CREATE INDEX content_items_campaign_date_idx ON content_items (campaign_id, planned_content_date);
CREATE INDEX content_items_production_status_idx ON content_items (production_status);
CREATE INDEX content_items_product_id_idx ON content_items (product_id);
CREATE INDEX content_items_content_pillar_idx ON content_items (content_pillar);
