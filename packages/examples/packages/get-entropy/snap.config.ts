import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  input: resolve(__dirname, 'src/index.tsx'),
  server: {
    port: 8009,
  },
  typescript: {
    enabled: true,
  },
  stats: {
    buffer: false,
    builtIns: {
      ignore: ['crypto'],
    },
  },
};

export default config;
