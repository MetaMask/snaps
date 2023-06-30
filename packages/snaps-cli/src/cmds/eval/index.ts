import yargs from 'yargs';

import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { evalHandler } from './evalHandler';

const command = {
  command: ['eval', 'e'],
  desc: 'Attempt to evaluate Snap bundle in SES',
  builder: (yarg: yargs.Argv) => {
    yarg.option('bundle', builders.bundle);
  },
  handler: async (argv: YargsArgs) => evalHandler(argv),
};

export default command;
