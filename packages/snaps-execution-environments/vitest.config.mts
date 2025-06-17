import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
// eslint-disable-next-line import-x/no-nodejs-modules
import { join } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const IFRAME_PATH = join(import.meta.dirname, './dist/webpack/iframe');

const WORKER_EXECUTOR_PATH = join(
  import.meta.dirname,
  './dist/webpack/worker-executor',
);

const WORKER_POOL_PATH = join(
  import.meta.dirname,
  './dist/webpack/worker-pool',
);

export default defineConfig({
  plugins: [tsconfigPaths()],

  optimizeDeps: {
    include: ['@lavamoat/lavatube'],

    esbuildOptions: {
      plugins: [
        // @ts-expect-error: Incompatibility between Vite versions.
        NodeModulesPolyfillPlugin(),

        // @ts-expect-error: Incompatibility between Vite versions.
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },

  server: {
    proxy: {
      '/iframe/executor': {
        target: `http://localhost:63316/@fs${IFRAME_PATH}`,
        rewrite: (path) => path.replace(/^\/iframe\/executor/u, ''),
      },

      '/worker/executor': {
        target: `http://localhost:63316/@fs${WORKER_EXECUTOR_PATH}`,
        rewrite: (path) => path.replace(/^\/worker\/executor/u, ''),
      },

      '/worker/pool': {
        target: `http://localhost:63316/@fs${WORKER_POOL_PATH}`,
        rewrite: (path) => path.replace(/^\/worker\/pool/u, ''),
      },
    },

    fs: {
      strict: true,
      allow: [
        './dist/webpack/iframe',
        './dist/webpack/worker-executor',
        './dist/webpack/worker-pool',
      ],
    },
  },

  test: {
    // Vitest enables watch mode by default. We disable it here, so it can be
    // explicitly enabled with `yarn test:browser --watch`.
    watch: false,

    api: {
      // The port to use for the test server. This is used by the browser
      // provider to connect to the test server.
      port: 63316,
      strictPort: true,
    },

    // The files to include in the test run.
    include: ['src/**/*.test.browser.ts'],

    server: {
      deps: {
        inline: ['@lavamoat/lavatube'],
      },
    },

    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
    },

    coverage: {
      enabled: true,

      reportsDirectory: 'coverage/vite',
      reporter: ['json', 'json-summary', 'html'],

      // Configure the coverage provider. We can't use `istanbul` because it
      // changes functions, which breaks SES.
      provider: 'v8',

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
        'src/**/test-utils/**',
      ],
    },

    // These break SES lockdown.
    printConsoleTrace: false,
    includeTaskLocation: false,
  },
});
