import { logInfo } from '@metamask/snaps-utils';
import yargs from 'yargs';

import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { initHandler } from './initHandler';

const initCommand = {
  command: ['$0 [directory]'],
  desc: 'Initialize MetaMask Snaps project',
  builder: (yarg: yargs.Argv) => {
    yarg.positional('directory', builders.directory);
    return yarg;
  },
  handler: init,
};

export default initCommand;

/**
 * The main entrypoint for the init command. This calls the init handler to
 * initialize the snap package, builds the snap, and then updates the manifest
 * with the shasum of the built snap.
 *
 * @param argv - The Yargs arguments object.
 */
async function init(argv: YargsArgs): Promise<void> {
  await initHandler(argv);
  logInfo('\nSnap project successfully initiated!');
}
