#!/usr/bin/env node
import { cli } from './cli';
import commands from './commands';
import { logError } from './utils';

cli(process.argv, commands).catch((error) => {
  logError(error);
  process.exitCode = 1;
});
