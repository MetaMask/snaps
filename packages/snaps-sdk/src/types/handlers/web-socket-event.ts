/**
 * The WebSocket open event.
 *
 * @property type - Always "open".
 * @property id - The unique identifier for the WebSocket connection.
 * @property origin - The origin of the WebSocket connection.
 */
export type WebSocketOpenEvent = {
  type: 'open';
  id: string;
  origin: string;
};

/**
 * The WebSocket close event.
 *
 * @property type - Always "close".
 * @property id - The unique identifier for the WebSocket connection.
 * @property origin - The origin of the WebSocket connection.
 * @property code - The close code sent by the WebSocket server.
 * @property reason - The string indicating the reason for the connection being closed.
 * @property wasClean - A boolean value that indicates whether the connection was closed without errors.
 */
export type WebSocketCloseEvent = {
  type: 'close';
  id: string;
  origin: string;
  code: number;
  reason: string | null;
  wasClean: boolean | null;
};

/**
 * The WebSocket text message data.
 *
 * @property type - Always "text".
 * @property message - A string containing the message.
 */
export type WebSocketTextMessage = {
  type: 'text';
  message: string;
};

/**
 * The WebSocket binary message data.
 *
 * @property type - Always "binary".
 * @property message - An array of bytes containing the message.
 */
export type WebSocketBinaryMessage = {
  type: 'binary';
  message: number[];
};

export type WebSocketMessageData =
  | WebSocketTextMessage
  | WebSocketBinaryMessage;

/**
 * The WebSocket message event.
 *
 * @property type - Always "message".
 * @property id - The unique identifier for the WebSocket connection.
 * @property origin - The origin of the WebSocket connection.
 * @property data - The message data.
 */
export type WebSocketMessage = {
  type: 'message';
  id: string;
  origin: string;
  data: WebSocketMessageData;
};

export type WebSocketEvent =
  | WebSocketMessage
  | WebSocketOpenEvent
  | WebSocketCloseEvent;

/**
 * The `onWebSocketEvent` handler, which is called when a Snap receives a WebSocket
 * event from the client.
 *
 * @param args - The request arguments.
 * @param args.event - The WebSocket event.
 * @returns Nothing.
 */
export type OnWebSocketEventHandler = (args: {
  event: WebSocketEvent;
}) => Promise<void>;
