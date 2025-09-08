import { HandlerType, isEqual } from '@metamask/snaps-utils';
import {
  getSnapObject,
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import { stringToBytes } from '@metamask/utils';

import { WebSocketService } from './WebSocketService';
import {
  getRestrictedWebSocketServiceMessenger,
  getRootWebSocketServiceMessenger,
} from '../test-utils';

const MOCK_WEBSOCKET_URI = 'wss://metamask.io';
const MOCK_WEBSOCKET_BROKEN_URI = 'wss://broken.metamask.io';

class MockWebSocket {
  readonly #origin: string;

  #closeListener?: EventListener;

  #messageListener?: EventListener;

  constructor(url: string) {
    this.#origin = new URL(url).origin;
  }

  addEventListener(type: string, listener: EventListener) {
    if (type === 'open' && this.#origin === MOCK_WEBSOCKET_URI) {
      listener(new Event('open'));
    } else if (type === 'close') {
      this.#closeListener = listener;
    } else if (type === 'error' && this.#origin === MOCK_WEBSOCKET_BROKEN_URI) {
      setTimeout(() => {
        listener(new Event('error'));
        this.#closeWithCode(1006, '', false);
      }, 1);
    } else if (type === 'message') {
      this.#messageListener = listener;
    }
  }

  removeEventListener() {
    // no-op
  }

  send(data: string | Uint8Array) {
    if (data === 'Ping') {
      this.#messageListener?.(
        new MessageEvent('message', { origin: this.#origin, data: 'Pong' }),
      );
      return;
    }

    if (
      data instanceof Uint8Array &&
      isEqual(Array.from(data), Array.from(stringToBytes('Ping')))
    ) {
      const bytes = stringToBytes('Pong');
      this.#messageListener?.(
        new MessageEvent('message', {
          origin: this.#origin,
          data: bytes.buffer,
        }),
      );
    }
  }

  #closeWithCode(code: number, reason: string, wasClean: boolean) {
    // For some reason CloseEvent is not available during test.
    const event = new Event('close') as any;
    event.code = code;
    event.reason = reason;
    event.wasClean = wasClean;
    this.#closeListener?.(event);
  }

  close() {
    // Mirrors the browser behavior
    this.#closeWithCode(1005, '', true);
  }
}

describe('WebSocketService', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'WebSocket', { value: MockWebSocket });
  });

  it('opens a WebSocket connection and forwards messages to the Snap', async () => {
    const rootMessenger = getRootWebSocketServiceMessenger();
    const messenger = getRestrictedWebSocketServiceMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'SnapController:handleRequest',
      async ({ handler }) => {
        if (handler === HandlerType.OnWebSocketEvent) {
          return null;
        }
        throw new Error('Unmocked request');
      },
    );

    /* eslint-disable-next-line no-new */
    new WebSocketService({ messenger });

    const id = await messenger.call(
      'WebSocketService:open',
      MOCK_SNAP_ID,
      MOCK_WEBSOCKET_URI,
    );

    await messenger.call(
      'WebSocketService:sendMessage',
      MOCK_SNAP_ID,
      id,
      'Ping',
    );

    expect(messenger.call).toHaveBeenNthCalledWith(
      2,
      'SnapController:handleRequest',
      {
        handler: 'onWebSocketEvent',
        origin: 'metamask',
        request: {
          method: '',
          params: {
            event: {
              id,
              origin: MOCK_WEBSOCKET_URI,
              type: 'open',
            },
          },
        },
        snapId: 'npm:@metamask/example-snap',
      },
    );

    expect(messenger.call).toHaveBeenNthCalledWith(
      4,
      'SnapController:handleRequest',
      {
        handler: 'onWebSocketEvent',
        origin: 'metamask',
        request: {
          method: '',
          params: {
            event: {
              id,
              data: {
                message: 'Pong',
                type: 'text',
              },
              origin: MOCK_WEBSOCKET_URI,
              type: 'message',
            },
          },
        },
        snapId: 'npm:@metamask/example-snap',
      },
    );
  });

  it('supports binary messages', async () => {
    const rootMessenger = getRootWebSocketServiceMessenger();
    const messenger = getRestrictedWebSocketServiceMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'SnapController:handleRequest',
      async ({ handler }) => {
        if (handler === HandlerType.OnWebSocketEvent) {
          return null;
        }
        throw new Error('Unmocked request');
      },
    );

    /* eslint-disable-next-line no-new */
    new WebSocketService({ messenger });

    const id = await messenger.call(
      'WebSocketService:open',
      MOCK_SNAP_ID,
      MOCK_WEBSOCKET_URI,
    );

    await messenger.call(
      'WebSocketService:sendMessage',
      MOCK_SNAP_ID,
      id,
      Array.from(stringToBytes('Ping')),
    );

    expect(messenger.call).toHaveBeenNthCalledWith(
      2,
      'SnapController:handleRequest',
      {
        handler: 'onWebSocketEvent',
        origin: 'metamask',
        request: {
          method: '',
          params: {
            event: {
              id,
              origin: MOCK_WEBSOCKET_URI,
              type: 'open',
            },
          },
        },
        snapId: 'npm:@metamask/example-snap',
      },
    );

    expect(messenger.call).toHaveBeenNthCalledWith(
      4,
      'SnapController:handleRequest',
      {
        handler: 'onWebSocketEvent',
        origin: 'metamask',
        request: {
          method: '',
          params: {
            event: {
              id,
              data: {
                message: [80, 111, 110, 103],
                type: 'binary',
              },
              origin: MOCK_WEBSOCKET_URI,
              type: 'message',
            },
          },
        },
        snapId: 'npm:@metamask/example-snap',
      },
    );
  });

  it('throws if the WebSocket connection fails to open', async () => {
    const rootMessenger = getRootWebSocketServiceMessenger();
    const messenger = getRestrictedWebSocketServiceMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'SnapController:handleRequest',
      async ({ handler }) => {
        if (handler === HandlerType.OnWebSocketEvent) {
          return null;
        }
        throw new Error('Unmocked request');
      },
    );

    /* eslint-disable-next-line no-new */
    new WebSocketService({ messenger });

    await expect(
      messenger.call(
        'WebSocketService:open',
        MOCK_SNAP_ID,
        MOCK_WEBSOCKET_BROKEN_URI,
      ),
    ).rejects.toThrow('An error occurred while opening the WebSocket.');

    expect(
      messenger.call('WebSocketService:getAll', MOCK_SNAP_ID),
    ).toHaveLength(0);
  });

  it('logs if the Snap request fails', async () => {
    const spy = jest.spyOn(console, 'error');
    const rootMessenger = getRootWebSocketServiceMessenger();
    const messenger = getRestrictedWebSocketServiceMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'SnapController:handleRequest',
      async () => {
        throw new Error('Invalid WebSocketEvent');
      },
    );

    /* eslint-disable-next-line no-new */
    new WebSocketService({ messenger });

    await messenger.call(
      'WebSocketService:open',
      MOCK_SNAP_ID,
      MOCK_WEBSOCKET_URI,
    );

    expect(spy).toHaveBeenCalledWith(
      'An error occurred while handling a WebSocket message for Snap "npm:@metamask/example-snap":',
      expect.any(Error),
    );
  });

  it('closes an open connection when requested', async () => {
    const rootMessenger = getRootWebSocketServiceMessenger();
    const messenger = getRestrictedWebSocketServiceMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'SnapController:handleRequest',
      async ({ handler }) => {
        if (handler === HandlerType.OnWebSocketEvent) {
          return null;
        }
        throw new Error('Unmocked request');
      },
    );

    /* eslint-disable-next-line no-new */
    new WebSocketService({ messenger });

    const id = await messenger.call(
      'WebSocketService:open',
      MOCK_SNAP_ID,
      MOCK_WEBSOCKET_URI,
    );

    expect(
      messenger.call('WebSocketService:getAll', MOCK_SNAP_ID),
    ).toHaveLength(1);

    messenger.call('WebSocketService:close', MOCK_SNAP_ID, id);

    expect(
      messenger.call('WebSocketService:getAll', MOCK_SNAP_ID),
    ).toHaveLength(0);

    expect(messenger.call).toHaveBeenNthCalledWith(
      5,
      'SnapController:handleRequest',
      {
        handler: 'onWebSocketEvent',
        origin: 'metamask',
        request: {
          method: '',
          params: {
            event: {
              id,
              code: 1005,
              reason: '',
              wasClean: true,
              origin: MOCK_WEBSOCKET_URI,
              type: 'close',
            },
          },
        },
        snapId: 'npm:@metamask/example-snap',
      },
    );
  });

  it('disallows opening multiple WebSocket connections to the same URL', async () => {
    const rootMessenger = getRootWebSocketServiceMessenger();
    const messenger = getRestrictedWebSocketServiceMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'SnapController:handleRequest',
      async ({ handler }) => {
        if (handler === HandlerType.OnWebSocketEvent) {
          return null;
        }
        throw new Error('Unmocked request');
      },
    );

    /* eslint-disable-next-line no-new */
    new WebSocketService({ messenger });

    await messenger.call(
      'WebSocketService:open',
      MOCK_SNAP_ID,
      MOCK_WEBSOCKET_URI,
    );

    await expect(
      messenger.call('WebSocketService:open', MOCK_SNAP_ID, MOCK_WEBSOCKET_URI),
    ).rejects.toThrow(
      'An open WebSocket connection to wss://metamask.io already exists.',
    );
  });

  it('allows opening multiple WebSocket connections to the same URL when using different protocols', async () => {
    const rootMessenger = getRootWebSocketServiceMessenger();
    const messenger = getRestrictedWebSocketServiceMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'SnapController:handleRequest',
      async ({ handler }) => {
        if (handler === HandlerType.OnWebSocketEvent) {
          return null;
        }
        throw new Error('Unmocked request');
      },
    );

    /* eslint-disable-next-line no-new */
    new WebSocketService({ messenger });

    await messenger.call(
      'WebSocketService:open',
      MOCK_SNAP_ID,
      MOCK_WEBSOCKET_URI,
    );

    await messenger.call(
      'WebSocketService:open',
      MOCK_SNAP_ID,
      MOCK_WEBSOCKET_URI,
      ['wamp'],
    );

    expect(
      messenger.call('WebSocketService:getAll', MOCK_SNAP_ID),
    ).toHaveLength(2);
  });

  it('closes open connections when snapInstalled is emitted', async () => {
    const rootMessenger = getRootWebSocketServiceMessenger();
    const messenger = getRestrictedWebSocketServiceMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'SnapController:handleRequest',
      async ({ handler }) => {
        if (handler === HandlerType.OnWebSocketEvent) {
          return null;
        }
        throw new Error('Unmocked request');
      },
    );

    /* eslint-disable-next-line no-new */
    new WebSocketService({ messenger });

    await messenger.call(
      'WebSocketService:open',
      MOCK_SNAP_ID,
      MOCK_WEBSOCKET_URI,
    );

    expect(
      messenger.call('WebSocketService:getAll', MOCK_SNAP_ID),
    ).toHaveLength(1);

    rootMessenger.publish(
      'SnapController:snapInstalled',
      getSnapObject(),
      MOCK_ORIGIN,
      false,
    );

    expect(
      messenger.call('WebSocketService:getAll', MOCK_SNAP_ID),
    ).toHaveLength(0);
  });

  it('closes open connections when snapUpdated is emitted', async () => {
    const rootMessenger = getRootWebSocketServiceMessenger();
    const messenger = getRestrictedWebSocketServiceMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'SnapController:handleRequest',
      async ({ handler }) => {
        if (handler === HandlerType.OnWebSocketEvent) {
          return null;
        }
        throw new Error('Unmocked request');
      },
    );

    /* eslint-disable-next-line no-new */
    new WebSocketService({ messenger });

    await messenger.call(
      'WebSocketService:open',
      MOCK_SNAP_ID,
      MOCK_WEBSOCKET_URI,
    );

    expect(
      messenger.call('WebSocketService:getAll', MOCK_SNAP_ID),
    ).toHaveLength(1);

    rootMessenger.publish(
      'SnapController:snapUpdated',
      getSnapObject(),
      '1.0.0',
      MOCK_ORIGIN,
      false,
    );

    expect(
      messenger.call('WebSocketService:getAll', MOCK_SNAP_ID),
    ).toHaveLength(0);
  });

  it('closes open connections when snapUninstalled is emitted', async () => {
    const rootMessenger = getRootWebSocketServiceMessenger();
    const messenger = getRestrictedWebSocketServiceMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'SnapController:handleRequest',
      async ({ handler }) => {
        if (handler === HandlerType.OnWebSocketEvent) {
          return null;
        }
        throw new Error('Unmocked request');
      },
    );

    /* eslint-disable-next-line no-new */
    new WebSocketService({ messenger });

    await messenger.call(
      'WebSocketService:open',
      MOCK_SNAP_ID,
      MOCK_WEBSOCKET_URI,
    );

    expect(
      messenger.call('WebSocketService:getAll', MOCK_SNAP_ID),
    ).toHaveLength(1);

    rootMessenger.publish('SnapController:snapUninstalled', getSnapObject());

    expect(
      messenger.call('WebSocketService:getAll', MOCK_SNAP_ID),
    ).toHaveLength(0);
  });
});
