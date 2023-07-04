import { SnapConfig } from '@metamask/snaps-cli';

const config: SnapConfig = {
  bundler: 'webpack',
  input: './src/index.ts',
  server: {
    port: 8013,
  },
  plugins: {
    bundleWarnings: {
      buffer: false,
    },
  },
};

export default config;
