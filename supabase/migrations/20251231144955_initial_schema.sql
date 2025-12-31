-- Initial schema: Extensions and Enums
-- This migration sets up the foundational elements for the database

-- Enable required extensions
-- Note: On Supabase hosted, extensions may already be enabled via dashboard
-- Don't specify schema to avoid conflicts with pre-installed extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

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
