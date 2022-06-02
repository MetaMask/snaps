import fetchMock from 'jest-fetch-mock';
import { Server as WebSocketServer } from 'mock-socket';
import network from './network';

describe('Network endowments', () => {
  describe('fetch', () => {
    beforeEach(() => {
      fetchMock.enableMocks();
    });

    afterEach(() => {
      fetchMock.disableMocks();
    });

    it('fetches and reads body', async () => {
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => RESULT);
      const { fetch } = network.factory();
      const result = await (await fetch('foo.com')).text();
      expect(result).toStrictEqual(RESULT);
    });

    it('can be torn down during request', async () => {
      let resolve: ((result: string) => void) | null = null;
      fetchMock.mockOnce(
        () =>
          new Promise<string>((r) => {
            resolve = r;
          }),
      );

      const { fetch, teardownFunction } = network.factory();

      const fetchPromise = fetch('foo.com');
      const teardownPromise = teardownFunction();
      // fetchMock is synchronous, so even if we cancel the request, we still have to return value
      (resolve as any)('FAIL');
      await teardownPromise;
      await expect(fetchPromise).rejects.toThrow('The operation was aborted');
    });

    it('can use AbortController normally', async () => {
      let resolve: ((result: string) => void) | null = null;
      fetchMock.mockOnce(
        () =>
          new Promise((r) => {
            resolve = r;
          }),
      );

      const { fetch } = network.factory();

      const controller = new AbortController();

      const fetchPromise = fetch('foo.com', { signal: controller.signal });
      controller.abort();
      (resolve as any)('FAIL');
      await expect(fetchPromise).rejects.toThrow('The operation was aborted');
    });

    /**
     * Fetch has multiple implementations, Node v18, node-fetch, Browsers, mock fetch, JSDOM, etc.
     * And their actual behavior varies. For example node-fetch doesn't support ReadableStream and
     * passes Buffer or node stream with different API as response.body in browser.
     * Testing this would test node-fetch implementation instead of actual user use-case
     * Thus it's not actually written
     */
    it.todo('can be torn down during body read');

    /**
     * Node doesn't support AbortSignal.reason property, thus we can't check if it's actually passed
     */
    it.todo('reason from AbortController.abort() is passed down');
  });

  describe('WebSocket', () => {
    const WEBSOCKET_URL = 'ws://foo.bar:8080/';
    let server: WebSocketServer;

    beforeEach(() => {
      server = new WebSocketServer(WEBSOCKET_URL);
    });

    afterEach(() => {
      server.stop();
      server.restoreWebsocket();
    });

    it('can be used normally', async () => {
      const MESSAGE_DATA = 'PING';
      const RESPONSE_DATA = 'PONG';
      const PROTOCOL = 'foo.protocol';
      const { WebSocket: _WebSocket } = network.factory();

      let onConnectionResolve: any;
      let onMessageResolve: any;
      let onResponseResolve: any;
      let onErrorResolve: any;
      let onCloseResolve: any;
      const promises = [
        new Promise((r) => (onConnectionResolve = r)),
        new Promise((r) => (onMessageResolve = r)),
        new Promise((r) => (onResponseResolve = r)),
        new Promise((r) => (onErrorResolve = r)),
        new Promise((r) => (onCloseResolve = r)),
      ];

      server.on('connection', (response) => {
        onConnectionResolve(true);
        response.on('message', (data) => {
          onMessageResolve(data);
          response.send(RESPONSE_DATA);
        });

        response.on('close', () => {
          onCloseResolve(true);
        });
      });

      const socket = new _WebSocket(WEBSOCKET_URL, PROTOCOL);
      socket.onmessage = (event: MessageEvent<any>) => {
        onResponseResolve(event.data);
        socket.close();
      };

      const closeListener = () => {
        throw new Error('close event called');
      };
      socket.addEventListener('close', closeListener);
      socket.removeEventListener('close', closeListener);

      let closedResolve: any;
      const closedPromise = new Promise((r) => (closedResolve = r));
      socket.onclose = () => closedResolve();

      socket.onopen = () => {
        socket.send(MESSAGE_DATA);
      };

      socket.onerror = () => {
        onErrorResolve(true);
      };

      socket.dispatchEvent(new Event('error'));

      expect(socket.binaryType).toStrictEqual('blob');
      socket.binaryType = 'arraybuffer';
      expect(socket.binaryType).toStrictEqual('arraybuffer');
      socket.binaryType = 'blob';
      expect(socket.binaryType).toStrictEqual('blob');

      expect(socket.url).toStrictEqual(WEBSOCKET_URL);
      expect(socket.protocol).toStrictEqual(PROTOCOL);
      expect(socket.CLOSED).toStrictEqual(WebSocket.CLOSED);
      expect(socket.CLOSING).toStrictEqual(WebSocket.CLOSING);
      expect(socket.CONNECTING).toStrictEqual(WebSocket.CONNECTING);
      expect(socket.OPEN).toStrictEqual(WebSocket.OPEN);
      expect(socket.extensions).toStrictEqual('');
      expect(await Promise.all(promises)).toStrictEqual([
        true,
        MESSAGE_DATA,
        RESPONSE_DATA,
        true,
        true,
      ]);

      await closedPromise;
      expect(socket.readyState).toStrictEqual(socket.CLOSED);
      expect(socket.bufferedAmount).toStrictEqual(0);
    });

    it('can be torn down during use', async () => {
      const { WebSocket, teardownFunction } = network.factory();

      let onOpenResolve: any;
      const onOpen = new Promise((r) => (onOpenResolve = r));

      const socket = new WebSocket(WEBSOCKET_URL);
      socket.onopen = async () => {
        await teardownFunction();
        onOpenResolve(true);
      };

      await onOpen;

      expect(socket.readyState).toStrictEqual(socket.CLOSED);
    });

    it('normal close() still calls onclose', async () => {
      const { WebSocket } = network.factory();

      const socket = new WebSocket(WEBSOCKET_URL);
      let onCloseResolve: any;
      const onClose = new Promise((r) => (onCloseResolve = r));
      socket.onclose = () => {
        onCloseResolve(true);
      };

      socket.close();

      expect(await onClose).toStrictEqual(true);
    });

    it("can't be escaped by attaching to close event", async () => {
      const { WebSocket, teardownFunction } = network.factory();

      const socket = new WebSocket(WEBSOCKET_URL);
      socket.onclose = () => {
        throw new Error('onclose called');
      };

      socket.addEventListener('close', () => {
        throw new Error('close event called');
      });

      await teardownFunction();
      expect(socket.readyState).toStrictEqual(socket.CLOSED);
    });

    it("can't be escaped by adding a close listener after teardown was already called but not resolved", async () => {
      const { WebSocket, teardownFunction } = network.factory();

      const socket = new WebSocket(WEBSOCKET_URL);

      const teardownPromise = teardownFunction();
      socket.addEventListener('close', () => {
        throw new Error('close event called');
      });

      socket.onclose = () => {
        throw new Error('onclose called');
      };

      await teardownPromise;

      expect(socket.readyState).toStrictEqual(socket.CLOSED);
    });

    it("can't be escaped by calling methods with different this", async () => {
      const { WebSocket, teardownFunction } = network.factory();

      const badClass = new (class {
        readonly #isTornDown = false;

        readonly #socket = {
          addEventListener() {
            throw new Error('#socket called');
          },
        };
      })();

      const socket = new WebSocket(WEBSOCKET_URL);
      expect(() =>
        socket.addEventListener.call(badClass, 'open', () => {
          throw new Error('open event called');
        }),
      ).toThrow(
        new TypeError(
          'Cannot read private member from an object whose class did not declare it',
        ),
      );

      expect(() =>
        socket.addEventListener.call(badClass, 'close', () => {
          throw new Error('close event called');
        }),
      ).toThrow(
        new TypeError(
          'Cannot read private member from an object whose class did not declare it',
        ),
      );

      await teardownFunction();

      expect(socket.readyState).toStrictEqual(socket.CLOSED);
    });

    it("can't be escaped by modyfing private properties", async () => {
      const { WebSocket, teardownFunction } = network.factory();
      const socket = new WebSocket(WEBSOCKET_URL);

      (socket as any)['#socket'] = null;

      let onOpenResolve: any;
      const onOpen = new Promise((r) => (onOpenResolve = r));
      socket.onopen = () => {
        onOpenResolve(true);
      };

      await teardownFunction();

      expect(await onOpen).toStrictEqual(true);
      expect(socket.readyState).toStrictEqual(socket.CLOSED);
    });

    it("can't be escaped by calling prototype / wrapped WebSocket methods", () => {
      const { WebSocket: _WebSocket } = network.factory();

      const socket = new _WebSocket(WEBSOCKET_URL);
      expect(socket instanceof WebSocket).toStrictEqual(false);

      expect(() =>
        Object.getPrototypeOf(_WebSocket).addEventListener.call(
          socket,
          'open',
          () => {
            throw new Error('onopen called');
          },
        ),
      ).toThrow('Cannot read propert'); // different error messages on different node versions

      expect(() =>
        (socket as any)['#socket'].addEventListener('open', () => {
          throw new Error('onopen called');
        }),
      ).toThrow('Cannot read propert'); // different error messages on different node versions
    });

    it("can't be broken by dispatching close event before actual close happens", async () => {
      const { WebSocket, teardownFunction } = network.factory();

      const socket = new WebSocket(WEBSOCKET_URL);
      const teardownPromise = teardownFunction();

      socket.dispatchEvent(new Event('close'));

      await teardownPromise;

      // If the close event was called prematurely, the state would socket.CLOSING
      expect(socket.readyState).toStrictEqual(socket.CLOSED);
    });

    it("can't be escaped by removing listener with different event type", async () => {
      const { WebSocket, teardownFunction } = network.factory();

      const socket = new WebSocket(WEBSOCKET_URL);
      const listener = () => {
        throw new Error('close event called');
      };
      socket.addEventListener('close', listener);
      socket.removeEventListener('open', listener);

      await teardownFunction();

      expect(socket.readyState).toStrictEqual(socket.CLOSED);
    });
  });
});
