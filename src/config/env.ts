/**
 * Environment configuration helper
 * Provides typed access to environment variables with validation
 */

type Environment = 'development' | 'production';

interface EnvConfig {
  ENV: Environment;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  GOOGLE_MAPS_API_KEY: string;
}

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.warn(`Missing environment variable: ${key}`);
    return '';
  }
  return value;
}

export const env: EnvConfig = {
  ENV: (getEnvVar('EXPO_PUBLIC_ENV') || 'development') as Environment,
  SUPABASE_URL: getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  GOOGLE_MAPS_API_KEY: getEnvVar('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY'),
};

export const isDev = env.ENV === 'development';
export const isProd = env.ENV === 'production';
