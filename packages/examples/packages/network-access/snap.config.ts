import type { SnapConfig } from '@metamask/snaps-cli';

const config: SnapConfig = {
  input: './src/index.ts',
  server: {
    port: 8015,
  },
  stats: {
    buffer: false,
  },
};

export default config;
