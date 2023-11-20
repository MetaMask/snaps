import HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolve } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import type { Configuration } from 'webpack';
import { ProvidePlugin } from 'webpack';
import { merge } from 'webpack-merge';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const swc = require('../../.swcrc.build.json');

const baseConfig: Configuration = {
  mode: 'production',
  output: {
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/u,
        use: {
          loader: 'swc-loader',
          options: {
            ...swc,
          },
        },
      },
    ],
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        mainFields: ['module', 'main'],
      }),
    ],
    fallback: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      child_process: false,
      crypto: require.resolve('crypto-browserify'),
      fs: false,
      os: false,
      path: false,
      stream: require.resolve('stream-browserify'),
      tty: require.resolve('tty-browserify'),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      worker_threads: false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};

const iframeConfig: Configuration = merge(baseConfig, {
  entry: './src/iframe/index.ts',
  output: {
    path: resolve(__dirname, 'dist/webpack/iframe'),
  },
});

const configs = [iframeConfig];
export default configs;
