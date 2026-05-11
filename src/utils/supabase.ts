import { createClient } from '@supabase/supabase-js';

/**
 * IMPORTANTE: En Cloudflare Pages, las variables de entorno VITE_ se inyectan 
 * durante el build a travÃ©s de la configuraciÃ³n de vite.config.ts.
 */

// Intentar leer de diferentes fuentes para asegurar compatibilidad total
const supabaseUrl = 
  (import.meta.env?.VITE_SUPABASE_URL) || 
  (globalThis as any)._SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  (import.meta.env?.VITE_SUPABASE_ANON_KEY) || 
  (globalThis as any)._SUPABASE_ANON_KEY || 
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL ERROR: Supabase credentials are missing. Check Cloudflare environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
