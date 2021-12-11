module.exports = {
  coverageReporters: ['text', 'html'],
  coveragePathIgnorePatterns: ['/node_modules/', '/mocks/'],
  // TODO: Require coverage when we're closer to home.
  // coverageThreshold: {
  //   global: {
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100,
  //   },
  // },
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
