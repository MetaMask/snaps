import type { Json } from '@metamask/utils';

/**
 * The request parameters for the `wallet_invokeSnap` method.
 */
export type InvokeSnapParams = {
  /**
   * The ID of the Snap to invoke.
   */
  snapId: string;

  /**
   * The JSON-RPC request to send to the Snap.
   */
  request: Record<string, Json>;
};

/**
 * The result of the Snap method call.
 */
export type InvokeSnapResult = Json;
