import { logError } from '@metamask/snaps-utils';

import { main } from './cli';

main().catch((error) => {
  logError(error);
  process.exitCode = 1;
});
