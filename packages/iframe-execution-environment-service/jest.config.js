module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.ts'],
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 67.86,
      functions: 92.31,
      lines: 86.67,
      statements: 86.67,
    },
  },
  silent: true,
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    resources: 'usable',
    runScripts: 'dangerously',
  },
  testPathIgnorePatterns: [],
  testRegex: ['\\.test\\.ts$'],
  testTimeout: 5000,
};
