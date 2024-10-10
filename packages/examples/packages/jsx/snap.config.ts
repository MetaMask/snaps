import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  input: resolve(__dirname, 'src/index.tsx'),
  server: {
    port: 8029,
  },
  typescript: {
    enabled: true,
  },
  stats: {
    buffer: false,
  },
};

export default config;
