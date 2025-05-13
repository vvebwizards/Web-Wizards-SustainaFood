import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://foodreduce-backend.azurewebsites.net', // Updated to the deployed backend URL
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
