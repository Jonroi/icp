import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
    // Provide empty implementations for Node.js globals that might be used by dependencies
    'process.env': '{}',
    'process.platform': '"browser"',
    'process.version': '"v16.0.0"',
  },
  server: {
    host: true,
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['dotenv', 'jsdom', 'express'],
  },
});
