import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Add debugging logs
console.log('Supabase Configuration:', {
  url: import.meta.env.VITE_SUPABASE_URL || 'not set',
  hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  anonKeyPrefix: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 6) || 'not set'
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Test the connection
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase Auth Event:', event, 'Session:', !!session);
});