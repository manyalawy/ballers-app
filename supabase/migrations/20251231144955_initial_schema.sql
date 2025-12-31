-- Initial schema: Extensions and Enums
-- This migration sets up the foundational elements for the database

-- Enable required extensions
-- Note: Extensions are installed in 'extensions' schema by Supabase by default
-- uuid-ossp is pre-installed by Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA extensions;

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
