import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Intentar cargar desde .env (local) o process.env (Cloudflare)
  const env = loadEnv(mode, process.cwd(), '');
  
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  console.log('--- BUILD CHECK ---');
  console.log('Supabase URL found:', supabaseUrl ? 'YES' : 'NO');
  console.log('Supabase Key found:', supabaseKey ? 'YES' : 'NO');
  console.log('-------------------');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      // ESTO ES FUERZA BRUTA: Reemplaza estas cadenas en todo el cÃ³digo por el valor real
      '__SUPABASE_URL__': JSON.stringify(supabaseUrl || ''),
      '__SUPABASE_ANON_KEY__': JSON.stringify(supabaseKey || ''),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  };
});
