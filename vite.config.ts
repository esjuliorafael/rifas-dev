import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Fusionar variables de .env y de process.env (Cloudflare)
  const allEnv = { ...process.env, ...env };

  console.log('--- DEPURACIÃN DE VARIABLES VITE_ ---');
  Object.keys(allEnv).forEach(key => {
    if (key.startsWith('VITE_')) {
      console.log(`Detectada: ${key} (Longitud: ${allEnv[key]?.length})`);
    }
  });
  console.log('---------------------------------------');

  const supabaseUrl = allEnv.VITE_SUPABASE_URL;
  const supabaseKey = allEnv.VITE_SUPABASE_ANON_KEY;

  if (!supabaseKey && mode === 'production') {
    throw new Error('FATAL: VITE_SUPABASE_ANON_KEY no detectada. Revisa los nombres arriba.');
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      '__SUPABASE_URL__': JSON.stringify(supabaseUrl || ''),
      '__SUPABASE_ANON_KEY__': JSON.stringify(supabaseKey || ''),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  };
});
