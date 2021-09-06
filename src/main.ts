#!/usr/bin/env node
import { cli } from './cli';
import { commandModules } from './cmds';

global.snaps = {
  verboseErrors: false,
  suppressWarnings: false,
  isWatching: false,
};

cli(process.argv, commandModules);
