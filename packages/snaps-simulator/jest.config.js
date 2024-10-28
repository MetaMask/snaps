const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

delete baseConfig.transform;

module.exports = deepmerge(baseConfig, {
  coverageThreshold: {
    global: {
      branches: 48.33,
      functions: 54.49,
      lines: 75.63,
      statements: 76.18,
    },
  },
  setupFiles: ['./jest.setup.js'],
  testEnvironment: './jest.environment.js',
  moduleNameMapper: {
    // Mocks out all these file formats when tests are run
    '\\.(css|less|scss|sass|svg)$': '<rootDir>/src/assets/file-mock.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(monaco-editor|react-monaco-editor|react-dnd|dnd-core|@react-dnd/*|@minoru/react-dnd-treeview|nanoid))',
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          target: 'es2022',
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
              useBuiltins: true,
            },
          },
        },
        sourceMaps: false,
      },
    ],
  },
});
