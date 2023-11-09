import type { Json } from '@metamask/utils';

import type { InvokeSnapParams } from './invoke-snap';

/**
 * The request parameters for the `wallet_invokeKeyring` method.
 *
 * @property snapId - The ID of the snap to invoke.
 * @property request - The JSON-RPC request to send to the snap.
 */
export type InvokeKeyringParams = InvokeSnapParams;

/**
 * The result returned by the `wallet_invokeKeyring` method, which is the result
 * returned by the Snap.
 */
export type InvokeKeyringResult = Json;
