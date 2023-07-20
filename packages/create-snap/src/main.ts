#!/usr/bin/env node
import { logError } from '@metamask/snaps-utils';

import { cli } from './cli';

cli(process.argv).catch((error) => {
  logError(error);
  process.exitCode = 1;
});
