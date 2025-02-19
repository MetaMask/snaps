// Node.js v20 changes the behaviour of `process.exit`, which causes the actual
// test process to exit with a non-zero exit code. To avoid CI failures, we
// reset the exit code before and after each test.
// eslint-disable-next-line import-x/unambiguous
beforeEach(() => {
  // eslint-disable-next-line no-restricted-globals
  process.exitCode = 0;
});

afterEach(() => {
  // eslint-disable-next-line no-restricted-globals
  process.exitCode = 0;
});
