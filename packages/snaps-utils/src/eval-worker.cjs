/* eslint-disable */

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'Node16',
  }
});

// This exists just for testing.
require('./eval-worker.ts');
