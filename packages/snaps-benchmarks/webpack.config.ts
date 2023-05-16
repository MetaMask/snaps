import HtmlWebpackPlugin from 'html-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import { resolve } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Configuration } from 'webpack';
import merge from 'webpack-merge';

export const baseConfig: Configuration = {
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.ts$/u,
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
  externals: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'node:module': 'commonjs module',
  },
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, 'tsconfig.json'),
        baseUrl: __dirname,
      }),
    ],
    extensions: ['.ts', '.js'],
    alias: {
      /* eslint-disable @typescript-eslint/naming-convention */
      '@metamask/snaps-controllers/test-utils': resolve(
        __dirname,
        '..',
        'snaps-controllers',
        'src',
        'test-utils',
      ),
      '@metamask/snaps-utils/test-utils': resolve(
        __dirname,
        '..',
        'snaps-utils',
        'src',
        'test-utils',
      ),
      /* eslint-enable @typescript-eslint/naming-convention */
    },
    fallback: {
      // These packages are referenced in the bundles, but not used, so
      // we set it to `false` to prevent webpack from trying to bundle them.
      /* eslint-disable @typescript-eslint/naming-convention */
      child_process: false,
      fs: false,
      path: false,
      crypto: false,
      module: false,
      os: false,
      worker_threads: false,
      /* eslint-enable @typescript-eslint/naming-convention */

      // `buffer` is used by streams, so we have to add a polyfill.
      buffer: require.resolve('buffer/'),
    },
  },
  plugins: [new NodePolyfillPlugin(), new HtmlWebpackPlugin()],
  stats: 'errors-only',
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
};

const iframeConfig = merge(baseConfig, {
  name: 'iframe',
  entry: './src/environments/services/iframe.ts',
  output: {
    path: resolve(__dirname, 'dist', 'services', 'iframe'),
  },
});

const workerConfig = merge(baseConfig, {
  name: 'worker-pool',
  entry: './src/environments/services/worker.ts',
  output: {
    path: resolve(__dirname, 'dist', 'services', 'worker-pool'),
  },
});

const configs = [iframeConfig, workerConfig];
export default configs;
