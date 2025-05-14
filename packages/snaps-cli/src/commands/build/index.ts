import type yargs from 'yargs';

import { buildHandler } from './build';
import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';

const command = {
  command: ['build', 'b'],
  desc: 'Build snap from source',
  builder: (yarg: yargs.Argv) => {
    yarg.option('analyze', builders.analyze);
  },
  handler: async (argv: YargsArgs) =>
    buildHandler(argv.context.config, argv.analyze),
};

export * from './implementation';
export { steps } from './build';
export default command;
