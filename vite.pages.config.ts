import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('./pages', import.meta.url)),
  base: '/korea-coastal-trails-map/',
  plugins: [react()],
  resolve: {alias: {'@': fileURLToPath(new URL('.', import.meta.url))}},
  build: {
    outDir: fileURLToPath(new URL('./dist-pages', import.meta.url)),
    emptyOutDir: true,
  },
});
