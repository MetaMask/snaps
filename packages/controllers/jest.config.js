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
      branches: 72.31,
      functions: 86.32,
      lines: 85.23,
      statements: 85.31,
    },
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  projects: [
    {
      preset: 'ts-jest',
      testMatch: ['<rootDir>/src/services/iframe/*.test.ts'],
      testEnvironment: 'jsdom',
      testEnvironmentOptions: {
        resources: 'usable',
        runScripts: 'dangerously',
      },
    },
    {
      preset: 'ts-jest',
      testPathIgnorePatterns: ['<rootDir>/src/services/iframe/*'],
      testEnvironment: 'jsdom',
      testRegex: ['\\.test\\.(ts|js)$'],
    },
  ],
  silent: true,
  testTimeout: 5000,
};
