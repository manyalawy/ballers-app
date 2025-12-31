-- Profiles and user sports tables

-- Sports table (reference data)
CREATE TABLE sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed sports
INSERT INTO sports (name, icon, color) VALUES
  ('Basketball', 'basketball', '#F97316'),
  ('Soccer', 'soccer', '#22C55E'),
  ('Tennis', 'tennis', '#FBBF24'),
  ('Volleyball', 'volleyball', '#3B82F6'),
  ('Running', 'running', '#EC4899'),
  ('Padel', 'padel', '#14B8A6'),
  ('Swimming', 'swimming', '#06B6D4'),
  ('Golf', 'golf', '#10B981'),
  ('Badminton', 'badminton', '#A855F7'),
  ('Squash', 'squash', '#EF4444'),
  ('Pickleball', 'pickleball', '#F59E0B'),
  ('Spikeball', 'spikeball', '#8B5CF6');

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT,
  display_name TEXT,
  avatar_url TEXT,
  expo_push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for push notifications
CREATE INDEX idx_profiles_expo_push_token ON profiles(expo_push_token) WHERE expo_push_token IS NOT NULL;

-- User sports (skill levels per sport)
CREATE TABLE user_sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  skill_level skill_level NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, sport_id)
);

-- Index for user sports lookup
CREATE INDEX idx_user_sports_user_id ON user_sports(user_id);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
