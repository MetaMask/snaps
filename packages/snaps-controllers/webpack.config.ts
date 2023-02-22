import HtmlWebpackPlugin from 'html-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import { dirname, resolve } from 'path';
import { Configuration, ProvidePlugin } from 'webpack';
import WebpackBarPlugin from 'webpackbar';

/**
 * Webpack configuration for a testing environment. This is not used for
 * production builds.
 */
const config: Configuration = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    bundle: './src/services/iframe/test/test-environment.ts',
  },
  output: {
    filename: '[name].js',
    path: resolve(__dirname, 'test', 'iframe'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@metamask/snaps-utils/test-utils': resolve(
        dirname(require.resolve('@metamask/snaps-utils')),
        '..',
        'src/test-utils',
      ),
    },
    fallback: {
      path: require.resolve('path-browserify'),
      /* eslint-disable @typescript-eslint/naming-convention */
      child_process: false,
      fs: false,
      module: false,
      worker_threads: false,
      /* eslint-enable @typescript-eslint/naming-convention */
    },
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
  plugins: [
    new WebpackBarPlugin(),
    new NodePolyfillPlugin(),
    new ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new HtmlWebpackPlugin({
      scriptLoading: 'blocking',
    }),
  ],
};

export default config;
