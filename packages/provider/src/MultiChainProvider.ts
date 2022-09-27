import SafeEventEmitter from '@metamask/safe-event-emitter';
import { nanoid } from 'nanoid';
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
} from '@metamask/snap-utils';
import { assertIsJsonRpcSuccess, JsonRpcRequest } from '@metamask/utils';
import type { SnapProvider } from '@metamask/snap-types';
import { Provider } from './Provider';

declare global {
  // Declaration merging doesn't work with types, so we have to use an interface
  // here.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ethereum: SnapProvider;
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

  async connect(
    args: ConnectArguments,
  ): Promise<{ approval(): Promise<Session> }> {
    assertIsConnectArguments(args);

    // We're injected, we don't need to establish connection to the wallet
    // and can just return approval straight away
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
        const response = await this.#rpcRequest({
          method: 'metamask_handshake',
          params: { requiredNamespaces },
        });

        assertIsJsonRpcSuccess(response);
        assertIsSession(response.result);

        this.#isConnected = true;

        const session = response.result;
        this.emit('session_update', { params: session });
        return session;
      },
    };
  }

  async request(args: {
    chainId: ChainId;
    request: RequestArguments;
  }): Promise<unknown> {
    if (!this.#isConnected) {
      throw new Error('No session connected');
    }

    assertIsMultiChainRequest(args);

    const response = await this.#rpcRequest({
      method: 'caip_request',
      params: {
        chainId: args.chainId,
        request: { method: args.request.method, params: args.request.params },
      },
    });

    assertIsJsonRpcSuccess(response);
    return response.result;
  }

  #getProvider() {
    return window.ethereum;
  }

  #rpcRequest(
    payload: { method: string } & Partial<
      JsonRpcRequest<unknown[] | Record<string, unknown>>
    >,
  ) {
    if (payload.jsonrpc === undefined) {
      payload.jsonrpc = '2.0';
    }

    if (payload.id === undefined) {
      payload.id = nanoid();
    }

    return this.#getProvider().request({
      method: 'wallet_multiChainRequestHack',
      params: payload,
    });
  }
}
