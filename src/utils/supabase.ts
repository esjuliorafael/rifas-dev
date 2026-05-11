import { createClient } from '@supabase/supabase-js';

// Estas variables son inyectadas como texto plano por Vite durante el build
// @ts-ignore
const supabaseUrl = __SUPABASE_URL__;
// @ts-ignore
const supabaseAnonKey = __SUPABASE_ANON_KEY__;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase constants are empty strings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
