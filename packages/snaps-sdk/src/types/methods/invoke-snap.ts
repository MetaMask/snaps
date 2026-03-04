import type { Json } from '@metamask/utils';

/**
 * The request to send to the Snap.
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
 * The result returned by the Snap. The structure of this result will depend on
 * the specific method that was called on the Snap, and is not defined by the
 * API.
 */
export type InvokeSnapResult = Json;
