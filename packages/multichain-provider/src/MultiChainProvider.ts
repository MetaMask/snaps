import { MetaMaskInpageProvider } from '@metamask/providers';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import {
  assertIsConnectArguments,
  assertIsMetaMaskNotification,
  assertIsMultiChainRequest,
  assertIsSession,
  ChainId,
  ConnectArguments,
  NamespaceId,
  RequestArguments,
  RequestNamespace,
  Session,
} from '@metamask/snaps-utils';
import { JsonRpcRequest, Json } from '@metamask/utils';
import { nanoid } from 'nanoid';

import { Provider } from './Provider';

declare global {
  // Declaration merging doesn't work with types, so we have to use an interface
  // here.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

export class MultiChainProvider extends SafeEventEmitter implements Provider {
  #isConnected = false;

  constructor() {
    super();

    const provider = this.#getProvider();

    provider.on('multichainHack_metamask_disconnect', () => {
      this.#isConnected = false;
      this.emit('session_delete');
    });

    provider.on('multichainHack_metamask_event', (notification) => {
      assertIsMetaMaskNotification(notification);

      this.emit('session_event', {
        params: {
          chainId: notification.params.chainId,
          event: notification.params.event,
        },
      });
    });
  }

  /**
   * Get whether the provider is connected to the upstream wallet.
   *
   * @returns Whether the provider is connected to the upstream wallet.
   */
  get isConnected() {
    return this.#isConnected;
  }

  /**
   * Connect to MetaMask and request a session with the given namespace(s).
   *
   * @param args - The connection arguments.
   * @param args.requiredNamespaces - The namespaces to request.
   * @returns An object containing an `approval` function, which can be called
   * to connect to the wallet.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async connect(
    args: ConnectArguments,
  ): Promise<{ approval(): Promise<Session> }> {
    assertIsConnectArguments(args);

    // We're injected, we don't need to establish connection to the wallet
    // and can just return approval straight away.
    return {
      approval: async () => {
        const requiredNamespaces = Object.entries(
          args.requiredNamespaces,
        ).reduce<Record<NamespaceId, RequestNamespace>>(
          (acc, [id, definition]) => {
            acc[id] = {
              chains: definition.chains,
              methods: definition.methods ?? [],
              events: definition.events ?? [],
            };
            return acc;
          },
          {},
        );

        this.#isConnected = false;
        const session = await this.#rpcRequest({
          method: 'metamask_handshake',
          params: { requiredNamespaces },
        });

        assertIsSession(session);

        this.#isConnected = true;

        this.emit('session_update', { params: session });
        return session;
      },
    };
  }

  /**
   * Send a multichain request to the wallet. The provider must be connected to
   * the wallet using {@link MultiChainProvider#connect} before this method can
   * be called.
   *
   * @param args - The multichain request arguments.
   * @param args.chainId - The chain ID to use for the request.
   * @param args.request - The JSON-RPC request to send.
   * @returns The JSON-RPC response.
   */
  async request(args: {
    chainId: ChainId;
    request: RequestArguments;
  }): Promise<unknown> {
    if (!this.#isConnected) {
      throw new Error('No session connected.');
    }

    assertIsMultiChainRequest(args);

    // We're doing it this way to avoid sentRequest.params = undefined.
    const sentRequest: Json = { method: args.request.method };
    if (args.request.params !== undefined) {
      sentRequest.params = args.request.params;
    }

    return this.#rpcRequest({
      method: 'caip_request',
      params: {
        chainId: args.chainId,
        request: sentRequest,
      },
    });
  }

  /**
   * Get the provider that is injected by the wallet, i.e., `window.ethereum`.
   *
   * @returns The injected provider.
   */
  #getProvider() {
    return window.ethereum;
  }

  /**
   * Send an RPC request to the wallet.
   *
   * @param payload - The JSON-RPC request to send.
   * @returns The JSON-RPC response.
   */
  async #rpcRequest(
    payload: { method: string } & Partial<
      JsonRpcRequest<Record<string, Json> | Json[] | undefined>
    >,
  ) {
    return await this.#getProvider().request({
      method: 'wallet_multiChainRequestHack',
      params: {
        jsonrpc: '2.0',
        id: nanoid(),
        ...payload,
      },
    });
  }
}
