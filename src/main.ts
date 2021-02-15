#!/usr/bin/env node
import { cli } from './cli';
import commands from './cmds';

global.snaps = {
  verboseErrors: false,
  suppressWarnings: false,
  isWatching: false,
};

main();

// application
function main(): void {
  cli(process.argv, commands);
}
