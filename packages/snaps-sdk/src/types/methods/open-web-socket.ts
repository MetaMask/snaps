/**
 * The request parameters for the `snap_openWebSocket` method.
 *
 * @property url - The `wss://` URL of the WebSocket connection to open.
 * @property protocols - The optional protocols to use for the WebSocket
 * connection.
 */
export type OpenWebSocketParams = {
  url: string;
  protocols?: string[];
};

/**
 * The ID of the opened WebSocket connection, which can be used to reference the
 * connection in subsequent calls to [`snap_sendWebSocketMessage`](https://docs.metamask.io/snaps/reference/snaps-api/snap_sendwebsocketmessage)
 * and [`snap_closeWebSocket`](https://docs.metamask.io/snaps/reference/snaps-api/snap_closewebsocket).
 */
export type OpenWebSocketResult = string;
