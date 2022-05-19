module.exports = {
  collectCoverage: true,
  // Ensures that we collect coverage from all source files, not just tested
  // ones.
  // 1. TODO: add coverage for lockdownMore once more research has been done into SES
  // 2. skipping coverage for iframe and web-worker executors
  // as the BaseSnapExecutor class is fully tested
  collectCoverageFrom: [
    './src/**/*.ts',
    '!./**/__GENERATED__/**',
    '!./src/common/lockdown/lockdown-more.ts',
    '!./src/iframe/**',
    '!./src/web-workers/**',
  ],
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 98,
      functions: 100,
      lines: 100,
      statements: 100,
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
