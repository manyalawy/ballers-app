-- Seed data for development
-- This file is run after migrations during `supabase db reset`

-- Note: Cities and Sports are already seeded in migrations
-- This file contains additional test data for development

-- Test users will be created through Supabase Auth
-- After creating test users, you can insert profile data like this:

-- Example (uncomment and update with real auth user IDs after creating test users):
/*
UPDATE profiles SET
  display_name = 'Ahmed Hassan',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed'
WHERE id = 'your-auth-user-id-1';

UPDATE profiles SET
  display_name = 'Sara Mohamed',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara'
WHERE id = 'your-auth-user-id-2';

-- Add user sports
INSERT INTO user_sports (user_id, sport_id, skill_level)
SELECT 'your-auth-user-id-1', id, 'intermediate'
FROM sports WHERE name = 'Basketball';

INSERT INTO user_sports (user_id, sport_id, skill_level)
SELECT 'your-auth-user-id-1', id, 'beginner'
FROM sports WHERE name = 'Padel';

-- Create a test match
INSERT INTO matches (
  creator_id,
  title,
  description,
  sport_id,
  skill_level,
  city_id,
  location,
  location_name,
  scheduled_at,
  duration_minutes,
  max_players
)
SELECT
  'your-auth-user-id-1',
  'Weekend Basketball Game',
  'Friendly 5v5 basketball game. All skill levels welcome!',
  s.id,
  'intermediate',
  c.id,
  ST_SetSRID(ST_MakePoint(31.475, 30.03), 4326)::geography,
  'Cairo Festival City Basketball Court',
  NOW() + INTERVAL '2 days',
  90,
  10
FROM sports s, cities c
WHERE s.name = 'Basketball' AND c.name = 'New Cairo';
*/
