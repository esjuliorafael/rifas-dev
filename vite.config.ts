import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const allEnv = { ...process.env, ...env };

  // Usamos el nuevo nombre 'VITE_CLAVE'
  const supabaseUrl = allEnv.VITE_SUPABASE_URL;
  const supabaseKey = allEnv.VITE_CLAVE || allEnv.VITE_SUPABASE_ANON_KEY;

  console.log('--- DIAGNÃSTICO DE ENTORNO V2 ---');
  console.log('URL detectada:', supabaseUrl ? 'SÃ' : 'NO');
  console.log('VITE_CLAVE detectada:', allEnv.VITE_CLAVE ? 'SÃ' : 'NO');
  console.log('---------------------------------');

  if (!supabaseKey && mode === 'production') {
    throw new Error('FATAL: Ni VITE_CLAVE ni VITE_SUPABASE_ANON_KEY fueron detectadas.');
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
