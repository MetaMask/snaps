import type { SnapConfig } from '@metamask/snaps-cli';
import { merge } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8002,
  },
  customizeWebpackConfig: (defaultConfig) =>
    merge(defaultConfig, {
      resolve: {
        fallback: {
          buffer: require.resolve('buffer/'),
          stream: require.resolve('stream-browserify'),
        },
      },
    }),
};

export default config;
