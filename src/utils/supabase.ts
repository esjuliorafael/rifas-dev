import { createClient } from '@supabase/supabase-js';

// Estas constantes son inyectadas por Vite durante el build (Fuerza Bruta)
// @ts-ignore
const supabaseUrl = __SUPABASE_URL__;
// @ts-ignore
const supabaseAnonKey = __SUPABASE_ANON_KEY__;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase constants are missing in the build.');
}

// InicializaciÃ³n ultra-explÃ­cita para evitar errores 401 por falta de headers
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Prueba de conexiÃ³n inmediata para diagnÃ³stico en consola del navegador
console.log('Supabase Client Initialized. Target URL:', supabaseUrl);
