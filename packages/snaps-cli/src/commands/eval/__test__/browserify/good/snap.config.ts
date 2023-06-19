import type { SnapConfig } from '../../../../../config';

const config: SnapConfig = {
  bundler: 'browserify',
  cliOptions: {
    bundle: './eval.js',
  },
};

export default config;
