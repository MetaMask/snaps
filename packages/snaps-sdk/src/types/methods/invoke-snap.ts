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
 * The result of the Snap method call.
 */
export type InvokeSnapResult = Json;
