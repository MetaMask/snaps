#!/usr/bin/env node

import { cli } from './cli';
import commands from './cmds';
import { logError } from './utils';

global.snaps = {
  verboseErrors: false,
  suppressWarnings: false,
  isWatching: false,
};

cli(process.argv, commands).catch((error) => {
  logError(error);
  process.exit(1);
});
