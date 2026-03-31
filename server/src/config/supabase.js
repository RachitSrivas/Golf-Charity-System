import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl        = process.env.SUPABASE_URL             || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabaseAnonKey    = process.env.SUPABASE_ANON_KEY         || 'placeholder';

const isConfigured = !supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder');

if (!isConfigured) {
  console.warn('⚠️  SUPABASE credentials are missing — set real values in server/.env');
} else if (supabaseServiceKey.includes('placeholder') || supabaseServiceKey.startsWith('REPLACE')) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. Get it from: supabase.com → Project Settings → API → service_role (secret)');
  console.warn('    Admin and database operations will fail until this is added to server/.env');
}

// Admin client — bypasses RLS (service role key required)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Anon client — respects RLS, used for token verification
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create a user-scoped Supabase client using the user's own JWT.
 * This respects RLS policies and works WITHOUT the service role key
 * for user-owned data (scores, subscriptions, etc.)
 */
export const getUserClient = (userJwt) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${userJwt}` } },
  });
