/* eslint-disable */

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  }
});

// This exists just for testing.
require('./eval-worker.ts');
