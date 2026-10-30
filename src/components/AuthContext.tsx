'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '@/types';
import { getSupabaseClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole, title?: string) => Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(false);

  // Sync or fetch profile from Supabase user_profiles table
  const fetchOrCreateProfile = useCallback(async (sbUser: User): Promise<UserProfile> => {
    const sb = getSupabaseClient();
    const fallbackProfile: UserProfile = {
      id: sbUser.id,
      email: sbUser.email || '',
      full_name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Hermit Analyst',
      role: (sbUser.user_metadata?.role as UserRole) || 'analyst',
      title: sbUser.user_metadata?.title || 'Intelligence Officer',
      avatar_url: sbUser.user_metadata?.avatar_url || ''
    };

    if (!sb) return fallbackProfile;

    try {
      const { data, error } = await sb
        .from('user_profiles')
        .select('*')
        .eq('id', sbUser.id)
        .maybeSingle();

      if (data && !error) {
        return {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role as UserRole,
          title: data.title,
          avatar_url: data.avatar_url
        };
      }

      // If user profile doesn't exist yet, insert it
      const { data: newProfile, error: insertError } = await sb
        .from('user_profiles')
        .insert({
          id: sbUser.id,
          email: fallbackProfile.email,
          full_name: fallbackProfile.full_name,
          role: fallbackProfile.role,
          title: fallbackProfile.title
        })
        .select()
        .maybeSingle();

      if (newProfile && !insertError) {
        return {
          id: newProfile.id,
          email: newProfile.email,
          full_name: newProfile.full_name,
          role: newProfile.role as UserRole,
          title: newProfile.title,
          avatar_url: newProfile.avatar_url
        };
      }
    } catch (e) {
      console.warn('Error fetching or creating user profile in Supabase:', e);
    }

    return fallbackProfile;
  }, []);

  useEffect(() => {
    let isMounted = true;
    const sb = getSupabaseClient();

    if (sb) {
      setIsSupabaseConfigured(true);

      // 1. Check existing Supabase session
      sb.auth.getSession().then(async ({ data: { session } }) => {
        if (!isMounted) return;
        if (session?.user) {
          const profile = await fetchOrCreateProfile(session.user);
          if (isMounted) setCurrentUser(profile);
        } else {
          if (isMounted) setCurrentUser(null);
        }
        if (isMounted) setIsLoading(false);
      });

      // 2. Listen to Supabase Auth state changes (including email confirmation redirects)
      const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          const profile = await fetchOrCreateProfile(session.user);
          if (isMounted) {
            setCurrentUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setCurrentUser(null);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Supabase is not configured
      setIsSupabaseConfigured(false);
      setCurrentUser(null);
      setIsLoading(false);
    }
  }, [fetchOrCreateProfile]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const sb = getSupabaseClient();
    if (!sb) {
      return { success: false, error: 'Authentication service not available. Supabase credentials must be configured.' };
    }

    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        const profile = await fetchOrCreateProfile(data.user);
        setCurrentUser(profile);
        return { success: true };
      }
      return { success: false, error: 'Sign in failed.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during sign in.';
      return { success: false, error: msg };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'analyst',
    title: string = 'Intelligence Officer'
  ): Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }> => {
    const sb = getSupabaseClient();
    if (!sb) {
      return { success: false, error: 'Supabase is not configured. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable user registration.' };
    }

    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/confirm`
        : undefined;

      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            title
          },
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // When Supabase email confirmations are enabled:
      // data.user is created with confirmed_at = null, and data.session is null.
      if (data.user && !data.session) {
        return { 
          success: true, 
          requiresEmailConfirmation: true 
        };
      }

      // If email confirmation is disabled or session is immediately established:
      if (data.session && data.user) {
        const profile = await fetchOrCreateProfile(data.user);
        setCurrentUser(profile);
        return { success: true, requiresEmailConfirmation: false };
      }

      return { success: true, requiresEmailConfirmation: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during sign up.';
      return { success: false, error: msg };
    }
  };

  const resendConfirmationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const sb = getSupabaseClient();
    if (!sb) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/confirm`
        : undefined;

      const { error } = await sb.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error resending confirmation email.';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        await sb.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        isSupabaseConfigured,
        signIn,
        signUp,
        resendConfirmationEmail,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
