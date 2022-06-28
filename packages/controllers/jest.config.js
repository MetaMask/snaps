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
      branches: 67.37,
      functions: 83.67,
      lines: 84.6,
      statements: 84.63,
    },
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
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
  silent: true,
  testTimeout: 5000,
};
