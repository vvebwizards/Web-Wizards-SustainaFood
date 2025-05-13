import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://foodreduce-backend.azurewebsites.net', // Updated to the deployed backend URL
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
  build: {
    outDir: 'dist', // Ensure this is set to 'dist'
  },
});
