/**
 * The request parameters for the `snap_getWebSockets` method.
 *
 * This method does not accept any parameters.
 */
export type GetWebSocketsParams = never;

/**
 * The result returned by the `snap_getWebSockets` method.
 */
export type GetWebSocketsResult = {
  id: string;
  url: string;
  protocols?: string[];
}[];
