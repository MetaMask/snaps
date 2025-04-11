import type { SnapConfig } from '../../../../../config';

const config: SnapConfig = {
  input: 'src/index.ts',
  output: {
    path: __dirname,
    filename: 'eval.js',
  },
};

export default config;
