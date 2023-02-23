import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import type { Options } from '@wdio/types';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

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
    },
  ],

  autoCompileOpts: {
    tsNodeOpts: {
      project: './tsconfig.json',
    },
  },

  specs: ['./src/**/*.test.browser.ts'],

  maxInstances: 10,
  capabilities: [
    {
      maxInstances: 5,
      browserName: 'chrome',
      acceptInsecureCerts: true,
    },
  ],

  logLevel: 'silent',

  services: [
    'chromedriver',
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
              '../snaps-execution-environments/__test__/iframe-test',
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
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
};
