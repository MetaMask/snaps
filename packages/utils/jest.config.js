module.exports = {
  collectCoverage: true,
  // Ensures that we collect coverage from all source files, not just tested
  // ones.
  collectCoverageFrom: ['./src/**/*.ts'],
  coveragePathIgnorePatterns: [
    './src/index.ts',
    // Jest currently doesn't collect coverage for child processes.
    // https://github.com/facebook/jest/issues/5274
    './src/eval-worker.ts',
  ],
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 84.58,
      functions: 96.51,
      lines: 95.75,
      statements: 95.87,
    },
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  preset: 'ts-jest',
  // "resetMocks" resets all mocks, including mocked modules, to jest.fn(),
  // between each test case.
  resetMocks: true,
  // "restoreMocks" restores all mocks created using jest.spyOn to their
  // original implementations, between each test. It does not affect mocked
  // modules.
  restoreMocks: true,
  testEnvironment: 'node',
  testRegex: ['\\.test\\.(ts|js)$'],
  testTimeout: 2500,
};
