/**
 * The request parameters for the `snap_getWebSockets` method.
 *
 * This method does not accept any parameters.
 */
export type GetWebSocketsParams = never;

/**
 * An array of connected WebSockets for the Snap. Each WebSocket is represented
 * by an object containing the following properties:
 *
 * - `id` - The unique identifier of the WebSocket connection.
 * - `url` - The URL of the WebSocket connection.
 * - `protocols` - An array of subprotocols used in the WebSocket connection (if
 * any).
 */
export type GetWebSocketsResult = {
  id: string;
  url: string;
  protocols: string[];
}[];
