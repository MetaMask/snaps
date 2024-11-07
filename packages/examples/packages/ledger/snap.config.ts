import type { SnapConfig } from '@metamask/snaps-cli';

const config: SnapConfig = {
  input: './src/index.tsx',
  server: {
    port: 8032,
  },
  polyfills: {
    buffer: true,
  },
  stats: {
    buffer: false,
  },
};

export default config;
