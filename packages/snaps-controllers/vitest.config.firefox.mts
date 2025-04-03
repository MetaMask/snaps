import type { UserConfig } from 'vite';
import { mergeConfig } from 'vitest/config';

import config from './vitest.config.mjs';

// `config` seems to be inferred incorrectly, so we need to explicitly type it.
const defaultConfig: UserConfig = config;
delete defaultConfig.test?.browser?.instances;

export default mergeConfig(defaultConfig, {
  test: {
    maxWorkers: 1,

    coverage: {
      // Firefox does not support coverage with V8.
      enabled: false,
    },

    browser: {
      instances: [
        {
          browser: 'firefox',
        },
      ],
    },
  },
});
