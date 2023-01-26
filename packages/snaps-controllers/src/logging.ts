import { snapsLogger } from '@metamask/snaps-utils';
import { createModuleLogger } from '@metamask/utils';

/**
 * A logging function specific to this package. The log messages don't show up
 * by default, but they can be enabled by setting the environment variable:
 * - `DEBUG=metamask:snaps:snaps-controllers`, or
 * - `DEBUG=metamask:snaps:*` to enable all logs from `@metamask/snaps-*`.
 */
export const log = createModuleLogger(snapsLogger, 'snaps-controllers');
