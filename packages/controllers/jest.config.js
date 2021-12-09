module.exports = {
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  coveragePathIgnorePatterns: ['/node_modules/', '/mocks/'],
  coverageThreshold: {
    global: {
      branches: 64,
      functions: 75,
      lines: 73,
      statements: 73,
    },
    './src/permissions': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
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
