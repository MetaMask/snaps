import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8017,
  },
  polyfills: {
    stream: true,
  },
  stats: {
    buffer: false,
  },
};

export default config;
