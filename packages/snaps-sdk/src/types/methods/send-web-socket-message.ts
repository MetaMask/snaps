/**
 * The request parameters for the `snap_sendWebSocketMessage` method.
 *
 * @property id - The id of the WebSocket connection to send a message to.
 * @property message - The message to send.
 */
export type SendWebSocketMessageParams = {
  id: string;
  message: string | number[];
};

/**
 * The result returned by the `snap_sendWebSocketMessage` method.
 */
export type SendWebSocketMessageResult = null;
