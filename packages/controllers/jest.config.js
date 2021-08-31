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
  testTimeout: 2500,
  projects: [
    {
      displayName: 'runner: electron',
      testMatch: [
        '<rootDir>/src/plugins/**/*.test.ts',
        '<rootDir>/src/services/**/*.test.ts',
      ],
      preset: 'ts-jest',
      runner: '@jest-runner/electron',
      testEnvironment: '@jest-runner/electron/environment',
    },
    {
      displayName: 'runner: default',
      testPathIgnorePatterns: [
        '<rootDir>/src/plugins/*',
        '<rootDir>/src/services/*',
      ],
      preset: 'ts-jest',
    },
  ],
};
