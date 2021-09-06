import yargs from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { snapEval } from './evalHandler';

export = {
  command: ['eval', 'evaluate', 'e'],
  desc: 'Attempt to evaluate Snap bundle in SES',
  builder: (yarg: yargs.Argv) => {
    yarg.option('bundle', builders.bundle);
  },
  handler: (argv: YargsArgs) => snapEval(argv),
};
