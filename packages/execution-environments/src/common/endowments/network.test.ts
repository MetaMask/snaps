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

    it('should not expose then or catch after teardown has been called', async () => {
      let fetchResolve: ((result: string) => void) | null = null;
      fetchMock.mockOnce(() => new Promise((r) => (fetchResolve = r)));

      const { fetch, teardownFunction } = network.factory();
      const ErrorProxy = jest
        .fn()
        .mockImplementation((reason) => Error(reason));

      // eslint-disable-next-line jest/valid-expect-in-promise
      fetch('foo.com')
        .then(() => {
          throw new ErrorProxy('SHOULD_NOT_BE_REACHED');
        })
        .catch(() => {
          throw new ErrorProxy('SHOULD_NOT_BE_REACHED');
        })
        .catch((e) => console.log(e));

      const teardownPromise = teardownFunction();
      (fetchResolve as any)('Resolved');
      await teardownPromise;
      await new Promise((r) => setTimeout(() => r('Resolved'), 0));

      expect(ErrorProxy).not.toHaveBeenCalled();
    });

    it('should not expose catch after teardown has been called', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      fetchMock.mockReject(new Error('Failed to fetch.'));

      const { fetch, teardownFunction } = network.factory();

      // eslint-disable-next-line jest/valid-expect-in-promise
      fetch('foo.com').catch(() => {
        console.log('Jailbreak');
      });

      await teardownFunction();

      expect(consoleSpy).not.toHaveBeenCalled();
    });
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
      const onmessageListener = (event: MessageEvent<any>) => {
        onResponseResolve(event.data);
        socket.close();
      };
      socket.onmessage = onmessageListener;
      expect(socket.onmessage).toStrictEqual(onmessageListener);

      const closeListener = jest.fn();
      // Test that the removeEventListener actually removes the listener
      socket.addEventListener('close', closeListener);
      socket.removeEventListener('close', closeListener);

      let closedResolve: any;
      const closedPromise = new Promise((r) => (closedResolve = r));
      const oncloseListener = () => closedResolve();
      socket.onclose = oncloseListener;
      expect(socket.onclose).toStrictEqual(oncloseListener);

      const onopenListener = () => {
        socket.send(MESSAGE_DATA);
      };
      socket.onopen = onopenListener;
      expect(socket.onopen).toStrictEqual(onopenListener);

      const onerrorListener = () => {
        onErrorResolve(true);
      };
      socket.onerror = onerrorListener;
      expect(socket.onerror).toStrictEqual(onerrorListener);

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
      expect(closeListener).not.toHaveBeenCalled();
    });

    it('works when passed null callbacks', async () => {
      const { WebSocket, teardownFunction } = network.factory();
      const socket = new WebSocket(WEBSOCKET_URL);

      const fn = jest.fn();

      socket.onclose = fn;
      socket.onerror = fn;
      socket.onmessage = fn;
      socket.onopen = fn;
      // None of them should throw
      expect(() => {
        socket.onclose = null;
        socket.onerror = null;
        socket.onmessage = null;
        socket.onopen = null;
      }).not.toThrow();

      await teardownFunction();

      expect(fn).not.toHaveBeenCalled();
    });

    it('can be torn down during use', async () => {
      const { WebSocket, teardownFunction } = network.factory();

      let onClosedResolve: any;
      const onClosed = new Promise((r) => (onClosedResolve = r));

      const socket = new WebSocket(WEBSOCKET_URL);
      socket.onopen = async () => {
        await teardownFunction();
        onClosedResolve();
      };

      await onClosed;

      expect(socket.readyState).toStrictEqual(socket.CLOSED);
    });

    it('normal close() still calls onclose', async () => {
      const { WebSocket } = network.factory();

      let onClosedResolve: any;
      const onClosed = new Promise((r) => (onClosedResolve = r));

      const socket = new WebSocket(WEBSOCKET_URL);
      socket.onclose = () => {
        onClosedResolve();
      };

      socket.close();

      await onClosed;

      expect(socket.readyState).toStrictEqual(socket.CLOSED);
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

    it("can't be escaped by modifying private properties", async () => {
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

      const derived = new (class Derived extends _WebSocket {
        readonly listener = () => {
          throw new Error('open event called');
        };

        hackerman() {
          (this as any)['#socket'].addEventListener('open', this.listener);
        }
      })(WEBSOCKET_URL);

      expect(() => derived.hackerman()).toThrow('Cannot read propert'); // different error messages on different node versions
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

    it("can't be escaped by capturing this in the event handler", async () => {
      const { WebSocket: _WebSocket } = network.factory();

      server.on('connection', (response) => {
        response.on('message', () => {
          response.send('PONG');
        });
      });

      const socket = new _WebSocket(WEBSOCKET_URL);

      const validateThis = function () {
        // @ts-expect-error An outer value of 'this' is shadowed by this container
        expect(this as any).not.toBeInstanceOf(WebSocket); // eslint-disable-line no-invalid-this
      };

      let onCloseEventResolve: any;
      let onCloseResolve: any;
      const allClosed = Promise.all([
        new Promise((r) => (onCloseEventResolve = r)),
        new Promise((r) => (onCloseResolve = r)),
      ]);

      socket.onopen = function () {
        validateThis();
        socket.send('PING');
      };

      socket.onmessage = function () {
        validateThis();
        socket.dispatchEvent(new Event('error'));
      };

      socket.onerror = function () {
        validateThis();
        socket.close();
      };

      socket.onclose = function () {
        validateThis();
        onCloseResolve();
      };

      socket.addEventListener('open', function () {
        validateThis();
      });

      socket.addEventListener('message', function () {
        validateThis();
      });

      socket.addEventListener('error', function () {
        validateThis();
      });

      socket.addEventListener('close', function () {
        validateThis();
        onCloseEventResolve();
      });

      await allClosed;
    });

    it("can't be escaped by capturing target from event", async () => {
      const { WebSocket: _WebSocket } = network.factory();

      server.on('connection', (response) => {
        response.on('message', () => {
          response.send('PONG');
        });
      });

      const validateEvent = (e: Event) => {
        expect(e.target).not.toBeInstanceOf(WebSocket);
        expect(e.currentTarget).not.toBeInstanceOf(WebSocket);
        expect(e.srcElement).not.toBeInstanceOf(WebSocket);
        (e.composedPath?.() || []).forEach((path) =>
          expect(path).not.toBeInstanceOf(WebSocket),
        );
      };

      let onCloseEventResolve: any;
      let onCloseResolve: any;
      const allClosed = Promise.all([
        new Promise((r) => (onCloseEventResolve = r)),
        new Promise((r) => (onCloseResolve = r)),
      ]);

      const socket = new _WebSocket(WEBSOCKET_URL);

      socket.onopen = (e) => {
        validateEvent(e);
        socket.send('PING');
      };

      socket.onmessage = (e) => {
        validateEvent(e);
        socket.dispatchEvent(new Event('error'));
      };

      socket.onerror = (e) => {
        validateEvent(e);
        socket.close();
      };

      socket.onclose = (e) => {
        validateEvent(e);
        onCloseResolve();
      };
      socket.addEventListener('open', (e) => validateEvent(e));

      socket.addEventListener('message', (e) => validateEvent(e));

      socket.addEventListener('error', (e) => validateEvent(e));

      socket.addEventListener('close', (e) => {
        validateEvent(e);
        onCloseEventResolve();
      });

      await allClosed;
    });
  });

  describe('ResponseWrapper', () => {
    beforeEach(() => {
      fetchMock.enableMocks();
    });

    afterEach(() => {
      fetchMock.disableMocks();
    });

    it('should return for each of the Response methods', async () => {
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => RESULT);

      const { fetch } = network.factory();
      const result = await fetch('foo.com');

      expect(result).toBeDefined();
      expect(result.bodyUsed).toBe(false);
      expect(await result.text()).toBe(RESULT);
      expect(result.body).toBeDefined();
      expect(result.bodyUsed).toBe(true);
      expect(result.headers).toBeDefined();
      expect(result.ok).toBe(true);
      expect(result.redirected).toBe(false);
      expect(result.status).toBe(200);
      expect(result.statusText).toBe('OK');
      // This seems not to be set internally
      expect(result.type).toBeUndefined();
      // This seems not to be set internally
      expect(result.url).toBe('');
    });

    it('should return when arrayBuffer is called', async () => {
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => RESULT);

      const { fetch } = network.factory();
      const result = await fetch('foo.com');

      expect(result.bodyUsed).toBe(false);
      expect(await result.arrayBuffer()).toBeDefined();
    });

    it('should return when blob is called', async () => {
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => RESULT);

      const { fetch } = network.factory();
      const result = await fetch('foo.com');

      expect(result.bodyUsed).toBe(false);
      const blobResult = await result.blob();
      expect(blobResult).toBeDefined();
      expect(await blobResult.text()).toBe(RESULT);
    });

    it('should clone the body using the wrapper', async () => {
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => RESULT);

      const { fetch } = network.factory();
      const result = await fetch('foo.com');

      expect(result.bodyUsed).toBe(false);
      const clonedResult = result.clone();
      expect(clonedResult).toBeDefined();
      expect(await clonedResult.text()).toBe(RESULT);
      expect(clonedResult).not.toBeInstanceOf(Response);
    });

    it('should return when json is called', async () => {
      const RESULT = '{}';
      fetchMock.mockOnce(async () => RESULT);

      const { fetch } = network.factory();
      const result = await fetch('foo.com');

      expect(result.bodyUsed).toBe(false);
      expect(await result.json()).toStrictEqual({});
    });
  });
});
