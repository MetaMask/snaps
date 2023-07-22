import type { SnapConfig } from '@metamask/snaps-cli';
import { merge } from '@metamask/snaps-cli';

const config: SnapConfig = {
  bundler: 'webpack',
  input: './src/index.ts',
  server: {
    port: 8016,
  },
  stats: {
    buffer: false,
  },
  customizeWebpackConfig: (defaultConfig) =>
    merge(defaultConfig, {
      resolve: {
        fallback: {
          stream: require.resolve('stream-browserify'),
        },
      },
    }),
};

export default config;
