import type { Json } from '@metamask/utils';

import type { InvokeSnapParams } from './invoke-snap';

/**
 * The request parameters for the `wallet_invokeProtocolSnap` method.
 *
 * @property snapId - The ID of the snap to invoke.
 * @property request - The JSON-RPC request to send to the snap.
 * @property type - The type of handler to invoke.
 */
export type InvokeProtocolSnapParams = InvokeSnapParams;

/**
 * The result returned by the `wallet_invokeProtocolSnap` method, which is the result
 * returned by the Snap.
 */
export type InvokeProtocolSnapResult = Json;
