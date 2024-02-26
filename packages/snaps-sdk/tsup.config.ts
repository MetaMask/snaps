import deepmerge from 'deepmerge';
import type { Options } from 'tsup';

import packageJson from './package.json';

// `tsup.config.ts` is not under `rootDir`, so we need to use `require` instead.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { default: baseConfig } = require('../../tsup.config');

delete baseConfig.entry;

const config: Options = {
  name: packageJson.name,
  entry: ['src/index.ts'],

  // Esbuild is not deterministic when code splitting is enabled. This is
  // problematic for building the example Snaps in this repository, so we
  // disable code splitting here.
  splitting: false,
};

export default deepmerge<Options>(baseConfig, config);
