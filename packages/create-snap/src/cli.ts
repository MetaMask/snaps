import { assert } from '@metamask/utils';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { create } from './create.js';

/**
 *
 */
export function main() {
  const argv = yargs(hideBin(process.argv))
    .usage('$0 [snap-name] [options]')
    .help()
    .alias('help', 'h')
    .version()
    .alias('version', 'v')
    .parseSync();

  const snapName = argv._[0];
  assert(snapName, 'Snap name is required.');

  console.log(`Creating Snap with name: ${snapName}`);
  create();
}
