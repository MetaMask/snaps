import ObjectMultiplex from '@metamask/object-multiplex';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import { JsonRpcEngine, JsonRpcRequest } from 'json-rpc-engine';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import pump from 'pump';
import type { Duplex } from 'stream';

import {
  ConnectArguments,
  Provider,
  RequestArguments,
  Session,
} from './Provider';

const STREAM_NAME = 'metamask-provider-multichain';

export class MultichainProvider extends SafeEventEmitter implements Provider {
  #rpcEngine = new JsonRpcEngine();
  #rpcConnection = createStreamMiddleware();

  constructor(connection: Duplex) {
    super();

    const mux = new ObjectMultiplex();

    pump(connection, mux, connection);
    pump(
      this.#rpcConnection.stream,
      mux.createStream(STREAM_NAME),
      this.#rpcConnection.stream,
    );
    this.#rpcEngine.push(this.#rpcConnection.middleware);
  }

  connect(args: ConnectArguments): Promise<{ approval: Promise<Session> }> {}

  request(args: { chainId: string; request: RequestArguments }): Promise<any> {
    throw new Error('Method not implemented.');
  }

  #rpcRequest(payload: { method: string } & Partial<JsonRpcRequest<unknown>>) {
    if (payload.jsonrpc === undefined) {
      payload.jsonrpc = '2.0';
    }
  }
}
