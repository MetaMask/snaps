// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../../../../../node_modules/ses/types.d.ts" />

import { logError } from '@metamask/snaps-utils';
import { ethErrors, serializeError } from 'eth-rpc-errors';

/**
 * Execute SES lockdown in the current context, i.e., the current iframe.
 *
 * @throws If the SES lockdown failed.
 */
export function executeLockdown() {
  try {
    lockdown({
      consoleTaming: 'unsafe',
      errorTaming: 'unsafe',
      mathTaming: 'unsafe',
      dateTaming: 'unsafe',
      overrideTaming: 'severe',
    });
  } catch (error) {
    // If the `lockdown` call throws an exception, it should not be able to continue
    logError('Lockdown failed:', error);

    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw serializeError(error, {
      fallbackError: ethErrors.rpc.internal('Lockdown failed.'),
    });
  }
}
