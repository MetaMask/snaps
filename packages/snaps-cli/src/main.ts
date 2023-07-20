#!/usr/bin/env node

import { logError } from '@metamask/snaps-utils';

import { cli } from './cli';
import commands from './commands';

cli(process.argv, commands).catch((error) => {
  logError(error);
  process.exitCode = 1;
});
