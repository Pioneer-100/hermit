import { NextRequest } from 'next/server';
import { getSupabaseClient, getSupabaseAdminClient } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthValidationResult {
  isAuthenticated: boolean;
  user: User | null;
  error?: string;
}

/**
 * Validates request authorization header or Supabase auth session token.
 * Supports:
 * 1. Bearer <JWT_ACCESS_TOKEN> from Supabase client session
 * 2. Fallback to demo mode if Supabase environment is unconfigured
 */
export async function authenticateApiRequest(req: NextRequest): Promise<AuthValidationResult> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const client = getSupabaseClient();

  // In production, strictly reject unconfigured databases to prevent accidental public access
  if (!client) {
    if (process.env.NODE_ENV === 'production') {
      return {
        isAuthenticated: false,
        user: null,
        error: 'Critical: Database configuration missing in production environment.'
      };
    }
    // Graceful fallback ONLY in local development / demo mode
    return {
      isAuthenticated: true,
      user: null
    };
  }

  if (!token) {
    return {
      isAuthenticated: false,
      user: null,
      error: 'Missing Authorization bearer token'
    };
  }

  try {
    const { data: { user }, error } = await client.auth.getUser(token);

    if (error || !user) {
      return {
        isAuthenticated: false,
        user: null,
        error: error?.message || 'Invalid or expired session token'
      };
    }

    return {
      isAuthenticated: true,
      user
    };
  } catch (err: any) {
    return {
      isAuthenticated: false,
      user: null,
      error: err?.message || 'Authentication verification failed'
    };
  }
}
