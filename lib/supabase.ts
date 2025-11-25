import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

// Check if they're accidentally using a secret key
if (supabaseAnonKey.startsWith('sb_secret_') || supabaseAnonKey.includes('service_role')) {
  console.error('ERROR: You are using a SECRET key in the browser! This is a security risk.');
  console.error('Please use the ANON/PUBLIC key from Supabase Dashboard → Settings → API → anon public key');
  throw new Error('Invalid API key: Secret keys cannot be used in the browser. Please use the anon/public key.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

