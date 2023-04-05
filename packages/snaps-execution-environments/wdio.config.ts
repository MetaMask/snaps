import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import type { Options } from '@wdio/types';
// eslint-disable-next-line @typescript-eslint/no-shadow
import type { Request, Response } from 'express';
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
        port: 4568,
        middleware: [
          {
            mount: '/worker/executor/',

            // This is a workaround to add the `Access-Control-Allow-Origin`
            // header to the worker bundle, which is required because it is
            // loaded from a different origin than the test page.
            middleware: (_: Request, response: Response) => {
              response.setHeader('Access-Control-Allow-Origin', '*');

              response.type('application/javascript');
              response.sendFile(
                resolve(
                  __dirname,
                  './dist/browserify/worker-executor/bundle.js',
                ),
              );
            },
          },
        ],
        folders: [
          // The iframe execution service bundle.
          {
            mount: '/',
            path: resolve(__dirname, './dist/browserify/iframe'),
          },

          // The web worker execution service bundle.
          {
            mount: '/worker/executor',
            path: resolve(__dirname, './dist/browserify/worker-executor'),
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
