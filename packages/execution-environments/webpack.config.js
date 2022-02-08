const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

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
    plugins: [new NodePolyfillPlugin()],
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
  return config;
};
