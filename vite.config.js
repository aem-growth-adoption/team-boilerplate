import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
  plugins: [cloudflare()],
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
