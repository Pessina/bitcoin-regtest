import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/rpc': {
        target: 'http://localhost:18443',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc/, ''),
        auth: 'test:test123',
      },
    },
  },
});
