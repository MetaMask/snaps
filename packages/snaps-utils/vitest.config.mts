// eslint-disable-next-line import-x/no-nodejs-modules
import { join } from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const IFRAME_PATH = join(import.meta.dirname, './dist/browserify/iframe');

export default defineConfig({
  plugins: [tsconfigPaths(), nodePolyfills()],

  optimizeDeps: {
    include: [
      'vite-plugin-node-polyfills/shims/buffer',
      'vite-plugin-node-polyfills/shims/global',
      'vite-plugin-node-polyfills/shims/process',
    ],
  },

  server: {
    proxy: {
      '/iframe/executor': {
        target: `http://localhost:63317/@fs${IFRAME_PATH}`,
        rewrite: (path) => path.replace(/^\/iframe\/executor/u, ''),
      },
    },

    fs: {
      strict: true,
      allow: ['../snaps-execution-environments/dist/browserify/iframe'],
    },
  },

  test: {
    // Vitest enables watch mode by default. We disable it here, so it can be
    // explicitly enabled with `yarn test:browser --watch`.
    watch: false,

    api: {
      // The port to use for the test server. This is used by the browser
      // provider to connect to the test server.
      port: 63317,
      strictPort: true,
    },

    // The files to include in the test run.
    include: ['src/**/*.test.browser.ts'],

    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
    },

    coverage: {
      enabled: true,

      reportsDirectory: 'coverage/vite',

      // Configure the coverage provider. We use `istanbul` instead of `v8`
      // because it seems to be more reliable.
      provider: 'istanbul',

      // The files to include in the coverage report.
      include: [
        'src/**/*.ts',
        'src/**/*.tsx',
        'src/**/*.js',
        'src/**/*.jsx',
        'src/**/*.mjs',
      ],

      // The files to exclude from the coverage report.
      exclude: [
        'src/**/index.ts',
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/test-utils/**',
        'src/**/__mocks__/**',
        'src/eval-worker.ts',
      ],
    },
  },
});
