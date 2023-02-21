const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const { merge } = require('webpack-merge');
const WebpackBarPlugin = require('webpackbar');
const TerserPlugin = require('terser-webpack-plugin');
const { ProvidePlugin } = require('webpack');

const DIST = path.resolve(__dirname, 'dist');
const ENVIRONMENTS = path.resolve(DIST, 'webpack');
const UNSAFE_ENVIRONMENTS = path.resolve(__dirname, '__test__');

module.exports = () => {
  let extraOptions = {};

  if (process.env.NODE_ENV === 'test') {
    extraOptions.resolve = {
      plugins: [
        // To make it possible to build without requiring all other packages to
        // be built first, we use the paths specified in `tsconfig.build.json`
        // to use the TypeScript source files directly, rather than the
        // transpiled JavaScript files.
        new TsconfigPathsPlugin({
          configFile: 'tsconfig.build.json',
        }),
      ],
    };
  }

  /**
   * Base configuration, which should be used by all environments. It sets up
   * TypeScript, and some common plugins.
   */
  const baseConfig = merge(extraOptions, {
    mode: 'none',
    output: {
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/u,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-typescript'],
              },
            },
          ],
          exclude: /node_modules/u,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [new WebpackBarPlugin()],
  });

  /**
   * Node configuration, which should be used by all node environments. It makes
   * sure that the SES lockdown bundle is copied into the output directory, and
   * sets the target to `node`.
   */
  const nodeConfig = merge(baseConfig, {
    target: 'node',
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(
              `${path.dirname(require.resolve('ses/package.json'))}`,
              'dist',
              'lockdown.umd.min.js',
            ),
          },
        ],
      }),
    ],
  });

  /**
   * Configuration for the `node-process` environment.
   */
  const nodeProcessConfig = merge(nodeConfig, {
    name: 'node-process',
    entry: {
      bundle: './src/node-process/index.ts',
    },
    output: {
      path: path.resolve(ENVIRONMENTS, 'node-process'),
    },
  });

  /**
   * Configuration for the `node-thread` environment.
   */
  const nodeThreadConfig = merge(nodeConfig, {
    name: 'node-thread',
    entry: {
      bundle: './src/node-thread/index.ts',
    },
    output: {
      path: path.resolve(ENVIRONMENTS, 'node-thread'),
    },
  });

  /**
   * Base browser configuration, which should be used by all browser
   * environments. It makes sure that the SES lockdown bundle is included in the
   * output bundle.
   *
   * The SES bundle is inlined due to a bug in Chromium and/or SES, which causes
   * unhandled promise rejections to not be caught.
   */
  const browserConfig = merge(baseConfig, {
    entry: {
      lockdown: path.join(
        path.dirname(require.resolve('ses/package.json')),
        'dist',
        'lockdown.umd.js',
      ),
    },
    output: {
      filename: '[name].js',
    },
    plugins: [
      new ProvidePlugin({
        // These Node.js modules are used in the bundle, so we need to polyfill
        // them.
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
      new HtmlWebpackPlugin({
        title: 'MetaMask Snaps Execution Environment',
        scriptLoading: 'blocking',
      }),
      new HtmlInlineScriptPlugin({
        scriptMatchPattern: [/lockdown\.js$/u],
      }),
    ],
    resolve: {
      alias: {
        // Without this alias webpack tried to require `../../node_modules/stream/`
        // which doesn't have `Duplex`, breaking the bundle.
        stream: 'stream-browserify',
        child_process: false,
        fs: false,
      },
      fallback: {
        // `path` and `crypto` are referenced in the bundles, but not used, so
        // we set it to `false` to prevent webpack from trying to bundle them.
        path: false,
        crypto: false,

        // `buffer` used by streams, so we have to add a polyfill.
        buffer: require.resolve('buffer/'),
      },
    },
    optimization: {
      // This makes the output deterministic, which is important for the
      // snapshot tests.
      chunkIds: 'deterministic',
      moduleIds: 'deterministic',

      // Since we're setting `mode` to `none`, we need to explicitly set
      // `NODE_ENV` to `production`.
      nodeEnv: 'production',

      minimize: true,
      minimizer: [
        new TerserPlugin({
          // This makes sure we don't minify the SES lockdown bundle.
          exclude: /lockdown\.js$/u,
        }),
      ],
    },
  });

  /**
   * Configuration for the `iframe` environment.
   */
  const iframeConfig = merge(browserConfig, {
    name: 'iframe',
    entry: {
      bundle: './src/iframe/index.ts',
    },
    output: {
      path: path.resolve(ENVIRONMENTS, 'iframe'),
    },
  });

  /**
   * Configuration for the `offscreen` environment.
   */
  const offscreenConfig = merge(browserConfig, {
    name: 'offscreen',
    entry: {
      bundle: './src/offscreen/index.ts',
    },
    output: {
      path: path.resolve(ENVIRONMENTS, 'offscreen'),
    },
  });

  /**
   * Configuration for the `unsafe` environment. This is used for testing. It's
   * essentially the same as the `iframe` environment, but does not do a full
   * lockdown.
   */
  const unsafeConfig = merge(browserConfig, {
    name: 'iframe-test',
    entry: {
      bundle: './src/iframe-test/index.ts',
    },
    output: {
      path: path.resolve(UNSAFE_ENVIRONMENTS, 'iframe-test'),
    },
    resolve: {
      fallback: {
        // For the test build we use `TsconfigPathsPlugin`, which has the
        // downside that it does not support the browser exports. We need to
        // add a polyfill for `path` to make it work.
        path: 'path-browserify',
      },
    },
  });

  return [
    nodeProcessConfig,
    nodeThreadConfig,
    iframeConfig,
    offscreenConfig,
    unsafeConfig,
  ];
};
