import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'esbuild',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    strictPort: false,
    open: false,
  },
  preview: {
    port: 3001,
  },
});
