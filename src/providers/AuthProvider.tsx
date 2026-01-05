import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabase';
import * as authService from '../services/auth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  signInWithEmail: (email: string) => Promise<{ error: AuthError | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Check if user needs onboarding
  const checkOnboarding = useCallback(async (userId: string) => {
    const isComplete = await authService.checkProfileComplete(userId);
    setNeedsOnboarding(!isComplete);
  }, []);

  // Refresh onboarding status (call after completing onboarding)
  const refreshOnboardingStatus = useCallback(async () => {
    if (session?.user) {
      await checkOnboarding(session.user.id);
    }
  }, [session?.user, checkOnboarding]);

  // Handle deep link URL (magic link callback)
  const handleDeepLink = useCallback(async (url: string) => {
    // Supabase handles the token extraction from URL automatically
    // when detectSessionInUrl is true in the client config
    // The onAuthStateChange listener will pick up the new session
    if (url.includes('access_token') || url.includes('refresh_token')) {
      // URL contains auth tokens, Supabase will handle it
      console.log('Deep link received with auth tokens');
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkOnboarding(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await checkOnboarding(session.user.id);
        } else {
          setNeedsOnboarding(false);
        }
        setIsLoading(false);
      }
    );

    // Handle deep links when app is already open
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, [checkOnboarding, handleDeepLink]);

  const signInWithEmail = async (email: string) => {
    const { error } = await authService.signInWithEmail(email);
    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await authService.verifyOtp(email, token);
    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
    setNeedsOnboarding(false);
  };

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    isLoading,
    needsOnboarding,
    signInWithEmail,
    verifyOtp,
    signOut,
    refreshOnboardingStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
