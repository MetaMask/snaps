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
              }),
            ],
          },
        },
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
      acceptInsecureCerts: true,
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
        folders: [
          {
            mount: '/',
            path: resolve(__dirname, './__test__/iframe-test'),
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
      },
    ],
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
};
