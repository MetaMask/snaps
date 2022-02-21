const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const DIST = path.resolve(__dirname, 'dist');

module.exports = (_, argv) => {
  const isProd = argv.mode === 'production';

  let extraOptions = {};

  if (isProd === false) {
    extraOptions = {
      devtool: 'inline-source-map',
    };
  }
  const config = {
    ...extraOptions,
    mode: argv.mode,
    entry: {
      iframe: './src/iframe/index.ts',
      webworker: './src/web-workers/index.ts',
    },
    output: {
      filename: '[name].bundle.js',
      path: DIST,
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
            to: path.resolve(DIST, 'lockdown.umd.min.js'),
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
      },
    },
  };
  return config;
};
