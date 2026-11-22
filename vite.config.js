import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        management: resolve(__dirname, 'management.html'),
        socialVideo: resolve(__dirname, 'social-video.html'),
      },
    },
  },
});
