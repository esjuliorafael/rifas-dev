import { createClient } from '@supabase/supabase-js';

// Usar el mÃ©todo estÃ¡ndar de Vite para cargar variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Este log nos ayudarÃ¡ a saber si el problema es que la variable estÃ¡ vacÃ­a
  console.error('ERROR: Las variables VITE_SUPABASE no estÃ¡n llegando al cliente.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
