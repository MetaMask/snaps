const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

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

  const nodeConfig = {
    ...extraOptions,
    mode: argv.mode,
    target: 'node',
    entry: {
      'node-process': './src/node-process/index.ts',
      'node-thread': './src/node-thread/index.ts',
    },
    output: {
      filename: '[name]/bundle.js',
      path: ENVIRONMENTS,
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(
              `${path.dirname(require.resolve('ses/package.json'))}`,
              'dist',
              'lockdown.umd.min.js',
            ),
            to: path.resolve(ENVIRONMENTS, 'node-process/lockdown.umd.min.js'),
            toType: 'file',
          },
          {
            from: path.resolve(
              `${path.dirname(require.resolve('ses/package.json'))}`,
              'dist',
              'lockdown.umd.min.js',
            ),
            to: path.resolve(ENVIRONMENTS, 'node-thread/lockdown.umd.min.js'),
            toType: 'file',
          },
        ],
      }),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/u,
          use: 'ts-loader',
          exclude: /node_modules/u,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
  };

  const browserConfig = {
    ...extraOptions,
    mode: argv.mode,
    entry: {
      iframe: './src/iframe/index.ts',
    },
    output: {
      filename: '[name]/bundle.js',
      path: ENVIRONMENTS,
    },
    plugins: [
      new NodePolyfillPlugin(),
      new CopyPlugin({
        patterns: [
          // TODO: Merge this with above if possible
          {
            // For use in <script> tag along with the iframe bundle. Copied to ensure same version as bundled
            from: path.resolve(
              `${path.dirname(require.resolve('ses/package.json'))}`,
              'dist',
              'lockdown.umd.min.js',
            ),
            to: path.resolve(ENVIRONMENTS, 'iframe/lockdown.umd.min.js'),
            toType: 'file',
          },
          {
            from: path.resolve('src', 'iframe', 'index.html'),
            to: path.resolve(ENVIRONMENTS, 'iframe/index.html'),
            toType: 'file',
          },
        ],
      }),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/u,
          use: 'ts-loader',
          exclude: /node_modules/u,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        // Without this alias webpack tried to require ../../node_modules/stream/ which doesn't have Duplex, breaking the bundle
        stream: 'stream-browserify',
        child_process: false,
        fs: false
      },
    },
  };

  const unsafeConfig = {
    ...extraOptions,
    mode: argv.mode,
    entry: {
      'iframe-test': './src/iframe-test/index.ts',
    },
    output: {
      filename: '[name]/bundle.js',
      path: UNSAFE_ENVIRONMENTS,
    },
    plugins: [
      new NodePolyfillPlugin(),
      new CopyPlugin({
        patterns: [
          {
            // For use in <script> tag along with the iframe bundle. Copied to ensure same version as bundled
            from: path.resolve(
              `${path.dirname(require.resolve('ses/package.json'))}`,
              'dist',
              'lockdown.umd.min.js',
            ),
            to: path.resolve(
              UNSAFE_ENVIRONMENTS,
              'iframe-test/lockdown.umd.min.js',
            ),
            toType: 'file',
          },
          {
            from: path.resolve('src', 'iframe', 'index.html'),
            to: path.resolve(UNSAFE_ENVIRONMENTS, 'iframe-test/index.html'),
            toType: 'file',
          },
        ],
      }),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/u,
          use: 'ts-loader',
          exclude: /node_modules/u,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        // Without this alias webpack tried to require ../../node_modules/stream/ which doesn't have Duplex, breaking the bundle
        stream: 'stream-browserify',
        child_process: false,
        fs: false
      },
    },
  };

  return [browserConfig, nodeConfig, unsafeConfig];
};
