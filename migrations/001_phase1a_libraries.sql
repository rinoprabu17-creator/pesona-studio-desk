CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  hex_preview text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT colors_code_slug_check CHECK (code ~ '^[a-z0-9_]+$'),
  CONSTRAINT colors_hex_preview_check CHECK (hex_preview IS NULL OR hex_preview ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE school_level_color_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_level text NOT NULL UNIQUE,
  color_id uuid NOT NULL REFERENCES colors(id),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT school_level_color_defaults_level_check CHECK (
    school_level IN ('sd', 'smp', 'sma', 'smk', 'mi', 'mts', 'ma', 'other')
  )
);

CREATE TABLE offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  public_phrase text NOT NULL,
  condition_text text,
  risk_note text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pain_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  buyer_fear text,
  content_angle text,
  safe_claim text,
  avoid_claim text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
