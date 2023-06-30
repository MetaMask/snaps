import type yargs from 'yargs';

import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';
import { manifest } from './manifest';

const command = {
  command: ['manifest', 'm'],
  desc: 'Validate the snap.manifest.json file',
  builder: (yarg: yargs.Argv) => {
    // Browserify options. These are merged into the config object.
    yarg.option('writeManifest', builders.writeManifest);

    // Webpack options.
    yarg.option('fix', builders.fix);
  },
  handler: async (argv: YargsArgs) =>
    manifest(argv.context.config, { fix: argv.fix }),
};

export default command;
