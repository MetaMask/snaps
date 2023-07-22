import type { SnapConfig } from '@metamask/snaps-cli';
import { merge } from '@metamask/snaps-cli';
import { resolve } from 'path';
import { DefinePlugin, ProvidePlugin } from 'webpack';

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8008,
  },
  customizeWebpackConfig: (defaultConfig) =>
    merge(defaultConfig, {
      resolve: {
        fallback: {
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
        },
      },
      plugins: [
        new DefinePlugin({
          // Ethers.js uses `process.browser` to determine whether it's running
          // in a browser or Node.js environment. We need to set this to `true`
          // so that it doesn't try to use Node.js-specific APIs.
          'process.browser': 'true',
        }),
        new ProvidePlugin({
          Buffer: ['buffer/', 'Buffer'],
        }),
      ],
    }),
};

export default config;
