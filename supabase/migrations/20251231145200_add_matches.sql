-- Matches and participants tables

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sport_id UUID NOT NULL REFERENCES sports(id),
  skill_level skill_level,
  city_id UUID NOT NULL REFERENCES cities(id),
  location_name TEXT NOT NULL,
  location_url TEXT,  -- Google Maps URL (optional)
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

-- Trigger to update updated_at
CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Match participants table
CREATE TABLE match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
