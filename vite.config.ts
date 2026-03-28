import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: { css: 'injected' },
    }),
  ],
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
