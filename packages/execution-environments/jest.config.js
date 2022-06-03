module.exports = {
  collectCoverage: true,
  // Ensures that we collect coverage from all source files, not just tested
  // ones.
  collectCoverageFrom: ['./src/**/*.ts', '!./**/__GENERATED__/**'],
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 63.89,
      functions: 79.12,
      lines: 73.8,
      statements: 74.14,
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
  testEnvironment: 'jsdom',
  testRegex: ['\\.test\\.(ts|js)$'],
  testTimeout: 2500,
};
