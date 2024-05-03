import type { SnapConfig } from '@metamask/snaps-cli';
import { merge } from '@metamask/snaps-cli';
import { resolve } from 'path';
import { DefinePlugin } from 'webpack';

const config: SnapConfig = {
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8008,
  },
  stats: {
    buffer: false,
    builtIns: {
      ignore: ['crypto'],
    },
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
