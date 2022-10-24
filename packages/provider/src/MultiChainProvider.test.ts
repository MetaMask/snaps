import { SnapProvider } from '@metamask/snap-types';
import { NamespaceId, RequestNamespace } from '@metamask/snap-utils';
import {
  getRequestNamespace,
  getSessionNamespace,
} from '@metamask/snap-utils/test-utils';
import { MultiChainProvider } from './MultiChainProvider';

Object.assign(globalThis, {
  ethereum: {
    on: jest.fn(),
    request: jest.fn(),
  },
});

// Used for mocking the provider's return values.
declare const ethereum: SnapProvider;

/**
 * Get a new `MultiChainProvider` instance, that is connected to the given
 * namespaces.
 *
 * @param namespaces - The namespaces to connect to.
 * @returns The new `MultiChainProvider` instance.
 */
async function getProvider(
  namespaces: Record<NamespaceId, RequestNamespace> = {
    eip155: getRequestNamespace(),
  },
) {
  const request = ethereum.request as jest.MockedFunction<
    typeof ethereum.request
  >;

  request.mockImplementation(async () => ({
    namespaces: {
      eip155: getSessionNamespace(),
    },
  }));

  const provider = new MultiChainProvider();

  const { approval } = await provider.connect({
    requiredNamespaces: namespaces,
  });
  await approval();

  return provider;
}

describe('MultiChainProvider', () => {
  describe('connect', () => {
    it('validates the connection arguments', async () => {
      const provider = new MultiChainProvider();

      // @ts-expect-error Invalid arguments.
      await expect(provider.connect({ foo: 'bar' })).rejects.toThrow(
        'Invalid connect arguments',
      );
    });

    it('connects', async () => {
      const request = ethereum.request as jest.MockedFunction<
        typeof ethereum.request
      >;

      request.mockImplementation(async () => ({
        namespaces: {
          eip155: getSessionNamespace(),
        },
      }));

      const provider = new MultiChainProvider();
      const { approval } = await provider.connect({ requiredNamespaces: {} });

      expect(provider.isConnected).toBe(false);
      await approval();

      expect(provider.isConnected).toBe(true);
    });

    it('emits a "session_update" when connected', async () => {
      const request = ethereum.request as jest.MockedFunction<
        typeof ethereum.request
      >;

      request.mockImplementation(async () => ({
        namespaces: {
          eip155: getSessionNamespace(),
        },
      }));

      const provider = new MultiChainProvider();

      const listener = jest.fn();
      provider.on('session_update', listener);

      const { approval } = await provider.connect({ requiredNamespaces: {} });
      await approval();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        params: {
          namespaces: {
            eip155: getSessionNamespace(),
          },
        },
      });
    });

    it('defaults to an empty array for the methods and events', async () => {
      await getProvider({
        eip155: {
          chains: ['eip155:1'],
        },
      });

      expect(ethereum.request).toHaveBeenCalledWith({
        method: 'wallet_multiChainRequestHack',
        params: {
          jsonrpc: '2.0',
          id: expect.any(String),
          method: 'metamask_handshake',
          params: {
            requiredNamespaces: {
              eip155: {
                chains: ['eip155:1'],
                methods: [],
                events: [],
              },
            },
          },
        },
      });
    });

    it('verifies the JSON-RPC response', async () => {
      const request = ethereum.request as jest.MockedFunction<
        typeof ethereum.request
      >;

      request.mockImplementation(async () => ({
        namespaces: {
          eip155: 'foo',
        },
      }));

      const provider = new MultiChainProvider();

      const listener = jest.fn();
      provider.on('session_update', listener);

      const { approval } = await provider.connect({ requiredNamespaces: {} });
      expect(provider.isConnected).toBe(false);

      await expect(approval()).rejects.toThrow(
        'Invalid session: At path: namespaces.eip155 -- Expected an object, but received: "foo"',
      );

      expect(provider.isConnected).toBe(false);
      expect(listener).not.toHaveBeenCalled();
    });

    it('throws on errors', async () => {
      const request = ethereum.request as jest.MockedFunction<
        typeof ethereum.request
      >;

      request.mockImplementation(async () => {
        throw new Error('foo');
      });

      const provider = new MultiChainProvider();

      const { approval } = await provider.connect({ requiredNamespaces: {} });
      expect(provider.isConnected).toBe(false);

      await expect(approval()).rejects.toThrow('foo');
    });
  });

  describe('request', () => {
    it('throws if not connected', async () => {
      const provider = new MultiChainProvider();
      expect(provider.isConnected).toBe(false);

      await expect(
        provider.request({
          chainId: 'eip155:1',
          request: {
            method: 'eth_accounts',
          },
        }),
      ).rejects.toThrow('No session connected.');
    });

    it.each([
      null,
      undefined,
      {
        chainId: 'eip155:1',
        request: 'foo',
      },
      {
        chainId: 'foo',
        request: {
          method: 'eth_accounts',
        },
      },
    ])('validates the request arguments', async (args) => {
      const provider = await getProvider();

      // @ts-expect-error Invalid arguments.
      await expect(provider.request(args)).rejects.toThrow(
        'Invalid request arguments',
      );
    });

    it('returns the response result', async () => {
      const provider = await getProvider();

      const request = ethereum.request as jest.MockedFunction<
        typeof ethereum.request
      >;

      request.mockImplementation(async () => 'foo');

      const result = await provider.request({
        chainId: 'eip155:1',
        request: {
          method: 'eth_accounts',
        },
      });

      expect(result).toBe('foo');
    });

    it('generates a random request ID', async () => {
      const provider = await getProvider();

      const request = ethereum.request as jest.MockedFunction<
        typeof ethereum.request
      >;

      request.mockImplementation(async () => ({
        jsonrpc: '2.0',
        id: 1,
        result: 'foo',
      }));

      await provider.request({
        chainId: 'eip155:1',
        request: {
          method: 'eth_accounts',
        },
      });

      expect(request).toHaveBeenNthCalledWith(2, {
        method: 'wallet_multiChainRequestHack',
        params: {
          id: expect.any(String),
          jsonrpc: '2.0',
          method: 'caip_request',
          params: {
            chainId: 'eip155:1',
            request: {
              method: 'eth_accounts',
              params: undefined,
            },
          },
        },
      });

      await provider.request({
        chainId: 'eip155:1',
        request: {
          method: 'eth_sendTransaction',
        },
      });

      expect(request).toHaveBeenCalledTimes(3);
      expect(request).toHaveBeenNthCalledWith(3, {
        method: 'wallet_multiChainRequestHack',
        params: {
          id: expect.any(String),
          jsonrpc: '2.0',
          method: 'caip_request',
          params: {
            chainId: 'eip155:1',
            request: {
              method: 'eth_sendTransaction',
              params: undefined,
            },
          },
        },
      });

      const firstId = (request.mock.calls[1][0].params as { id: string }).id;
      const secondId = (request.mock.calls[2][0].params as { id: string }).id;

      expect(firstId).not.toBe(secondId);
    });

    it('throws on errors', async () => {
      const provider = await getProvider();

      const request = ethereum.request as jest.MockedFunction<
        typeof ethereum.request
      >;

      request.mockImplementation(async () => {
        throw new Error('foo');
      });

      await expect(
        provider.request({
          chainId: 'eip155:1',
          request: {
            method: 'eth_accounts',
          },
        }),
      ).rejects.toThrow('foo');
    });
  });

  describe('events', () => {
    it('emits a "session_delete" when the wallet disconnects', async () => {
      const provider = await getProvider();
      expect(provider.isConnected).toBe(true);

      const listener = jest.fn();
      provider.on('session_delete', listener);

      const on = ethereum.on as jest.MockedFunction<typeof ethereum.on>;
      const [event, callback] = on.mock.calls[0];

      expect(event).toBe('multichainHack_metamask_disconnect');
      callback();

      expect(provider.isConnected).toBe(false);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('emits a "session_event" when the wallet sends an event', async () => {
      const provider = await getProvider();
      expect(provider.isConnected).toBe(true);

      const listener = jest.fn();
      provider.on('session_event', listener);

      const on = ethereum.on as jest.MockedFunction<typeof ethereum.on>;
      const [event, callback] = on.mock.calls[1];

      expect(event).toBe('multichainHack_metamask_event');
      callback({
        method: 'multichainHack_metamask_event',
        params: {
          chainId: 'eip155:1',
          event: {
            name: 'foo',
            data: 'bar',
          },
        },
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        params: {
          chainId: 'eip155:1',
          event: {
            name: 'foo',
            data: 'bar',
          },
        },
      });
    });

    it('verifies the event arguments', async () => {
      const provider = await getProvider();
      expect(provider.isConnected).toBe(true);

      const listener = jest.fn();
      provider.on('session_event', listener);

      const on = ethereum.on as jest.MockedFunction<typeof ethereum.on>;
      const [event, callback] = on.mock.calls[1];

      expect(event).toBe('multichainHack_metamask_event');
      expect(() =>
        callback({
          method: 'multichainHack_metamask_event',
          params: 'foo',
        }),
      ).toThrow(
        'Invalid notification: At path: params -- Expected an object, but received: "foo"',
      );

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
