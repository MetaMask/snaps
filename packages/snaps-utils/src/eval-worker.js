/* eslint-disable */

require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
  }
});

// This exists just for testing.
require('./eval-worker.ts');
