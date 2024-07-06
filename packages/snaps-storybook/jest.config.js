const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  collectCoverageFrom: [
    '!./src/**/index.ts',
    '!./src/types/global.ts',
    '!./src/types/images.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 21.48,
      functions: 15.32,
      lines: 16.29,
      statements: 16.11,
    },
  },

  testMatch: ['<rootDir>/**/*.test.ts', '<rootDir>/**/*.test.tsx'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsxdev',
          jsxImportSource: '@metamask/snaps-jsx',
        },
      },
    ],
  },
});
