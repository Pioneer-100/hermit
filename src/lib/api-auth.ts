import { NextRequest } from 'next/server';
import { getSupabaseClient } from './supabase';
import { User } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface AuthValidationResult {
  isAuthenticated: boolean;
  user: User | null;
  error?: string;
}

export interface ApiAuthorizationResult {
  authorized: boolean;
  isCron?: boolean;
  user?: User | null;
  reason?: string;
  error?: string;
}

/**
 * Constant-time safe string comparison to prevent timing attacks.
 * Rejects if either string is empty, null, or lengths differ.
 */
export function safeCompare(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length === 0 || b.length === 0) return false;
  if (a.length !== b.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

/**
 * Extracts authentication token from either:
 * 1. Authorization header: "Bearer <token>"
 * 2. Supabase auth cookies (e.g. sb-access-token, sb-auth-token, or sb-*-auth-token)
 */
export function extractAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const headerToken = authHeader.substring(7).trim();
    if (headerToken) return headerToken;
  }

  // Check cookies as fallback for web requests
  const directCookie = req.cookies.get('sb-access-token')?.value || 
                       req.cookies.get('sb-auth-token')?.value;
  if (directCookie) return directCookie;

  // Supabase SSR helper cookie pattern: sb-<project-ref>-auth-token
  for (const cookie of req.cookies.getAll()) {
    if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
      try {
        // May be raw token or JSON string with access_token
        if (cookie.value.startsWith('{') || cookie.value.startsWith('[')) {
          const parsed = JSON.parse(cookie.value);
          if (typeof parsed === 'object' && parsed !== null) {
            if (parsed.access_token) return parsed.access_token;
            if (Array.isArray(parsed) && parsed[0]) return parsed[0];
          }
        }
        return cookie.value;
      } catch {
        return cookie.value;
      }
    }
  }

  return null;
}

/**
 * Validates request authentication against Supabase Auth.
 * Rejects unauthenticated requests in production.
 * Gracefully permits local demo mode only in development when database is unconfigured.
 */
export async function authenticateApiRequest(req: NextRequest): Promise<AuthValidationResult> {
  const client = getSupabaseClient();
  const token = extractAuthToken(req);

  // In production, strictly reject unconfigured databases to prevent accidental public access
  if (!client) {
    if (process.env.NODE_ENV === 'production') {
      return {
        isAuthenticated: false,
        user: null,
        error: 'Critical: Database configuration missing in production environment.'
      };
    }
    // Graceful fallback ONLY in local development / demo mode when DB is unconfigured
    return {
      isAuthenticated: true,
      user: null
    };
  }

  if (!token) {
    return {
      isAuthenticated: false,
      user: null,
      error: 'Missing Authorization bearer token or session cookie'
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

/**
 * Comprehensive API route authorization verification.
 * Supports:
 * - Automated Cron executions via CRON_SECRET (Bearer header or query param)
 * - Authenticated Supabase user sessions (JWT Bearer or cookies)
 *
 * Rejects spoofed referer/origin headers and default hardcoded secrets.
 */
export async function verifyApiAuthorization(
  req: NextRequest,
  options: { allowCron?: boolean } = {}
): Promise<ApiAuthorizationResult> {
  const { allowCron = false } = options;

  // 1. If cron access is allowed, check CRON_SECRET
  if (allowCron) {
    const cronSecret = process.env.CRON_SECRET;
    
    // Disallow empty or known default placeholder tokens in all environments
    const isSecretConfigured = cronSecret && 
      cronSecret.trim().length >= 16 && 
      cronSecret !== 'hermit_super_secret_cron_token_2026';

    if (isSecretConfigured) {
      // Check Bearer token
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const bearerToken = authHeader.substring(7).trim();
        if (safeCompare(bearerToken, cronSecret)) {
          return { authorized: true, isCron: true, reason: 'cron_secret_bearer' };
        }
      }

      // Check query param (?secret=... or ?token=...)
      const { searchParams } = new URL(req.url);
      const secretParam = searchParams.get('secret') || searchParams.get('token');
      if (secretParam && safeCompare(secretParam, cronSecret)) {
        return { authorized: true, isCron: true, reason: 'cron_secret_query' };
      }
    }
  }

  // 2. Check authenticated Supabase user session
  const userAuth = await authenticateApiRequest(req);
  if (userAuth.isAuthenticated) {
    return {
      authorized: true,
      isCron: false,
      user: userAuth.user,
      reason: 'user_authenticated'
    };
  }

  // 3. Fallback: Request denied
  return {
    authorized: false,
    reason: userAuth.error || 'Unauthorized: Missing or invalid credentials'
  };
}
