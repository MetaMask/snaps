const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const { merge } = require('webpack-merge');
const WebpackBarPlugin = require('webpackbar');

const DIST = path.resolve(__dirname, 'dist');
const ENVIRONMENTS = path.resolve(DIST, 'webpack');
const UNSAFE_ENVIRONMENTS = path.resolve(__dirname, '__test__');

module.exports = (_, argv) => {
  const isProd = argv.mode === 'production';

  let extraOptions = {};

  if (isProd === false) {
    extraOptions = {
      devtool: 'inline-source-map',
    };
  }

  /**
   * Base configuration, which should be used by all environments. It sets up
   * TypeScript, and some common plugins.
   */
  const baseConfig = {
    ...extraOptions,
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
      plugins: [
        new TsconfigPathsPlugin({
          configFile: 'tsconfig.build.json',
        }),
      ],
    },
    plugins: [new WebpackBarPlugin()],
  };

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
        'lockdown.umd.min.js',
      ),
    },
    output: {
      filename: '[name].js',
    },
    plugins: [
      new NodePolyfillPlugin(),
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
    },
  });

  /**
   * Configuration for the `iframe` environment.
   */
  const iframeConfig = merge(browserConfig, {
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
  });

  return [
    nodeProcessConfig,
    nodeThreadConfig,
    iframeConfig,
    offscreenConfig,
    unsafeConfig,
  ];
};
