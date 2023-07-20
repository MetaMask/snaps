// Strictly speaking, this file is not a valid CommonJS module, because it
// uses `import`. We mostly care about the `module.exports` part, though.

import type { SnapConfig } from '../../config';

const config: SnapConfig = {
  bundler: 'webpack',
  input: 'src/index.ts',
};

module.exports = config;
