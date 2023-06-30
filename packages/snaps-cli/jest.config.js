const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

// Dependencies that are ESM-only, and need to be transpiled by SWC.
const ESM_DEPENDENCIES = [
  'clet',
  'execa',
  'strip-final-newline',
  'npm-run-path',
  'path-key',
  'onetime',
  'mimic-fn',
  'human-signals',
  'is-stream',
  'strip-ansi',
  'ansi-regex',
  'p-event',
  'p-timeout',
  'dirname-filename-esm',
  'trash',
  'is-path-inside',
  'dot-prop',
];

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/types'],
  coverageThreshold: {
    global: {
      branches: 97.29,
      functions: 93.84,
      lines: 97.81,
      statements: 97.61,
    },
  },
  setupFiles: ['./test/setup.js'],
  transformIgnorePatterns: [`node_modules/(?!(${ESM_DEPENDENCIES.join('|')}))`],
  testTimeout: 120000,
});
