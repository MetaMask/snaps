import { Options, PositionalOptions } from 'yargs';

export type SnapsCliBuilders = {
  readonly verboseErrors: Readonly<Options>;
  readonly directory: Readonly<PositionalOptions>;
};

const builders: SnapsCliBuilders = {
  verboseErrors: {
    type: 'boolean',
    describe: 'Display original errors',
    demandOption: false,
    default: true,
  },

  directory: {
    describe: 'the directory to use',
    type: 'string',
  },
};

export default builders;
