export type WebSocketOpenEvent = {
  type: 'open';
  id: string;
  origin: string;
};

export type WebSocketCloseEvent = {
  type: 'close';
  id: string;
  origin: string;
  code: number;
  reason: string;
  wasClean: boolean;
};

export type WebSocketTextMessage = {
  type: 'text';
  message: string;
};
export type WebSocketBinaryMessage = {
  type: 'binary';
  message: number[];
};

export type WebSocketMessageData =
  | WebSocketTextMessage
  | WebSocketBinaryMessage;

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
