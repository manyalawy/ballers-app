-- Matches and participants tables

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sport_id UUID NOT NULL REFERENCES sports(id),
  skill_level skill_level,
  city_id UUID NOT NULL REFERENCES cities(id),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  location_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_players INTEGER NOT NULL DEFAULT 10,
  status match_status NOT NULL DEFAULT 'upcoming',
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_matches_creator_id ON matches(creator_id);
CREATE INDEX idx_matches_sport_id ON matches(sport_id);
CREATE INDEX idx_matches_city_id ON matches(city_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at);
CREATE INDEX idx_matches_location ON matches USING GIST(location);

-- Trigger to update updated_at
CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Match participants table
CREATE TABLE match_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status participant_status NOT NULL DEFAULT 'pending',
  request_message TEXT,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- Indexes for participants
CREATE INDEX idx_match_participants_match_id ON match_participants(match_id);
CREATE INDEX idx_match_participants_user_id ON match_participants(user_id);
CREATE INDEX idx_match_participants_status ON match_participants(status);

-- Function to get nearby matches
CREATE OR REPLACE FUNCTION get_nearby_matches(
  user_location GEOGRAPHY,
  radius_meters INTEGER DEFAULT 10000,
  sport_filter UUID DEFAULT NULL,
  skill_filter skill_level DEFAULT NULL
)
RETURNS SETOF matches AS $$
BEGIN
  RETURN QUERY
  SELECT m.*
  FROM matches m
  WHERE m.status = 'upcoming'
    AND ST_DWithin(m.location, user_location, radius_meters)
    AND (sport_filter IS NULL OR m.sport_id = sport_filter)
    AND (skill_filter IS NULL OR m.skill_level IS NULL OR m.skill_level = skill_filter)
  ORDER BY m.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to validate match location is within city bounds
CREATE OR REPLACE FUNCTION validate_match_location()
RETURNS TRIGGER AS $$
DECLARE
  city_bounds JSONB;
  lat DOUBLE PRECISION;
  lng DOUBLE PRECISION;
BEGIN
  SELECT bounds INTO city_bounds FROM cities WHERE id = NEW.city_id;

  lat := ST_Y(NEW.location::geometry);
  lng := ST_X(NEW.location::geometry);

  IF lat < (city_bounds->>'south')::DOUBLE PRECISION
     OR lat > (city_bounds->>'north')::DOUBLE PRECISION
     OR lng < (city_bounds->>'west')::DOUBLE PRECISION
     OR lng > (city_bounds->>'east')::DOUBLE PRECISION THEN
    RAISE EXCEPTION 'Match location must be within the selected city bounds';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_match_location_trigger
  BEFORE INSERT OR UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION validate_match_location();
