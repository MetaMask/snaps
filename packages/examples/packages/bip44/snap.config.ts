import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8002,
  },
  stats: {
    buffer: false,
    builtIns: {
      ignore: ['crypto'],
    },
  },
};

export default config;
