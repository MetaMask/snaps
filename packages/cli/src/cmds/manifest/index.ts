import yargs from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { logError } from '../../utils';
import { manifestHandler } from './manifestHandler';

export = {
  command: ['manifest', 'm'],
  desc: 'Validate the snap.manifest.json file',
  builder: (yarg: yargs.Argv) => {
    yarg.option('writeManifest', { ...builders.writeManifest, alias: ['fix'] });
  },
  handler: async (argv: YargsArgs) => {
    try {
      await manifestHandler(argv);
    } catch (err) {
      logError(err.message, err);
      throw err;
    }
  },
};
