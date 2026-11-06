import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '@metamask/snaps-sdk',
    jsxDev: false,
  },
  test: {
    environment: './src/environment.ts',
    setupFiles: ['./src/setup.ts'],
    testTimeout: 30_000,
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.ts'],
    environmentOptions: {
      server: {
        root: './src/test-utils/snap',
      },
    },
  },
});
