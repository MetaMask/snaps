const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { resolve } = require('path');

const EXECUTION_ENVIRONMENTS_PATH = resolve(
  __dirname,
  '../packages/snaps-execution-environments',
);

const TEST_BUNDLE_PATH = resolve(
  EXECUTION_ENVIRONMENTS_PATH,
  '__test__/iframe-test/bundle.js',
);

/**
 * Create the iframe test bundle if it doesn't already exist.
 */
function createIframeTestBundle() {
  if (existsSync(TEST_BUNDLE_PATH)) {
    return;
  }

  execSync('yarn build:test', {
    cwd: EXECUTION_ENVIRONMENTS_PATH,
    stdio: 'inherit',
  });
}

createIframeTestBundle();
