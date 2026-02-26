/**
 * This method does not accept any parameters.
 */
export type GetWebSocketsParams = never;

/**
 * An array of connected WebSockets for the Snap.
 */
export type GetWebSocketsResult = {
  /**
   * The unique identifier of the WebSocket connection.
   */
  id: string;

  /**
   * The URL of the WebSocket connection.
   */
  url: string;

  /**
   * An array of subprotocols used in the WebSocket connection (if any).
   */
  protocols: string[];
}[];
