import type { RestrictedMessenger } from '@metamask/base-controller';
import type { SnapId } from '@metamask/snaps-sdk';
import { HandlerType, logError } from '@metamask/snaps-utils';
import { assert, createDeferredPromise } from '@metamask/utils';
import { nanoid } from 'nanoid';

import type { HandleSnapRequest } from '../snaps';
import { METAMASK_ORIGIN } from '../snaps';

const serviceName = 'WebSocketService';

export type OpenWebSocket = {
  type: `${typeof serviceName}:open`;
  handler: WebSocketService['open'];
};

export type CloseWebSocket = {
  type: `${typeof serviceName}:close`;
  handler: WebSocketService['close'];
};

export type SendWebSocketMessage = {
  type: `${typeof serviceName}:sendMessage`;
  handler: WebSocketService['sendMessage'];
};

export type GetAll = {
  type: `${typeof serviceName}:getAll`;
  handler: WebSocketService['getAll'];
};

export type WebSocketServiceActions =
  | OpenWebSocket
  | CloseWebSocket
  | SendWebSocketMessage
  | GetAll;

export type WebSocketServiceAllowedActions = HandleSnapRequest;

export type WebSocketServiceEvents = never;

export type WebSocketServiceMessenger = RestrictedMessenger<
  'WebSocketService',
  WebSocketServiceActions | WebSocketServiceAllowedActions,
  WebSocketServiceEvents,
  WebSocketServiceAllowedActions['type'],
  WebSocketServiceEvents['type']
>;

type WebSocketServiceArgs = {
  messenger: WebSocketServiceMessenger;
};

type InternalSocket = {
  id: string;
  snapId: SnapId;
  url: string;
  // eslint-disable-next-line no-restricted-globals
  socket: WebSocket;
};

export class WebSocketService {
  readonly #messenger: WebSocketServiceMessenger;

  readonly #sockets: Map<string, InternalSocket>;

  constructor({ messenger }: WebSocketServiceArgs) {
    this.#messenger = messenger;
    this.#sockets = new Map();

    this.#messenger.registerActionHandler(
      `${serviceName}:open`,
      this.open.bind(this),
    );

    this.#messenger.registerActionHandler(
      `${serviceName}:close`,
      this.close.bind(this),
    );

    this.#messenger.registerActionHandler(
      `${serviceName}:sendMessage`,
      this.sendMessage.bind(this),
    );

    this.#messenger.registerActionHandler(
      `${serviceName}:getAll`,
      this.getAll.bind(this),
    );
  }

  #get(snapId: SnapId, id: string) {
    const socket = this.#sockets.get(id);

    assert(
      socket && socket.snapId === snapId,
      `Socket with ID "${id}" not found.`,
    );

    return socket;
  }

  #handleEvent(snapId: SnapId, event: any) {
    this.#messenger
      .call('SnapController:handleRequest', {
        origin: METAMASK_ORIGIN,
        snapId,
        handler: HandlerType.OnRpcRequest,
        request: { method: '', params: { event } },
      })
      .catch((error) => {
        logError(
          `An error occurred while handling a WebSocket message for Snap "${snapId}":`,
          error,
        );
      });
  }

  async open(snapId: SnapId, url: string, protocols?: string[]) {
    const id = nanoid();
    // eslint-disable-next-line no-restricted-globals
    const socket = new WebSocket(url, protocols);

    const { promise, resolve } = createDeferredPromise();

    socket.addEventListener('open', (_event) => {
      resolve();
      this.#handleEvent(snapId, {
        type: 'open',
        id,
        origin: '',
      });
    });

    socket.addEventListener('close', (event) => {
      this.#handleEvent(snapId, {
        type: 'close',
        id,
        origin: '',
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
    });

    socket.addEventListener('error', (_event) => {
      this.#handleEvent(snapId, {
        type: 'error',
        id,
        origin: '',
      });
    });

    socket.addEventListener('message', (event) => {
      this.#handleEvent(snapId, {
        type: 'message',
        id,
        origin: event.origin,
        data: {
          type: event.type,
          data: event.data,
        },
      });
    });

    this.#sockets.set(id, {
      id,
      snapId,
      url,
      socket,
    });

    // TODO: Consider returning immediately and awaiting when sending messages.
    await promise;

    return id;
  }

  close(snapId: SnapId, id: string) {
    const { socket } = this.#get(snapId, id);

    socket.close();
  }

  sendMessage(snapId: SnapId, id: string, data: string | number[]) {
    const { socket } = this.#get(snapId, id);

    const wrappedData = Array.isArray(data) ? new Uint8Array(data) : data;

    socket.send(wrappedData);
  }

  getAll(snapId: SnapId) {
    return [...this.#sockets.values()]
      .filter((socket) => socket.snapId === snapId)
      .map((socket) => ({
        id: socket.id,
        url: socket.url,
      }));
  }
}
