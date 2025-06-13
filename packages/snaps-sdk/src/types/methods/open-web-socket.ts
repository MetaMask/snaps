/**
 * The request parameters for the `snap_openWebSocket` method.
 *
 * @property url - The URL of the WebSocket connection to open.
 * @property protocols - The protocols to use for the WebSocket connection.
 */
export type OpenWebSocketParams = {
  url: string;
  protocols?: string[];
};

/**
 * The result returned by the `snap_openWebSocket` method.
 */
export type OpenWebSocketResult = string;
