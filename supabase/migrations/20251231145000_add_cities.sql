-- Cities table for supported locations
-- Matches can only be created in active cities

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for active cities lookup
CREATE INDEX idx_cities_is_active ON cities(is_active) WHERE is_active = true;

-- Seed initial cities
INSERT INTO cities (name, name_ar) VALUES
  ('Sheikh Zayed', 'الشيخ زايد'),
  ('New Cairo', 'القاهرة الجديدة'),
  ('Maadi', 'المعادي');
