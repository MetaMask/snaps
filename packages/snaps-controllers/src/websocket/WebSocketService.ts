import type { RestrictedMessenger } from '@metamask/base-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  GetWebSocketsResult,
  SnapId,
  WebSocketEvent,
} from '@metamask/snaps-sdk';
import { HandlerType, isEqual, logError } from '@metamask/snaps-utils';
import { assert, createDeferredPromise } from '@metamask/utils';
import { nanoid } from 'nanoid';

import type {
  HandleSnapRequest,
  SnapInstalled,
  SnapUninstalled,
  SnapUpdated,
} from '../snaps';
import { METAMASK_ORIGIN } from '../snaps';

const serviceName = 'WebSocketService';

export type WebSocketServiceOpenAction = {
  type: `${typeof serviceName}:open`;
  handler: (
    snapId: SnapId,
    url: string,
    protocols?: string[],
  ) => Promise<string>;
};

export type WebSocketServiceCloseAction = {
  type: `${typeof serviceName}:close`;
  handler: (snapId: SnapId, id: string) => void;
};

export type WebSocketServiceSendMessageAction = {
  type: `${typeof serviceName}:sendMessage`;
  handler: (
    snapId: SnapId,
    id: string,
    data: string | number[],
  ) => Promise<void>;
};

export type WebSocketServiceGetAllAction = {
  type: `${typeof serviceName}:getAll`;
  handler: (snapId: SnapId) => GetWebSocketsResult;
};

export type WebSocketServiceActions =
  | WebSocketServiceOpenAction
  | WebSocketServiceCloseAction
  | WebSocketServiceSendMessageAction
  | WebSocketServiceGetAllAction;

export type WebSocketServiceAllowedActions = HandleSnapRequest;

export type WebSocketServiceEvents =
  | SnapUninstalled
  | SnapUpdated
  | SnapInstalled;

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
  protocols?: string[];
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
      async (...args) => this.#open(...args),
    );

    this.#messenger.registerActionHandler(`${serviceName}:close`, (...args) =>
      this.#close(...args),
    );

    this.#messenger.registerActionHandler(
      `${serviceName}:sendMessage`,
      async (...args) => this.#sendMessage(...args),
    );

    this.#messenger.registerActionHandler(`${serviceName}:getAll`, (...args) =>
      this.#getAll(...args),
    );

    this.#messenger.subscribe('SnapController:snapUpdated', (snap) => {
      this.#closeAll(snap.id);
    });

    this.#messenger.subscribe('SnapController:snapUninstalled', (snap) => {
      this.#closeAll(snap.id);
    });

    // Due to local Snaps not currently emitting snapUinstalled we also have to
    // listen to snapInstalled.
    this.#messenger.subscribe('SnapController:snapInstalled', (snap) => {
      this.#closeAll(snap.id);
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

  #exists(snapId: SnapId, url: string, protocols?: string[]) {
    return this.#getAll(snapId).some(
      (socket) =>
        socket.url === url && isEqual(socket.protocols ?? [], protocols ?? []),
    );
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

  async #open(snapId: SnapId, url: string, protocols?: string[]) {
    assert(
      !this.#exists(snapId, url, protocols),
      `An open WebSocket connection to ${url} already exists.`,
    );

    const parsedUrl = new URL(url);
    const { origin } = parsedUrl;

    const id = nanoid();

    // eslint-disable-next-line no-restricted-globals
    const socket = new WebSocket(url, protocols);

    const { promise, resolve, reject } = createDeferredPromise();

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

    const errorListener = () => {
      reject(
        rpcErrors.resourceUnavailable(
          'An error occurred while opening the WebSocket.',
        ),
      );
    };

    socket.addEventListener('error', errorListener);

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
      protocols,
      socket,
      openPromise: promise,
    });

    await promise;

    socket.removeEventListener('error', errorListener);

    return id;
  }

  #close(snapId: SnapId, id: string) {
    const { socket } = this.#get(snapId, id);

    socket.close();

    this.#sockets.delete(id);
  }

  #closeAll(snapId: SnapId) {
    for (const socket of this.#getAll(snapId)) {
      this.#close(snapId, socket.id);
    }
  }

  async #sendMessage(snapId: SnapId, id: string, data: string | number[]) {
    const { socket, openPromise } = this.#get(snapId, id);

    await openPromise;

    const wrappedData = Array.isArray(data) ? new Uint8Array(data) : data;

    socket.send(wrappedData);
  }

  #getAll(snapId: SnapId) {
    return [...this.#sockets.values()]
      .filter((socket) => socket.snapId === snapId)
      .map((socket) => ({
        id: socket.id,
        url: socket.url,
        ...(socket.protocols ? { protocols: socket.protocols } : {}),
      }));
  }
}
