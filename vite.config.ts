import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  console.log('--- DIAGNÃSTICO DE ENTORNO ---');
  console.log('URL detectada:', supabaseUrl ? 'SÃ (' + supabaseUrl.substring(0, 10) + '...)' : 'NO');
  console.log('Key detectada:', supabaseKey ? 'SÃ (Comienza con ' + supabaseKey.substring(0, 5) + '...)' : 'NO');
  console.log('------------------------------');

  // Si falta la llave, lanzamos un error para detener el build y que Cloudflare nos avise
  if (!supabaseKey && mode === 'production') {
    throw new Error('FATAL: VITE_SUPABASE_ANON_KEY no estÃ¡ definida en el entorno de Cloudflare.');
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
