import { Duplex } from 'stream';
import { SNAP_STREAM_NAMES } from '@metamask/execution-environments';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import { BasePostMessageStream } from '@metamask/post-message-stream';
import {
  AbstractExecutionService,
  setupMultiplex,
} from '../AbstractExecutionService';

type JobStreams = {
  command: Duplex;
  rpc: Duplex | null;
  _connection: BasePostMessageStream;
};

export type EnvMetadata<EnvProcessType> = {
  id: string;
  streams: JobStreams;
  rpcEngine: JsonRpcEngine;
  worker: EnvProcessType;
};

export abstract class NodeExecutionService<
  EnvProcessType,
> extends AbstractExecutionService<EnvMetadata<EnvProcessType>> {
  protected abstract _initEnvStream(): {
    worker: EnvProcessType;
    stream: BasePostMessageStream;
  };

  protected async _initJob(): Promise<EnvMetadata<EnvProcessType>> {
    const jobId = nanoid();
    const { streams, worker } = await this._initStreams(jobId);
    const rpcEngine = new JsonRpcEngine();

    const jsonRpcConnection = createStreamMiddleware();

    pump(jsonRpcConnection.stream, streams.command, jsonRpcConnection.stream);

    rpcEngine.push(jsonRpcConnection.middleware);

    const envMetadata = {
      id: jobId,
      streams,
      rpcEngine,
      worker,
    };
    this.jobs.set(jobId, envMetadata);

    return envMetadata;
  }

  private async _initStreams(jobId: string): Promise<any> {
    const { worker, stream: envStream } = this._initEnvStream();
    // Typecast justification: stream type mismatch
    const mux = setupMultiplex(
      envStream as unknown as Duplex,
      `Job: "${jobId}"`,
    );

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    // Handle out-of-band errors, i.e. errors thrown from the snap outside of the req/res cycle.
    const errorHandler = (data: any) => {
      if (
        data.error &&
        (data.id === null || data.id === undefined) // only out of band errors (i.e. no id)
      ) {
        const snapId = this.jobToSnapMap.get(jobId);
        if (snapId) {
          this._messenger.publish(
            'ExecutionService:unhandledError',
            snapId,
            data.error,
          );
        }
        commandStream.removeListener('data', errorHandler);
      }
    };
    commandStream.on('data', errorHandler);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);

    // Typecast: stream type mismatch
    return {
      streams: {
        command: commandStream as unknown as Duplex,
        rpc: rpcStream,
        _connection: envStream,
      },
      worker,
    };
  }
}
