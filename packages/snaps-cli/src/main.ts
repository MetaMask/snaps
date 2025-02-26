#!/usr/bin/env node

import { logError } from '@metamask/snaps-utils';

import { cli } from './cli';
import commands from './commands';

/*
 * Disable the following error, we target an old version
 * of a browser, and this error is not useful to our users.
 *
 * Browserslist: caniuse-lite is outdated. Please run:
 *  npx update-browserslist-db@latest
 *  Why you should do it regularly: https://github.com/browserslist/update-db#readme
 */
process.env.BROWSERSLIST_IGNORE_OLD_DATA = '1';

cli(process.argv, commands).catch((error) => {
  logError(error);
  process.exitCode = 1;
});
