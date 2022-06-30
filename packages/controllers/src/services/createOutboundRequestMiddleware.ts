import { Duplex } from 'stream';
import { ExecutionServiceMessenger, SnapId } from '@metamask/snap-types';
import { JsonRpcRequest } from '@metamask/utils';
import { JsonRpcResponse } from 'json-rpc-engine';

type JsonRpcChunk = {
  name: string;
  data: JsonRpcRequest<unknown> | JsonRpcResponse<unknown>;
};

class WrappedStream extends Duplex {
  private _stream: Duplex;

  private idMap = {} as any;

  private _messenger: ExecutionServiceMessenger;

  private _snapId: string;

  constructor(
    stream: Duplex,
    messenger: ExecutionServiceMessenger,
    snapId: SnapId,
  ) {
    super({ objectMode: true });
    this._stream = stream;
    this._messenger = messenger;
    this._snapId = snapId;

    stream.on('data', (chunk) => console.log('OUTBOUND REQUEST', chunk));
    stream.on('data', (chunk) => this.processChunk(chunk));
  }

  processChunk(chunk: JsonRpcChunk) {
    if (chunk.name === 'metamask-provider' && chunk.data.id) {
      const { data } = chunk;
      /* eslint-disable no-negated-condition */
      if (!(chunk.data.id in this.idMap)) {
        this.idMap[chunk.data.id] = { data };
        this._messenger.publish(
          'ExecutionService:outboundRequest' as const,
          this._snapId,
        );
      } else {
        this._messenger.publish(
          'ExecutionService:outboundResponse' as const,
          this._snapId,
        );
      }
    }
  }

  read(size: number) {
    return this._stream.read(size);
  }

  write(
    chunk: JsonRpcChunk,
    encoding?: BufferEncoding,
    cb?: (error: Error | null | undefined) => void,
  ): boolean;

  write(
    chunk: JsonRpcChunk,
    cb?: (error: Error | null | undefined) => void,
  ): boolean;

  write(chunk: JsonRpcChunk, encoding?: any, cb?: any): boolean {
    console.log('OUTBOUND RESPONSE?', chunk);
    this.processChunk(chunk);
    return this._stream.write(chunk, encoding, cb);
  }

  pipe<T extends NodeJS.WritableStream>(
    destination: T,
    options?: { end?: boolean | undefined },
  ): T {
    return this._stream.pipe(destination, options);
  }

  unpipe(destination?: NodeJS.WritableStream): this {
    this._stream.unpipe(destination);
    return this;
  }
}

export const createOutboundRequestMiddleware = (
  rpcStream: Duplex,
  messenger: ExecutionServiceMessenger,
  snapId: SnapId,
) => {
  return new WrappedStream(rpcStream, messenger, snapId);
};
