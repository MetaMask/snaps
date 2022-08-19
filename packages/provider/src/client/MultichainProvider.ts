import ObjectMultiplex from '@metamask/object-multiplex';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import Debug from 'debug';
import {
  JsonRpcEngine,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'json-rpc-engine';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import type { Duplex } from 'stream';
import {
  assertIsConnectArguments,
  assertIsRequest,
  assertNotErrorResp,
} from './validate';

import {
  ChainId,
  ConnectArguments,
  Provider,
  RequestArguments,
  Session,
} from './Provider';

const STREAM_NAME = 'metamask-provider-multichain';

const debug = Debug('MultichainProvider');

export class MultichainProvider extends SafeEventEmitter implements Provider {
  #rpcEngine = new JsonRpcEngine();
  #rpcConnection = createStreamMiddleware();
  #isConnected = false;

  constructor(connection: Duplex) {
    super();

    this.#rpcConnection.events.on(
      'notification',
      this.#onNotification.bind(this),
    );

    const mux = new ObjectMultiplex();

    pump(connection, mux, connection);
    pump(
      this.#rpcConnection.stream,
      mux.createStream(STREAM_NAME),
      this.#rpcConnection.stream,
    );
    this.#rpcEngine.push(this.#rpcConnection.middleware);
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
        ).reduce<any>((acc, [id, definition]) => {
          acc[id] = {
            chains: definition.chains,
            methods: definition.methods ?? [],
            events: definition.events ?? [],
          };
          return acc;
        }, {});

        this.#isConnected = false;
        const response: JsonRpcResponse<Session> = await this.#rpcRequest({
          method: 'metamask_handshake',
          params: { requiredNamespaces },
        });
        assertNotErrorResp(response);
        this.#isConnected = true;

        const session = response.result as Session;
        this.emit('session_update', { params: session });
        return session;
      },
    };
  }

  async request<T>(args: {
    chainId: ChainId;
    request: RequestArguments;
  }): Promise<T> {
    if (!this.#isConnected) {
      throw new Error('No session connected');
    }
    assertIsRequest(args);
    const response = await this.#rpcRequest({
      method: 'caip_request',
      params: {
        chainId: args.chainId,
        request: { method: args.request.method, params: args.request.params },
      },
    });
    assertNotErrorResp(response);
    return response.result as T;
  }

  #rpcRequest<T>(
    payload: { method: string } & Partial<JsonRpcRequest<unknown>>,
  ) {
    if (payload.jsonrpc === undefined) {
      payload.jsonrpc = '2.0';
    }
    if (payload.id === undefined) {
      payload.id = nanoid();
    }

    return this.#rpcEngine.handle<unknown, T>(
      payload as JsonRpcRequest<unknown>,
    );
  }

  #onNotification(notification: MetamaskNotification) {
    debug('Received notification', notification);
    switch (notification.method) {
      case 'metamask_disconnect':
        this.#isConnected = false;
        return this.emit('session_delete');
      case 'metamask_event':
        return this.emit('session_event', {
          params: {
            chainId: notification.params.chainId,
            event: notification.params.event,
          },
        });
      default:
        // @ts-expect-error Defensive programming, shouldn't be reached in practice
        throw new Error(`Not implemented notification ${notification.method}`);
    }
  }
}

type MetamaskNotification =
  | {
      method: 'metamask_disconnect';
    }
  | { method: 'metamask_event'; params: { chainId: ChainId; event: Event } };
