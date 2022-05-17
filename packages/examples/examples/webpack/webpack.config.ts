import { resolve } from 'path';
import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { merge } from 'webpack-merge';
import WebpackBarPlugin from 'webpackbar';
import SnapsWebpackPlugin from '@metamask/snaps-webpack-plugin';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const HookShellScriptWebpackPlugin = require('hook-shell-script-webpack-plugin');

// Configuration that is shared between the two bundles
const common: Configuration = {
  // For simplicity, we don't do any optimisations here. Ideally, this would be
  // dependent on the `NODE_ENV` or script you're running.
  mode: 'none',
  devtool: 'source-map',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: './dist',
  },
  module: {
    rules: [
      {
        test: /\.(m?js|ts)x?$/u,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [new WebpackBarPlugin()],
  stats: 'errors-only',
  watchOptions: {
    ignored: ['**/snap.manifest.json'],
  },
};

// Configuration for the Snap bundle
const snapConfig: Configuration = merge(common, {
  entry: {
    snap: './src/snap.ts',
  },
  plugins: [
    new SnapsWebpackPlugin(),
    new HookShellScriptWebpackPlugin({
      afterEmit: ['yarn manifest', 'yarn eval'],
    }),
  ],
});

// Configuration for the website bundle
const webConfig: Configuration = merge(common, {
  entry: './src/index.ts',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: '../index.html',
    }),
  ],
});

const config = [snapConfig, webConfig];
export default config;
