-- Ratings table for post-match reviews

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, rater_id, rated_user_id)
);

-- Indexes for ratings
CREATE INDEX idx_ratings_match_id ON ratings(match_id);
CREATE INDEX idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX idx_ratings_rated_user_id ON ratings(rated_user_id);

-- Function to get user's average rating
CREATE OR REPLACE FUNCTION get_user_average_rating(user_id UUID)
RETURNS TABLE(average_rating NUMERIC, total_ratings BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rating)::NUMERIC, 2) as average_rating,
    COUNT(*) as total_ratings
  FROM ratings
  WHERE rated_user_id = user_id;
END;
$$ LANGUAGE plpgsql;
