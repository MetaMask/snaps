import { Duplex } from 'stream';
import { ChildProcess, fork } from 'child_process';
import { ProcessParentMessageStream } from '@metamask/post-message-stream';
import { SNAP_STREAM_NAMES } from '@metamask/execution-environments';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import {
  AbstractExecutionService,
  setupMultiplex,
} from '../AbstractExecutionService';

type JobStreams = {
  command: Duplex;
  rpc: Duplex | null;
  _connection: ProcessParentMessageStream;
};

type EnvMetadata = {
  id: string;
  streams: JobStreams;
  rpcEngine: JsonRpcEngine;
  process: ChildProcess;
};

export class NodeExecutionService extends AbstractExecutionService<EnvMetadata> {
  protected _terminate(jobWrapper: EnvMetadata): void {
    jobWrapper.process.kill();
  }

  protected async _initJob(): Promise<EnvMetadata> {
    const jobId = nanoid();
    const { streams, process } = await this._initStreams(jobId);
    const rpcEngine = new JsonRpcEngine();

    const jsonRpcConnection = createStreamMiddleware();

    pump(jsonRpcConnection.stream, streams.command, jsonRpcConnection.stream);

    rpcEngine.push(jsonRpcConnection.middleware);

    const envMetadata = {
      id: jobId,
      streams,
      rpcEngine,
      process,
    };
    this.jobs.set(jobId, envMetadata);

    return envMetadata;
  }

  private async _initStreams(jobId: string): Promise<any> {
    const process = this._createProcess();
    const envStream = new ProcessParentMessageStream({
      process,
    });
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
      process,
    };
  }

  private _createProcess(): ChildProcess {
    const process = fork(
      require.resolve(
        '@metamask/execution-environments/dist/webpack/node/bundle.js',
      ),
    );
    return process;
  }
}
