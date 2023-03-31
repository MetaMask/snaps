import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import type { Options } from '@wdio/types';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

const IS_CI = Boolean(process.env.CI);
const MAX_WORKERS = IS_CI ? 1 : 5;

export const config: Options.Testrunner = {
  runner: [
    'browser',
    {
      headless: true,
      viteConfig: {
        plugins: [tsconfigPaths()],
        optimizeDeps: {
          esbuildOptions: {
            plugins: [
              NodeModulesPolyfillPlugin(),
              NodeGlobalsPolyfillPlugin({
                buffer: true,
                process: true,
              }),
            ],
          },
        },
      },

      coverage: {
        enabled: true,
        exclude: ['**/*.test.browser.ts', '**/test-utils/**'],
        reporter: ['html', 'json-summary', 'text', 'json'],
        reportsDirectory: './coverage/wdio',
      },
    },
  ],

  autoCompileOpts: {
    tsNodeOpts: {
      project: './tsconfig.json',
    },
  },

  specs: ['./src/**/*.test.browser.ts'],

  maxInstances: MAX_WORKERS,
  capabilities: [
    {
      maxInstances: MAX_WORKERS,
      browserName: 'chrome',
    },
    {
      maxInstances: MAX_WORKERS,
      browserName: 'firefox',
    },
  ],

  logLevel: 'error',

  services: [
    'chromedriver',
    'geckodriver',
    [
      'static-server',
      {
        port: 4567,
        folders: [
          // The iframe execution service bundle.
          {
            mount: '/',
            path: resolve(
              __dirname,
              '../snaps-execution-environments/dist/browserify/iframe',
            ),
          },

          // The web worker execution service bundle.
          {
            mount: '/worker/executor',
            path: resolve(
              __dirname,
              '../snaps-execution-environments/dist/browserify/worker-executor',
            ),
          },

          // The web worker pool.
          {
            mount: '/worker/pool',
            path: resolve(
              __dirname,
              '../snaps-execution-environments/dist/browserify/worker-pool',
            ),
          },

          // A test page used for testing the sandboxing.
          {
            mount: '/test/sandbox',
            path: resolve(__dirname, './src/services/iframe/test'),
          },
        ],
      },
    ],
  ],

  framework: 'mocha',
  reporters: [
    [
      'spec',
      {
        addConsoleLogs: true,
        showPreface: false,
        realtimeReporting: true,
      },
    ],
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
};
