import type { SnapConfig } from '@metamask/snaps-cli';

const config: SnapConfig = {
  input: './src/index.ts',
  server: {
    port: 8016,
  },
  stats: {
    buffer: false,
  },
};

export default config;
