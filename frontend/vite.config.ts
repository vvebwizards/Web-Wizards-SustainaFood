import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://backend:5000', // remplace 5000 par le vrai port de ton backend si besoin
    },
  },
  
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  test: {  // ✅ This will now be recognized!
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});
