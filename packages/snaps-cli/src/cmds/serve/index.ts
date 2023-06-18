import type yargs from 'yargs';

import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';
import { serve } from './serve';

const command = {
  command: ['serve', 's'],
  desc: 'Locally serve Snap file(s) for testing',
  builder: (yarg: yargs.Argv) => {
    yarg.option('root', builders.root).option('port', builders.port);
  },
  handler: async (argv: YargsArgs) => serve(argv.context.config),
};

export default command;
