import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Base path for Netlify (leave "/" if deploying to root domain)
  base: "/",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000", // your backend for local dev
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist", // Netlify expects this
  },
});
