-- Skill level enum
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'pro');

-- Match status enum
CREATE TYPE match_status AS ENUM ('upcoming', 'in_progress', 'completed', 'cancelled');

-- Participant status enum
CREATE TYPE participant_status AS ENUM ('pending', 'approved', 'rejected');

-- Friendship status enum
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'rejected');

-- Message type enum
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');
