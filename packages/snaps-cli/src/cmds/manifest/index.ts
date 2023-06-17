import type yargs from 'yargs';

import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';
import { logError } from '../../utils';
import { manifest } from './manifest';

const command = {
  command: ['manifest', 'm'],
  desc: 'Validate the snap.manifest.json file',
  builder: (yarg: yargs.Argv) => {
    yarg.option('writeManifest', { ...builders.writeManifest, alias: ['fix'] });
  },
  handler: async (argv: YargsArgs) => {
    try {
      await manifest(argv);
    } catch (error) {
      logError(error.message, error);
      throw error;
    }
  },
};

export default command;
