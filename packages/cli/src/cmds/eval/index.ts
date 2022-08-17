import yargs from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { evalHandler } from './evalHandler';

export = {
  command: ['eval', 'e'],
  desc: 'Attempt to evaluate Snap bundle in SES',
  builder: (yarg: yargs.Argv) => {
    yarg.option('bundle', builders.bundle);
  },
  handler: (argv: YargsArgs) => evalHandler(argv),
};
