import type { SnapConfig } from '@metamask/snaps-cli';

const config: SnapConfig = {
  input: './src/index.ts',
  server: {
    port: 8018,
  },
  stats: {
    buffer: false,
  },
};

export default config;
