module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/**/src/**/*.ts',
    '!<rootDir>/**/src/**/*.test.ts',
  ],
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'json-summary'],
  coveragePathIgnorePatterns: ['/node_modules/', '/mocks/', '/test/'],
  coverageThreshold: {
    global: {
      branches: 66.21,
      functions: 82.42,
      lines: 83.46,
      statements: 83.5,
    },
  },
  silent: true,
  testTimeout: 5000,
  projects: [
    {
      displayName: 'runner: electron',
      preset: 'ts-jest',
      runner: '@jest-runner/electron',
      // Note that this environment does not support fake timers.
      testEnvironment: '@jest-runner/electron/environment',
      testMatch: [
        '<rootDir>/src/snaps/**/*.test.ts',
        '<rootDir>/src/services/**/*.test.ts',
      ],
    },
    {
      displayName: 'runner: default',
      preset: 'ts-jest',
      testPathIgnorePatterns: [
        '<rootDir>/src/snaps/*',
        '<rootDir>/src/services/*',
      ],
      testRegex: ['\\.test\\.(ts|js)$'],
    },
  ],
};
