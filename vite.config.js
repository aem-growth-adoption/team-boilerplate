import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    cloudflare({
      config: process.env.DEV_SKIP_AUTH ? { vars: { DEV_SKIP_AUTH: process.env.DEV_SKIP_AUTH } } : undefined,
    }),
  ],
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
}));
