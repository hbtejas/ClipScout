/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['lib/**/*.ts', 'components/**/*.tsx', 'app/**/*.tsx'],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/node_modules/**',
        '**/.next/**',
      ],
    },
    // Mock Next.js server-only modules that cannot run in jsdom
    server: {
      deps: {
        inline: ['@supabase/ssr', '@supabase/supabase-js'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // Stub server-only package for test environment
      'server-only': path.resolve(__dirname, 'src/test/stubs/server-only.ts'),
      'next/headers': path.resolve(__dirname, 'src/test/stubs/next-headers.ts'),
    },
  },
});
