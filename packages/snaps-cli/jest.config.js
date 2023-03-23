const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

// Dependencies that are ESM-only, and need to be transpiled by Babel.
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
      branches: 98.79,
      functions: 94.59,
      lines: 98.49,
      statements: 98.5,
    },
  },
  setupFiles: ['./test/setup.js'],
  transformIgnorePatterns: [`node_modules/(?!(${ESM_DEPENDENCIES.join('|')}))`],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testTimeout: 60000,
});
