#!/usr/bin/env node
// eslint-disable-next-line node/shebang
import { cli } from './cli';
import { applyConfig } from './utils';
import commands from './cmds';

global.snaps = {
  verboseErrors: false,
  suppressWarnings: false,
  isWatching: false,
};

main();

// application
async function main(): Promise<void> {
  await applyConfig();
  cli(commands);
}
