import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  bundler: 'browserify',
  cliOptions: {
    src: resolve(__dirname, 'src/index.ts'),
    port: 8021,
  },
};

export default config;
