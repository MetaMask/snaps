import { Duplex } from 'stream';
import { ObservableStore } from '@metamask/obs-store';
import { WorkerParentPostMessageStream } from '@metamask/post-message-stream';
import { ExecutionServiceMessenger } from '@metamask/snap-types';
import { SNAP_STREAM_NAMES } from '@metamask/execution-environments';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import {
  AbstractExecutionService,
  setupMultiplex,
  SetupSnapProvider,
} from './AbstractExecutionService';

interface WorkerControllerArgs {
  setupSnapProvider: SetupSnapProvider;
  workerUrl: URL;
  messenger: ExecutionServiceMessenger;
  unresponsivePollingInterval?: number;
  unresponsiveTimeout?: number;
}

interface WorkerStreams {
  command: Duplex;
  rpc: Duplex | null;
  _connection: WorkerParentPostMessageStream;
}

interface WorkerWrapper {
  id: string;
  streams: WorkerStreams;
  rpcEngine: JsonRpcEngine;
  worker: Worker;
}

export class WebWorkerExecutionService extends AbstractExecutionService<WorkerWrapper> {
  public store: ObservableStore<{ workers: Record<string, WorkerWrapper> }>;

  private workerUrl: URL;

  constructor({
    setupSnapProvider,
    workerUrl,
    messenger,
    unresponsivePollingInterval = 5000,
    unresponsiveTimeout = 30000,
  }: WorkerControllerArgs) {
    super({
      setupSnapProvider,
      messenger,
      unresponsivePollingInterval,
      unresponsiveTimeout,
    });
    this.workerUrl = workerUrl;
    this.store = new ObservableStore({ workers: {} });
  }

  private _setWorker(workerId: string, workerWrapper: WorkerWrapper): void {
    this.jobs.set(workerId, workerWrapper);

    const newWorkerState = {
      ...(this.store.getState().workers as Record<string, WorkerWrapper>),
      [workerId]: workerWrapper,
    };
    this.store.updateState({ workers: newWorkerState });
  }

  private _deleteWorker(workerId: string): void {
    const newWorkerState = {
      ...(this.store.getState().workers as Record<string, WorkerWrapper>),
    };
    delete newWorkerState[workerId];
    this.store.updateState({ workers: newWorkerState });
  }

  protected _terminate(workerWrapper: WorkerWrapper): void {
    workerWrapper.worker.terminate();
    this._deleteWorker(workerWrapper.id);
  }

  protected async _initJob(): Promise<WorkerWrapper> {
    const workerId = nanoid();
    const worker = new Worker(this.workerUrl, {
      name: workerId,
    });
    // Handle out-of-band errors, i.e. errors thrown from the snap outside of the req/res cycle.
    const errorHandler = (ev: ErrorEvent) => {
      if (this._messenger) {
        const snapId = this.jobToSnapMap.get(workerId);
        if (snapId) {
          this._messenger.publish('ExecutionService:unhandledError', snapId, {
            code: ev.error.code,
            message: ev.error.message,
            data: ev.error.data,
          });
        }
      }
    };
    worker.addEventListener('error', errorHandler, { once: true });
    const streams = this._initWorkerStreams(worker, workerId);
    const rpcEngine = new JsonRpcEngine();

    const jsonRpcConnection = createStreamMiddleware();

    pump(jsonRpcConnection.stream, streams.command, jsonRpcConnection.stream);

    rpcEngine.push(jsonRpcConnection.middleware);

    const workerWrapper = {
      id: workerId,
      streams,
      rpcEngine,
      worker,
    };
    this._setWorker(workerId, workerWrapper);

    await this._command(workerId, {
      jsonrpc: '2.0',
      method: 'ping',
      id: nanoid(),
    });

    return workerWrapper;
  }

  _initWorkerStreams(worker: Worker, workerId: string): WorkerStreams {
    const workerStream = new WorkerParentPostMessageStream({ worker });
    // Typecast justification: stream type mismatch
    const mux = setupMultiplex(
      workerStream as unknown as Duplex,
      `Worker:${workerId}`,
    );

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);

    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);

    // Typecast: stream type mismatch
    return {
      command: commandStream as unknown as Duplex,
      rpc: rpcStream,
      _connection: workerStream,
    };
  }
}
