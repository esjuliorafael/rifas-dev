import { createClient } from '@supabase/supabase-js';

// Constantes inyectadas por Vite (Fuerza Bruta)
// @ts-ignore
const supabaseUrl = __SUPABASE_URL__;
// @ts-ignore
const supabaseAnonKey = __SUPABASE_ANON_KEY__;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase credentials missing.');
}

/**
 * SOLUCIÃN SEGÃN DISCUSIÃN SUPABASE:
 * Las nuevas llaves 'sb_publishable' NO deben enviarse como Bearer tokens.
 * La librerÃ­a se encarga de enviarlas correctamente en el header 'apikey'.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

console.log('Supabase Client Initialized with New Key Protocol.');
