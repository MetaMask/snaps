import yargs from 'yargs';
import builders from '../../builders';
import { logError } from '../../utils';
import { YargsArgs } from '../../types/yargs';
import { manifest } from './manifestHandler';

export = {
  command: ['manifest', 'm'],
  desc: 'Validate project package.json as a Snap manifest',
  builder: (yarg: yargs.Argv) => {
    yarg
      .option('dist', builders.dist)
      .option('port', builders.port)
      .option('populate', builders.populate);
  },
  handler: async (argv: YargsArgs) => {
    try {
      await manifest(argv);
    } catch (err) {
      logError(err.message, err);
      process.exit(1);
    }
  },
};
