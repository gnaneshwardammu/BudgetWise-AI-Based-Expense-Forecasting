import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],

  // 👉 for local development
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  // 👉 for Railway deployment (IMPORTANT 🔥)
  preview: {
    host: true,
    allowedHosts: true
  }
});