// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: "/",
  server: {
    // Remove proxy or keep only for local dev
    // proxy: {
    //   "/api": "http://localhost:8000"
    // }
  },
  build: {
    outDir: "dist",
  },
});