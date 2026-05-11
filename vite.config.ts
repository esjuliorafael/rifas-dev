import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  // Dejamos que Vite maneje las variables VITE_ automÃ¡ticamente
  // Solo definimos manualmente las que NO empiezan con VITE_ si fuera necesario
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
  }
});
