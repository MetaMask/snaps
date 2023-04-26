import HtmlWebpackPlugin from 'html-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import { resolve } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

export const baseConfig = {
  mode: 'production',
  entry: './src/environments/services/iframe.ts',
  output: {
    path: resolve(__dirname, 'dist', 'services', 'iframe'),
  },
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
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, 'tsconfig.json'),
        baseUrl: __dirname,
      }),
    ],
    extensions: ['.ts', '.js'],
    alias: {
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
    },
    fallback: {
      // These packages are referenced in the bundles, but not used, so
      // we set it to `false` to prevent webpack from trying to bundle them.
      child_process: false,
      fs: false,
      path: false,
      crypto: false,
      module: false,
      os: false,
      worker_threads: false,

      // `buffer` used by streams, so we have to add a polyfill.
      buffer: require.resolve('buffer/'),
    },
  },
  plugins: [new NodePolyfillPlugin(), new HtmlWebpackPlugin()],
};

export default baseConfig;
