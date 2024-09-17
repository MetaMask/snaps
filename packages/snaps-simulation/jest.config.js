const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  testTimeout: 30000,

  collectCoverageFrom: [
    '!./src/**/index.ts',
    '!./src/types/global.ts',
    '!./src/types/images.ts',
  ],

  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          jsxImportSource: '@metamask/snaps-sdk',
        },
      },
    ],
  },
});
