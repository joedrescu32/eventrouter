import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client with lazy initialization
let supabaseClient: SupabaseClient<Database> | null = null;

const getSupabaseClient = (): SupabaseClient<Database> => {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  // Validate environment variables
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set. Please configure it in your Vercel project settings.');
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set. Please configure it in your Vercel project settings.');
  }

  // Validate that we're not using a secret key
  if (supabaseAnonKey.startsWith('sb_secret_') || supabaseAnonKey.includes('service_role')) {
    console.error('ERROR: You are using a SECRET key in the browser! This is a security risk.');
    console.error('Please use the ANON/PUBLIC key from Supabase Dashboard → Settings → API → anon public key');
    throw new Error('Invalid API key: Secret keys cannot be used in the browser. Please use the anon/public key.');
  }

  // Create and cache the client
  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
};

// Export a getter function that creates the client on first use
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

