'use client';

import { getSupabaseClient } from './supabase';

/**
 * Returns headers with Authorization Bearer token attached if the user is signed in to Supabase.
 */
export async function getAuthHeaders(extraHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };

  try {
    const sb = getSupabaseClient();
    if (sb) {
      const { data } = await sb.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.warn('Could not extract Supabase auth session token:', err);
  }

  return headers;
}
