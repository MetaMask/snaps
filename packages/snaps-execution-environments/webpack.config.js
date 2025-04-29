// Ideally we write this file with TypeScript, but `@lavamoat/webpack` doesn't
// have any declarations, and it currently makes using it from LavaMoat Node
// more difficult.

const LavaMoatPlugin = require('@lavamoat/webpack');
const { readFileSync } = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { isBuiltin } = require('module');
const { resolve } = require('path');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const { ProvidePlugin, Compilation } = require('webpack');
const { merge } = require('webpack-merge');

/**
 * Whether to generate a policy file for the build.
 *
 * @type {boolean}
 */
// eslint-disable-next-line n/no-process-env
const UPDATE_POLICY = process.env.LAVAMOAT_GENERATE_POLICY === 'true';

/**
 * Whether the build is for production or development.
 *
 * @type {boolean}
 */
const IS_PRODUCTION =
  // eslint-disable-next-line n/no-process-env
  process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test';

/**
 * The SES bundle used for the lockdown script.
 *
 * @type {string}
 */
// eslint-disable-next-line n/no-sync
const SES_BUNDLE = readFileSync(require.resolve('ses'), 'utf-8');

/**
 * @typedef {import('webpack').Configuration} Configuration
 */

/**
 * @typedef {object} EntryPoint
 * @property {string} name - The name of the entry point.
 * @property {string} entry - The entry point file.
 * @property {boolean} [inline] - Whether to inline the lockdown script.
 * @property {boolean} [inlineBundle] - Whether to inline the bundle.
 * @property {boolean} [scuttleGlobalThis] - Whether to enable scuttling.
 * @property {string[]} [scuttleGlobalThisExceptions] - Exceptions to scuttling,
 * in addition to the default ones.
 * @property {import('webpack').Configuration} [config] - Additional webpack
 * configuration for this entry point. This is merged with the base
 * configuration.
 */

/**
 * The default Webpack configuration for web-based entry points.
 *
 * @type {Configuration}
 */
const DEFAULT_WEB_CONFIG = {
  target: `browserslist:${resolve(__dirname, '.browserslistrc')}`,
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
      templateParameters: () => {
        return {
          lockdownScript: SES_BUNDLE,
        };
      },
    }),
  ],
};

/**
 * The entry points for the Webpack build.
 *
 * @type {EntryPoint[]}
 */
const ENTRY_POINTS = [
  {
    name: 'iframe',
    entry: './src/iframe/index.ts',
    scuttleGlobalThis: true,

    config: DEFAULT_WEB_CONFIG,
  },

  {
    name: 'node-thread',
    entry: './src/node-thread/index.ts',
    inline: true,

    config: {
      target: 'node',
    },
  },

  {
    name: 'node-process',
    entry: './src/node-process/index.ts',
    inline: true,

    config: {
      target: 'node',
    },
  },

  {
    name: 'webview',
    target: 'web',
    entry: './src/webview/index.ts',
    inlineBundle: true,

    scuttleGlobalThis: true,
    scuttleGlobalThisExceptions: ['JSON', 'ReactNativeWebView', 'String'],

    config: {
      plugins: [
        new HtmlWebpackPlugin({
          inject: false,
          template: './src/index.ejs',
          templateParameters: ({ assets }) => {
            const bundle = assets['bundle.js'];

            return {
              inlineSource: bundle.source(),
              lockdownScript: SES_BUNDLE,
            };
          },
        }),
      ],
    },
  },

  {
    name: 'worker-executor',
    entry: './src/webworker/executor/index.ts',
    inline: true,

    config: {
      target: 'webworker',
    },
  },

  {
    name: 'worker-pool',
    entry: './src/webworker/pool/index.ts',
    scuttleGlobalThis: true,

    config: DEFAULT_WEB_CONFIG,
  },
];

/**
 * The base Webpack configuration.
 *
 * @type {Configuration}
 */
const baseConfig = {
  // We always set this to `production`, since the development build doesn't
  // have much value, and it makes the build much larger.
  mode: 'production',

  output: {
    filename: 'bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/u,
        use: {
          // While `ts-loader` isn't the fastest, it seems to produce smaller
          // bundles than `swc-loader`.
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: resolve(__dirname, 'tsconfig.build.json'),
            compilerOptions: {
              module: 'esnext',
              moduleResolution: 'bundler',
              target: 'es2022',
            },
          },
        },
      },
    ],
  },

  plugins: [
    new ProvidePlugin({
      process: 'process/browser',
    }),
  ],

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      // Used in the `crypto` endowment, but only as fallback, so we can
      // safely ignore it if it's not available.
      crypto: false,

      stream: require.resolve('stream-browserify'),
    },

    plugins: [
      // `TsconfigPathsPlugin` causes issues with tree shaking, so we only
      // enable it in development mode.
      IS_PRODUCTION
        ? null
        : new TsconfigPathsPlugin({
            configFile: resolve(__dirname, 'tsconfig.build.json'),
            baseUrl: __dirname,
          }),
    ],
  },
};

/**
 * The Webpack configurations for each entry point.
 *
 * @type {Configuration[]}
 */
const configs = ENTRY_POINTS.map(
  ({
    name,
    entry,
    inline,
    inlineBundle,
    scuttleGlobalThis,
    scuttleGlobalThisExceptions = [],
    config = {},
  }) =>
    merge(baseConfig, config, {
      name,
      entry,

      output: {
        path: resolve(__dirname, 'dist/webpack', name),
      },

      plugins: [
        new LavaMoatPlugin({
          isBuiltin,
          generatePolicy: UPDATE_POLICY,
          policyLocation: resolve(__dirname, 'lavamoat', 'webpack', name),
          inlineLockdown: inline ? /bundle\.js/u : undefined,
          scuttleGlobalThis: {
            enabled: scuttleGlobalThis,
            exceptions: [
              'Object',
              'postMessage',
              'Reflect',
              'Set',
              ...scuttleGlobalThisExceptions,
            ],
          },
        }),

        {
          /**
           * A custom "plugin" to remove the `lockdown` asset from the build.
           *
           * @param {import('webpack').Compiler} compiler - The Webpack compiler.
           */
          apply: (compiler) => {
            const PLUGIN_NAME = 'InlinePlugin';

            compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
              compilation.hooks.processAssets.tap(
                {
                  name: PLUGIN_NAME,
                  stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
                },
                (assets) => {
                  // Remove `lockdown` from the assets, since we inline the SES
                  // bundle into the HTML file or the bundle.
                  delete assets.lockdown;

                  if (inlineBundle) {
                    // Remove the `bundle.js` asset, since we inline it into
                    // the HTML file.
                    delete assets['bundle.js'];
                  }
                },
              );
            });
          },
        },
      ],
    }),
);

module.exports = configs;
