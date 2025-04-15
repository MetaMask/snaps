// eslint-disable-next-line import-x/no-nodejs-modules
import { join } from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const IFRAME_PATH = join(
  import.meta.dirname,
  '../snaps-execution-environments/dist/webpack/iframe',
);

const IFRAME_TEST_PATH = join(
  import.meta.dirname,
  './src/services/iframe/test',
);

const WORKER_EXECUTOR_PATH = join(
  import.meta.dirname,
  '../snaps-execution-environments/dist/webpack/worker-executor',
);

const WORKER_POOL_PATH = join(
  import.meta.dirname,
  '../snaps-execution-environments/dist/webpack/worker-pool',
);

export default defineConfig({
  plugins: [tsconfigPaths(), nodePolyfills()],

  server: {
    proxy: {
      '/iframe/executor': {
        target: `http://localhost:63315/@fs${IFRAME_PATH}`,
        rewrite: (path) => path.replace(/^\/iframe\/executor/u, ''),
      },

      '/iframe/test': {
        target: `http://localhost:63315/@fs${IFRAME_TEST_PATH}`,
        rewrite: (path) => path.replace(/^\/iframe\/test/u, ''),
      },

      '/worker/executor': {
        target: `http://localhost:63315/@fs${WORKER_EXECUTOR_PATH}`,
        rewrite: (path) => path.replace(/^\/worker\/executor/u, ''),
      },

      '/worker/pool': {
        target: `http://localhost:63315/@fs${WORKER_POOL_PATH}`,
        rewrite: (path) => path.replace(/^\/worker\/pool/u, ''),
      },
    },

    fs: {
      strict: true,
      allow: [
        './src/services/iframe/test',
        '../snaps-execution-environments/dist/webpack/iframe',
        '../snaps-execution-environments/dist/webpack/worker-executor',
        '../snaps-execution-environments/dist/webpack/worker-pool',
      ],
    },
  },

  test: {
    // Vitest enables watch mode by default. We disable it here, so it can be
    // explicitly enabled with `yarn test:browser --watch`.
    watch: false,

    // The files to include in the test run.
    include: ['src/**/*.test.browser.ts'],

    browser: {
      enabled: true,
      headless: false,
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
        'src/**/node-js/**',
        'src/services/node.ts',
      ],
    },
  },
});
