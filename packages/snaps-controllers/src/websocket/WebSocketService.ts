import type { Messenger } from '@metamask/messenger';
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

export type WebSocketServiceMessenger = Messenger<
  'WebSocketService',
  WebSocketServiceActions | WebSocketServiceAllowedActions,
  WebSocketServiceEvents
>;

type WebSocketServiceArgs = {
  messenger: WebSocketServiceMessenger;
};

type InternalSocket = {
  id: string;
  snapId: SnapId;
  url: string;
  protocols: string[];
  openPromise: Promise<void>;
  // eslint-disable-next-line no-restricted-globals
  socket: WebSocket;
};

export class WebSocketService {
  name: typeof serviceName = serviceName;

  state = null;

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

    // Due to local Snaps not currently emitting snapUninstalled we also have to
    // listen to snapInstalled.
    this.#messenger.subscribe('SnapController:snapInstalled', (snap) => {
      this.#closeAll(snap.id);
    });
  }

  /**
   * Get information about a given WebSocket connection with an ID.
   *
   * @param snapId - The Snap ID.
   * @param id - The identifier for the WebSocket connection.
   * @returns Information about the WebSocket connection.
   * @throws If the WebSocket connection cannot be found.
   */
  #get(snapId: SnapId, id: string) {
    const socket = this.#sockets.get(id);

    assert(
      socket && socket.snapId === snapId,
      `Socket with ID "${id}" not found.`,
    );

    return socket;
  }

  /**
   * Check whether a given Snap ID already has an open connection for a URL and protocol.
   *
   * @param snapId - The Snap ID.
   * @param url - The URL.
   * @param protocols - A protocols parameter.
   * @returns True if a matching connection already exists, otherwise false.
   */
  #exists(snapId: SnapId, url: string, protocols: string[]) {
    return this.#getAll(snapId).some(
      (socket) => socket.url === url && isEqual(socket.protocols, protocols),
    );
  }

  /**
   * Handle sending a specific WebSocketEvent to a Snap.
   *
   * @param snapId - The Snap ID.
   * @param event - The WebSocketEvent.
   */
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

  /**
   * Open a WebSocket connection.
   *
   * @param snapId - The Snap ID.
   * @param url - The URL for the WebSocket connection.
   * @param protocols - An optional parameter for protocols.
   * @returns The identifier for the opened connection.
   * @throws If the connection fails.
   */
  async #open(snapId: SnapId, url: string, protocols: string[] = []) {
    assert(
      !this.#exists(snapId, url, protocols),
      `An open WebSocket connection to ${url} already exists.`,
    );

    const parsedUrl = new URL(url);
    const { origin } = parsedUrl;

    const id = nanoid();

    // eslint-disable-next-line no-restricted-globals
    const socket = new WebSocket(url, protocols);
    socket.binaryType = 'arraybuffer';

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
      this.#sockets.delete(id);

      this.#handleEvent(snapId, {
        type: 'close',
        id,
        origin,
        code: event.code,
        reason: event.reason,
        // wasClean is not available on mobile.
        wasClean: event.wasClean ?? null,
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

    socket.addEventListener('message', (event) => {
      const isText = typeof event.data === 'string';
      const data = isText
        ? { type: 'text' as const, message: event.data }
        : {
            type: 'binary' as const,
            // We request that the WebSocket gives us an array buffer.
            message: Array.from(new Uint8Array(event.data)),
          };

      this.#handleEvent(snapId, {
        type: 'message',
        id,
        origin,
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

  /**
   * Close a given WebSocket connection.
   *
   * @param snapId - The Snap ID.
   * @param id - The identifier for the WebSocket connection.
   */
  #close(snapId: SnapId, id: string) {
    const { socket } = this.#get(snapId, id);

    socket.close();
  }

  /**
   * Close all open connections for a given Snap ID.
   *
   * @param snapId - The Snap ID.
   */
  #closeAll(snapId: SnapId) {
    for (const socket of this.#getAll(snapId)) {
      this.#close(snapId, socket.id);
    }
  }

  /**
   * Send a message from a given Snap ID to a WebSocket connection.
   *
   * @param snapId - The Snap ID.
   * @param id - The identifier for the WebSocket connection.
   * @param data - The message to send.
   */
  async #sendMessage(snapId: SnapId, id: string, data: string | number[]) {
    const { socket, openPromise } = this.#get(snapId, id);

    await openPromise;

    const wrappedData = Array.isArray(data) ? new Uint8Array(data) : data;

    socket.send(wrappedData);
  }

  /**
   * Get a list of all open WebSocket connections for a Snap ID.
   *
   * @param snapId - The Snap ID.
   * @returns A list of WebSocket connections.
   */
  #getAll(snapId: SnapId) {
    return [...this.#sockets.values()]
      .filter((socket) => socket.snapId === snapId)
      .map((socket) => ({
        id: socket.id,
        url: socket.url,
        protocols: socket.protocols,
      }));
  }
}
