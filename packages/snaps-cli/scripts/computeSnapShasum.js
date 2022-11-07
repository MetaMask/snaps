const { readFileSync } = require('fs');
const { getSnapSourceShasum } = require('@metamask/snap-utils');
const clipboardy = require('clipboardy');
const yargs = require('yargs');

// eslint-disable-next-line no-unused-expressions
yargs(process.argv.slice(2))
  .command('fromFile <filePath>', 'Compute shasum from file', {
    command: ['fromFile'],
    builder: (yarg) => {
      yarg.positional('filePath', {
        describe: 'The path to the Snap source file to compute the shasum from',
        type: 'string',
        normalize: true,
        demandOption: true,
      });
    },
    handler: ({ filePath }) =>
      computeAndLogShasum(readFileSync(filePath, 'utf8')),
  })

  .command('fromString <sourceString>', 'Compute shasum from string', {
    command: ['fromString'],
    builder: (yarg) => {
      yarg.positional('sourceString', {
        describe: 'The Snap source string to compute the shasum from',
        type: 'string',
        demandOption: true,
      });
    },
    handler: ({ sourceString }) => computeAndLogShasum(sourceString),
  })

  .strict()
  .demandCommand(1).argv;

/**
 * Computes a Snap shasum from the given string, copies the result to the
 * system clipboard, and logs it process.stdout.
 *
 * @param {string} sourceString - The string to compute the shasum from.
 */
function computeAndLogShasum(sourceString) {
  const shasum = getSnapSourceShasum(sourceString);
  // eslint-disable-next-line node/no-sync
  clipboardy.writeSync(shasum);
  console.log(shasum);
}
