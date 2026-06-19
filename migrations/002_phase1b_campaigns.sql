CREATE TABLE campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  target_audience text NOT NULL,
  primary_product_id uuid REFERENCES products(id),
  status text NOT NULL DEFAULT 'draft',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaigns_period_check CHECK (end_date >= start_date),
  CONSTRAINT campaigns_status_check CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived'))
);

CREATE INDEX campaigns_status_idx ON campaigns(status);
CREATE INDEX campaigns_period_idx ON campaigns(start_date, end_date);
CREATE INDEX campaigns_primary_product_id_idx ON campaigns(primary_product_id);
