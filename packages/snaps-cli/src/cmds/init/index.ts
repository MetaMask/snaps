import { logInfo } from '@metamask/snaps-utils';
import yargs from 'yargs';

import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { build } from '../build/buildHandler';
import { initHandler } from './initHandler';

export = {
  command: ['init [directory]', 'i [directory]'],
  desc: 'Initialize Snap package',
  builder: (yarg: yargs.Argv) => {
    yarg.positional('directory', builders.directory);
  },
  handler: async (argv: YargsArgs) => init(argv),
};

/**
 * The main entrypoint for the init command. This calls the init handler to
 * initialize the snap package, builds the snap, and then updates the manifest
 * with the shasum of the built snap.
 *
 * @param argv - The Yargs arguments object.
 */
async function init(argv: YargsArgs): Promise<void> {
  const newArgs = await initHandler(argv);

  process.chdir(newArgs.snapLocation);

  await build({
    ...newArgs,
    manifest: false,
    eval: true,
  });

  logInfo('\nSnap project successfully initiated!');
}
