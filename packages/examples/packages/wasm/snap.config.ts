import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8019,
  },
  typescript: {
    enabled: true,
  },
  stats: {
    buffer: false,
  },
  experimental: {
    wasm: true,
  },
};

export default config;
