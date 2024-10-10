import type { SnapConfig } from '@metamask/snaps-cli';

const config: SnapConfig = {
  input: './src/index.tsx',
  server: {
    port: 8031,
  },
  typescript: {
    enabled: true,
  },
  stats: {
    buffer: false,
  },
};

export default config;
