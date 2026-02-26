import type { Json } from '@metamask/utils';

import type { InvokeSnapParams } from './invoke-snap';

/**
 * An object containing the parameters for the `wallet_invokeKeyring` method.
 *
 * @property snapId - The ID of the snap to invoke.
 * @property request - The JSON-RPC request to send to the Snap.
 */
export type InvokeKeyringParams = InvokeSnapParams;

/**
 * The result returned by the Snap. The structure of this result will depend on
 * the specific method that was called on the Snap, and is not defined by the
 * API.
 */
export type InvokeKeyringResult = Json;
