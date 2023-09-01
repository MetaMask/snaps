import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8001,
  },
  polyfills: {
    stream: true,
  },
  stats: {
    builtIns: false,
    buffer: false,
  },
};

export default config;
