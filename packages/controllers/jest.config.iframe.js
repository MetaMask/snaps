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
  testEnvironmentOptions: {
    resources: 'usable',
    runScripts: 'dangerously',
  },
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest-setup.js'],
  testPathIgnorePatterns: [
    'src/services/WebWorkerExecutionEnvironmentService.test.ts',
    'src/plugins/PluginController.test.ts',
  ],
  testRegex: ['\\.test\\.ts$'],
  testTimeout: 5000,
};
