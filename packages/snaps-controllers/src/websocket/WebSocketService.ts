import type { RestrictedMessenger } from '@metamask/base-controller';
import type { SnapId, WebSocketEvent } from '@metamask/snaps-sdk';
import { HandlerType, logError } from '@metamask/snaps-utils';
import { assert, createDeferredPromise } from '@metamask/utils';
import { nanoid } from 'nanoid';

import type { HandleSnapRequest, SnapUninstalled, SnapUpdated } from '../snaps';
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

export type WebSocketServiceEvents = SnapUninstalled | SnapUpdated;

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
  openPromise: Promise<void>;
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

    this.#messenger.subscribe('SnapController:snapUpdated', (snap) => {
      this.closeAll(snap.id);
    });

    this.#messenger.subscribe('SnapController:snapUninstalled', (snap) => {
      this.closeAll(snap.id);
    });
  }

  #get(snapId: SnapId, id: string) {
    const socket = this.#sockets.get(id);

    assert(
      socket && socket.snapId === snapId,
      `Socket with ID "${id}" not found.`,
    );

    return socket;
  }

  #exists(snapId: SnapId, url: string) {
    return this.getAll(snapId).some((socket) => socket.url === url);
  }

  #handleEvent(snapId: SnapId, event: WebSocketEvent) {
    this.#messenger
      .call('SnapController:handleRequest', {
        origin: METAMASK_ORIGIN,
        snapId,
        handler: HandlerType.OnWebSocketEvent,
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
    assert(
      !this.#exists(snapId, url),
      `An open WebSocket connection to ${url} already exists.`,
    );

    const parsedUrl = new URL(url);
    const { origin } = parsedUrl;

    const id = nanoid();

    // eslint-disable-next-line no-restricted-globals
    const socket = new WebSocket(url, protocols);

    const { promise, resolve } = createDeferredPromise();

    socket.addEventListener('open', () => {
      resolve();
      this.#handleEvent(snapId, {
        type: 'open',
        id,
        origin,
      });
    });

    socket.addEventListener('close', (event) => {
      this.#handleEvent(snapId, {
        type: 'close',
        id,
        origin,
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
    });

    socket.addEventListener('error', () => {
      this.#handleEvent(snapId, {
        type: 'error',
        id,
        origin,
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    socket.addEventListener('message', async (event) => {
      const isText = typeof event.data === 'string';
      const data = isText
        ? { type: 'text' as const, message: event.data }
        : {
            type: 'binary' as const,
            // We assume binary data to be sent via Blob for now.
            message: Array.from(new Uint8Array(await event.data.arrayBuffer())),
          };

      this.#handleEvent(snapId, {
        type: 'message',
        id,
        origin: event.origin,
        data,
      });
    });

    this.#sockets.set(id, {
      id,
      snapId,
      url,
      socket,
      openPromise: promise,
    });

    await promise;

    return id;
  }

  close(snapId: SnapId, id: string) {
    const { socket } = this.#get(snapId, id);

    socket.close();

    this.#sockets.delete(id);
  }

  closeAll(snapId: SnapId) {
    for (const socket of this.getAll(snapId)) {
      this.close(snapId, socket.id);
    }
  }

  async sendMessage(snapId: SnapId, id: string, data: string | number[]) {
    const { socket, openPromise } = this.#get(snapId, id);

    await openPromise;

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
