import deepmerge from 'deepmerge';
import type { Options } from 'tsup';

import packageJson from './package.json';

// `tsup.config.ts` is not under `rootDir`, so we need to use `require` instead.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { default: baseConfig } = require('../../tsup.config');

const config: Options = {
  name: packageJson.name,
};

export default deepmerge<Options>(baseConfig, config);
