module.exports = {
  testEnvironmentOptions: {
    resources: 'usable',
    runScripts: 'dangerously',
  },
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  testPathIgnorePatterns: [],
  testRegex: ['\\.test\\.ts$'],
  testTimeout: 5000,
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
    },
  },
};
