import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  test: {  // ✅ This will now be recognized!
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});
