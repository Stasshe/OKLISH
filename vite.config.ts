import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  root: 'dev',
  resolve: {
    alias: {
      $lib: '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['../tests/**/*.test.ts'],
    setupFiles: ['../tests/setup.ts'],
  },
});
