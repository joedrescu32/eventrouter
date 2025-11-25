import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client with fallback for build time
// Use a valid Supabase URL format to pass validation during build
const getSupabaseUrl = () => {
  if (supabaseUrl) return supabaseUrl;
  // Valid Supabase URL format for build time
  return 'https://xxxxxxxxxxxxx.supabase.co';
};

const getSupabaseKey = () => {
  if (supabaseAnonKey) return supabaseAnonKey;
  // Valid JWT format for build time (this is a placeholder, not a real key)
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
};

// Only validate secret key if we have actual values
if (supabaseAnonKey && (supabaseAnonKey.startsWith('sb_secret_') || supabaseAnonKey.includes('service_role'))) {
  console.error('ERROR: You are using a SECRET key in the browser! This is a security risk.');
  console.error('Please use the ANON/PUBLIC key from Supabase Dashboard → Settings → API → anon public key');
  throw new Error('Invalid API key: Secret keys cannot be used in the browser. Please use the anon/public key.');
}

// Create Supabase client
export const supabase = createClient<Database>(getSupabaseUrl(), getSupabaseKey());

