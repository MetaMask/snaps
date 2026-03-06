/**
 * An object describing the WebSocket message to send.
 */
export type SendWebSocketMessageParams = {
  /**
   * The ID of the WebSocket connection to send a message to.
   */
  id: string;

  /**
   * The message to send. This can be either a string or an array of numbers
   * representing binary data.
   */
  message: string | number[];
};

/**
 * This method does not return any data, so the result is always `null`.
 */
export type SendWebSocketMessageResult = null;
