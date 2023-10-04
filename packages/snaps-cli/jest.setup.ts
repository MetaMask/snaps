// Node.js v20 changes the behaviour of `process.exit`, which causes the actual
// test process to exit with a non-zero exit code. To avoid CI failures, we
// reset the exit code before and after each test.
beforeEach(() => {
  process.exitCode = 0;
});

afterEach(() => {
  process.exitCode = 0;
});
