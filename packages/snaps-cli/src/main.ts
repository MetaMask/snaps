import { cli } from './cli';
import commands from './cmds';

global.snaps = {
  verboseErrors: false,
  suppressWarnings: false,
  isWatching: false,
};

cli(process.argv, commands);
