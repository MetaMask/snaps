import type { Json } from '@metamask/utils';

/**
 * The request parameters for the `wallet_invokeSnap` method.
 *
 * @property snapId - The ID of the Snap to invoke.
 * @property request - The JSON-RPC request to send to the Snap.
 */
export type InvokeSnapParams = {
  snapId: string;
  request: Record<string, Json>;
};

/**
 * The result returned by the `wallet_invokeSnap` method, which is the result
 * returned by the Snap.
 */
export type InvokeSnapResult = Json;
