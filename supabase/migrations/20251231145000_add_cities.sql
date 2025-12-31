-- Cities table for supported locations
-- Matches can only be created in active cities

-- Include extensions schema in search_path for PostGIS types
SET search_path TO public, extensions;

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  bounds JSONB NOT NULL,
  center GEOGRAPHY(POINT, 4326) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for active cities lookup
CREATE INDEX idx_cities_is_active ON cities(is_active) WHERE is_active = true;

-- Seed initial cities
INSERT INTO cities (name, name_ar, bounds, center) VALUES
  (
    'Sheikh Zayed',
    'الشيخ زايد',
    '{"north": 30.1, "south": 30.0, "east": 31.0, "west": 30.9}',
    ST_SetSRID(ST_MakePoint(30.95, 30.05), 4326)::geography
  ),
  (
    'New Cairo',
    'القاهرة الجديدة',
    '{"north": 30.08, "south": 29.98, "east": 31.55, "west": 31.4}',
    ST_SetSRID(ST_MakePoint(31.475, 30.03), 4326)::geography
  ),
  (
    'Maadi',
    'المعادي',
    '{"north": 30.02, "south": 29.95, "east": 31.32, "west": 31.23}',
    ST_SetSRID(ST_MakePoint(31.275, 29.985), 4326)::geography
  );
