import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The sandbox exposes the app through a per-runtime proxy host. Vite's host
// allowlist rejects anything it does not recognise, which surfaces as a 403
// "Blocked request" before the app ever loads.
const ALLOWED_HOSTS = ['.all-hands.dev', '.prod-runtime.all-hands.dev'];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ALLOWED_HOSTS,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ALLOWED_HOSTS,
  },
  build: {
    rollupOptions: {
      output: {
        // Keep the React runtime in its own long-lived chunk.
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
});
