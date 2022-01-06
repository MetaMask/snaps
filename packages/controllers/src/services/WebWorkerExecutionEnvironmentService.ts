import { Duplex } from 'stream';
import { ObservableStore } from '@metamask/obs-store';
import { WorkerParentPostMessageStream } from '@metamask/post-message-stream';
import { ServiceMessenger } from '@metamask/snap-types';
import { SNAP_STREAM_NAMES } from '@metamask/snap-workers';
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
  messenger: ServiceMessenger;
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

export class WebWorkerExecutionEnvironmentService extends AbstractExecutionService<WorkerWrapper> {
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
    this.jobs.delete(workerId);

    const newWorkerState = {
      ...(this.store.getState().workers as Record<string, WorkerWrapper>),
    };
    delete newWorkerState[workerId];
    this.store.updateState({ workers: newWorkerState });
  }

  terminate(workerId: string): void {
    const workerWrapper = this.jobs.get(workerId);

    if (!workerWrapper) {
      throw new Error(`Worker with id "${workerId}" not found.`);
    }

    const snapId = this._getSnapForJob(workerId);

    if (!snapId) {
      throw new Error(
        `Failed to find a snap for worker with id "${workerId}".`,
      );
    }

    Object.values(workerWrapper.streams).forEach((stream) => {
      try {
        !stream.destroyed && stream.destroy();
        stream.removeAllListeners();
      } catch (err) {
        console.log('Error while destroying stream', err);
      }
    });
    workerWrapper.worker.terminate();
    this._removeSnapAndJobMapping(workerId);
    this._deleteWorker(workerId);

    clearTimeout(this._timeoutForUnresponsiveMap.get(workerId));
    this._timeoutForUnresponsiveMap.delete(workerId);

    console.log(`worker:${workerId} terminated`);
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
          this._messenger.publish('ServiceMessenger:unhandledError', snapId, {
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
