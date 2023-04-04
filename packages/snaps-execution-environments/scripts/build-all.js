/* eslint-disable no-console, node/global-require, node/no-process-exit */
const concurrently = require('concurrently');
const yargs = require('yargs');

const { ENTRY_POINTS } = require('./constants');

/**
 * Builds all snaps execution environments using Browserify and LavaMoat concurrently.
 *
 */
async function main() {
  const {
    argv: { writeAutoPolicy },
  } = yargs(process.argv.slice(2)).usage(
    '$0 [options]',
    'Build snaps execution environments',
    (yargsInstance) =>
      yargsInstance.option('writeAutoPolicy', {
        alias: ['p'],
        default: false,
        demandOption: false,
        description: 'Whether to regenerate the LavaMoat policy or not',
        type: 'boolean',
      }),
  );

  await concurrently(
    Object.keys(ENTRY_POINTS).map((type) => ({
      command: `yarn build:lavamoat:single`,
      env: {
        BUILD_TYPE: type,
        WRITE_AUTO_POLICY: writeAutoPolicy || undefined,
      },
    })),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
