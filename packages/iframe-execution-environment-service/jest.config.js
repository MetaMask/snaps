module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  preset: 'ts-jest',
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
