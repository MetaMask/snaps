import yargs from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { serve } from './serveHandler';

export = {
  command: ['serve', 's'],
  desc: 'Locally serve Snap file(s) for testing',
  builder: (yarg: yargs.Argv) => {
    yarg.option('root', builders.root).option('port', builders.port);
  },
  handler: (argv: YargsArgs) => serve(argv),
};
