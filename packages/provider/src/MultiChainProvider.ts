import SafeEventEmitter from '@metamask/safe-event-emitter';
import { nanoid } from 'nanoid';
import {
  assertIsConnectArguments,
  assertIsMultiChainRequest,
  ChainId,
  ConnectArguments,
  NamespaceId,
  RequestArguments,
  RequestNamespace,
  Session,
} from '@metamask/snap-utils';
import {
  assertIsJsonRpcSuccess,
  JsonRpcRequest,
  JsonRpcResponse,
} from '@metamask/utils';
import { Provider } from './Provider';

export class MultiChainProvider extends SafeEventEmitter implements Provider {
  #isConnected = false;

  constructor() {
    super();

    const provider = this.#getProvider();
    provider.on('multichainHack_metamask_disconnect', () => {
      this.#isConnected = false;
      this.emit('session_delete');
    });

    provider.on(
      'multichainHack_metamask_event',
      (notification: MetamaskNotification) => {
        this.emit('session_event', {
          params: {
            chainId: notification.params.chainId,
            event: notification.params.event,
          },
        });
      },
    );
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
        const response: JsonRpcResponse<Session> = await this.#rpcRequest({
          method: 'metamask_handshake',
          params: { requiredNamespaces },
        });
        assertIsJsonRpcSuccess(response);
        this.#isConnected = true;

        const session = response.result as Session;
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
    return (window as any)?.ethereum;
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

type MetamaskNotification = {
  method: 'multichainHack_metamask_event';
  params: { chainId: ChainId; event: Event };
};
