/**
 * An object describing the WebSocket message to send.
 *
 * @property id - The ID of the WebSocket connection to send a message to.
 * @property message - The message to send.
 */
export type SendWebSocketMessageParams = {
  id: string;
  message: string | number[];
};

/**
 * This method does not return any data, so the result is always `null`.
 */
export type SendWebSocketMessageResult = null;
