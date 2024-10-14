const deepmerge = require('deepmerge');
const { resolve } = require('path');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  collectCoverageFrom: [
    '!./src/**/index.ts',
    '!./src/types/global.ts',
    '!./src/types/images.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },

  projects: [
    {
      testMatch: [
        '<rootDir>/src/jsx/validation.test.tsx',
        '<rootDir>/src/jsx/jsx-runtime.test.tsx',
      ],
      transform: {
        '^.+\\.(t|j)sx?$': [
          'ts-jest',
          {
            tsconfig: {
              jsx: 'react-jsx',
              jsxImportSource: resolve(__dirname, './src/jsx'),
            },
          },
        ],
      },
    },
    {
      testMatch: ['<rootDir>/**/*.test.ts', '<rootDir>/**/*.test.tsx'],
      testPathIgnorePatterns: [
        '<rootDir>/src/jsx/validation.test.tsx',
        '<rootDir>/src/jsx/jsx-runtime.test.tsx',
      ],
      transform: {
        '^.+\\.(t|j)sx?$': [
          'ts-jest',
          {
            tsconfig: {
              jsx: 'react-jsxdev',
              jsxImportSource: resolve(__dirname, './src/jsx'),
            },
          },
        ],
      },
    },
  ],
});
