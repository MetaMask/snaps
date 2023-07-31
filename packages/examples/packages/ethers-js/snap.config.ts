import type { SnapConfig } from '@metamask/snaps-cli';
import { merge } from '@metamask/snaps-cli';
import { resolve } from 'path';
import { DefinePlugin } from 'webpack';

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8008,
  },
  polyfills: {
    crypto: true,
    stream: true,
    buffer: true,
  },
  customizeWebpackConfig: (defaultConfig) =>
    merge(defaultConfig, {
      plugins: [
        new DefinePlugin({
          // Ethers.js uses `process.browser` to determine whether it's running
          // in a browser or Node.js environment. We need to set this to `true`
          // so that it doesn't try to use Node.js-specific APIs.
          'process.browser': 'true',
        }),
      ],
    }),
};

export default config;
