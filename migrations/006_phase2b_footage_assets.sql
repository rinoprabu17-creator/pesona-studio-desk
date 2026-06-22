CREATE TABLE footage_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relative_path text NOT NULL UNIQUE,
  filename text NOT NULL,
  file_extension text NOT NULL,
  size_bytes bigint NOT NULL,
  status text NOT NULL DEFAULT 'new',
  product_id uuid REFERENCES products(id),
  school_level text,
  theme text,
  shot_type text NOT NULL DEFAULT 'other',
  quality_score integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT footage_assets_relative_path_safe_check CHECK (
    relative_path <> ''
    AND relative_path !~ '^/'
    AND relative_path !~ '(^|/)\\.\\.(/|$)'
    AND position(chr(92) in relative_path) = 0
    AND relative_path !~ '(^storage/|^footage/|^storage$|^footage$)'
  ),
  CONSTRAINT footage_assets_size_bytes_check CHECK (size_bytes >= 0),
  CONSTRAINT footage_assets_status_check CHECK (
    status = ANY (ARRAY['new', 'reviewed', 'approved', 'rejected', 'archived'])
  ),
  CONSTRAINT footage_assets_school_level_check CHECK (
    school_level IS NULL OR school_level = ANY (ARRAY['sd', 'smp', 'sma', 'mi', 'mts', 'ma', 'umum'])
  ),
  CONSTRAINT footage_assets_shot_type_check CHECK (
    shot_type = ANY (ARRAY['product', 'process', 'packing', 'delivery', 'workshop', 'testimonial', 'other'])
  ),
  CONSTRAINT footage_assets_quality_score_check CHECK (
    quality_score IS NULL OR (quality_score >= 1 AND quality_score <= 5)
  )
);

CREATE INDEX footage_assets_status_idx ON footage_assets (status);
CREATE INDEX footage_assets_product_id_idx ON footage_assets (product_id);
CREATE INDEX footage_assets_shot_type_idx ON footage_assets (shot_type);
CREATE INDEX footage_assets_theme_idx ON footage_assets (theme);
