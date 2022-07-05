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
      branches: 67.92,
      functions: 84.07,
      lines: 84.43,
      statements: 84.47,
    },
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  preset: 'ts-jest',
  testRegex: ['\\.test\\.(ts|js)$'],
  testEnvironmentOptions: { resources: 'usable', runScripts: 'dangerously' },
  silent: true,
  testTimeout: 5000,
};
