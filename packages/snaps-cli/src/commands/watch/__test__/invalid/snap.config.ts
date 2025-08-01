import type { SnapConfig } from '@metamask/snaps-cli';

const config: SnapConfig = {
  input: 'input.mjs',
  output: {
    path: './dist',
    filename: 'bundle.js',
  },
};

export default config;
