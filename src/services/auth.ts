import { AuthError, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface AuthResult<T = void> {
  data: T | null;
  error: AuthError | null;
}

/**
 * Send OTP/Magic Link to email
 */
export async function signInWithEmail(email: string): Promise<AuthResult> {
  try {
    console.log('[Auth] Sending OTP to:', email);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Email redirect is handled by Supabase config (site_url in config.toml)
        // The app scheme 'ballers://' will be used for deep links
      },
    });

    if (error) {
      console.error('[Auth] OTP error:', error.message);
    } else {
      console.log('[Auth] OTP sent successfully');
    }

    return { data: null, error };
  } catch (e: any) {
    console.error('[Auth] Network error:', e.message);
    return {
      data: null,
      error: { message: 'Network error. Check your connection.', name: 'NetworkError', status: 0 } as AuthError,
    };
  }
}

/**
 * Verify OTP code manually entered by user
 */
export async function verifyOtp(
  email: string,
  token: string
): Promise<AuthResult<Session>> {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  return { data: data.session, error };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();
  return { data: null, error };
}

/**
 * Get current session
 */
export async function getSession(): Promise<AuthResult<Session>> {
  const { data, error } = await supabase.auth.getSession();
  return { data: data.session, error };
}

/**
 * Check if user profile is complete (has selected at least one sport)
 * Users need onboarding if they have no sports in user_sports table
 */
export async function checkProfileComplete(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('user_sports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }

  // Profile is complete if user has at least one sport selected
  return (count ?? 0) > 0;
}
