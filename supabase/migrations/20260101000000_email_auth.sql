-- Migration: Email OTP Authentication
-- Removes phone authentication, adds support for email OTP (magic link) auth

SET search_path TO public, extensions;

-- Remove phone_number column from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS phone_number;

-- Add email column to profiles for display/search
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;

-- Update the handle_new_user trigger to work with email users
-- Extracts display_name from email username as default
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1)  -- Default display name from email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Note: The trigger on_auth_user_created already exists from 20251231145100_add_profiles.sql
-- and will automatically use the updated function
