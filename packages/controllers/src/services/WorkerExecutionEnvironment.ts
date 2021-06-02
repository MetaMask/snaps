import { Duplex } from 'stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import { ObservableStore } from '@metamask/obs-store';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import ObjectMultiplex from '@metamask/object-multiplex';
import { WorkerParentPostMessageStream } from '@metamask/post-message-stream';
import { PLUGIN_STREAM_NAMES } from '@mm-snap/workers';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { PluginData } from '@mm-snap/types';
import {
  JsonRpcEngine,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { PluginExecutionEnvironmentService } from '../services/PluginExecutionEnvironmentService';

export type SetupWorkerConnection = (metadata: any, stream: Duplex) => void;

export interface PluginWorkerMetadata {
  hostname: string;
}
interface WorkerControllerArgs {
  setupWorkerConnection: SetupWorkerConnection;
  workerUrl: URL;
}

interface WorkerStreams {
  command: Duplex;
  rpc: Duplex;
  _connection: WorkerParentPostMessageStream;
}

interface WorkerWrapper {
  workerId: string;
  streams: WorkerStreams;
  rpcEngine: JsonRpcEngine;
  worker: Worker;
}

export class WorkerExecutionEnvironment
  extends SafeEventEmitter
  implements PluginExecutionEnvironmentService {
  public store: ObservableStore<{ workers: Record<string, WorkerWrapper> }>;

  private workerUrl: URL;

  private workers: Map<string, WorkerWrapper>;

  private setupWorkerConnection: SetupWorkerConnection;

  private pluginToWorkerMap: Map<string, string>;

  private workerToPluginMap: Map<string, string>;

  constructor({ setupWorkerConnection, workerUrl }: WorkerControllerArgs) {
    super();
    this.workerUrl = workerUrl;
    this.setupWorkerConnection = setupWorkerConnection;
    this.store = new ObservableStore({ workers: {} });
    this.workers = new Map();
    this.pluginToWorkerMap = new Map();
    this.workerToPluginMap = new Map();
  }

  _setWorker(workerId: string, workerObj: WorkerWrapper): void {
    this.workers.set(workerId, workerObj);

    const newWorkerState = {
      ...(this.store.getState().workers as Record<string, WorkerWrapper>),
      [workerId]: workerObj,
    };
    this.store.updateState({ workers: newWorkerState });
  }

  _deleteWorker(workerId: string): void {
    this.workers.delete(workerId);

    const newWorkerState = {
      ...(this.store.getState().workers as Record<string, WorkerWrapper>),
    };
    delete newWorkerState[workerId];
    this.store.updateState({ workers: newWorkerState });
  }

  async command(
    pluginName: string,
    message: JsonRpcRequest<unknown>,
  ): Promise<unknown> {
    const workerId = this.pluginToWorkerMap.get(pluginName);
    if (workerId === undefined) {
      throw new Error(`No worker found. workerId: ${workerId}`);
    }

    if (typeof message !== 'object') {
      throw new Error('Must send object.');
    }

    const workerObj = this.workers.get(workerId);
    if (!workerObj) {
      throw new Error(`Worker with id ${workerId} not found.`);
    }

    console.log('Parent: Sending Command', message);
    const response: PendingJsonRpcResponse<unknown> = await workerObj.rpcEngine.handle(
      message,
    );
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.result;
  }

  terminateAllPlugins(): void {
    for (const workerId of this.workers.keys()) {
      this.terminate(workerId);
    }
  }

  terminatePlugin(pluginName: string): void {
    const workerId = this.pluginToWorkerMap.get(pluginName);
    workerId && this.terminate(workerId);
  }

  terminate(workerId: string): void {
    const workerObj = this.workers.get(workerId);
    if (!workerObj) {
      throw new Error(`Worked with id "${workerId}" not found.`);
    }

    Object.values(workerObj.streams).forEach((stream) => {
      try {
        !stream.destroyed && stream.destroy();
        stream.removeAllListeners();
      } catch (err) {
        console.log('Error while destroying stream', err);
      }
    });
    workerObj.worker.terminate();
    this._removePluginAndWorkerMapping(workerId);
    this._deleteWorker(workerId);
    console.log(`worker:${workerId} terminated`);
  }

  async startPlugin(pluginData: PluginData): Promise<unknown> {
    // find worker by pluginName or use an existing workerId;
    const _workerId =
      this.pluginToWorkerMap.get(pluginData.pluginName) ||
      this.workers.keys().next()?.value;
    if (!_workerId) {
      throw new Error('No workers available.');
    }

    this._mapPluginAndWorker(pluginData.pluginName, _workerId);

    return this.command(pluginData.pluginName, {
      jsonrpc: '2.0',
      method: 'installPlugin',
      params: pluginData,
      id: nanoid(),
    });
  }

  /**
   * @returns The ID of the newly created worker.
   */
  async createPluginEnvironment(
    metadata: PluginWorkerMetadata,
  ): Promise<string> {
    return this._initWorker(metadata);
  }

  _mapPluginAndWorker(pluginName: string, workerId: string): void {
    this.pluginToWorkerMap.set(pluginName, workerId);
    this.workerToPluginMap.set(workerId, pluginName);
  }

  /**
   * @returns The ID of the plugin's worker.
   */
  _getWorkerForPlugin(pluginName: string): string | undefined {
    return this.pluginToWorkerMap.get(pluginName);
  }

  /**
   * @returns The ID worker's plugin.
   */
  _getPluginForWorker(workerId: string): string | undefined {
    return this.workerToPluginMap.get(workerId);
  }

  _removePluginAndWorkerMapping(workerId: string): void {
    const pluginName = this.workerToPluginMap.get(workerId);
    if (!pluginName) {
      throw new Error(`worker:${workerId} has no mapped plugin.`);
    }

    this.workerToPluginMap.delete(workerId);
    this.pluginToWorkerMap.delete(pluginName);
  }

  async _initWorker(metadata: PluginWorkerMetadata): Promise<string> {
    console.log('_initWorker');

    const workerId = nanoid();
    const worker = new Worker(this.workerUrl, {
      name: workerId,
    });
    const streams = this._initWorkerStreams(worker, workerId, metadata);
    const rpcEngine = new JsonRpcEngine();

    const jsonRpcConnection = createStreamMiddleware();

    pump(jsonRpcConnection.stream, streams.command, jsonRpcConnection.stream);

    rpcEngine.push(jsonRpcConnection.middleware);

    this._setWorker(workerId, {
      workerId,
      streams,
      rpcEngine,
      worker,
    });
    return workerId;
  }

  _initWorkerStreams(
    worker: Worker,
    workerId: string,
    metadata: PluginWorkerMetadata,
  ): WorkerStreams {
    const workerStream = new WorkerParentPostMessageStream({ worker });
    // Typecast justification: stream type mismatch
    const mux = setupMultiplex(
      (workerStream as unknown) as Duplex,
      `Worker:${workerId}`,
    );

    const commandStream = mux.createStream(PLUGIN_STREAM_NAMES.COMMAND);

    const rpcStream = mux.createStream(PLUGIN_STREAM_NAMES.JSON_RPC);
    this.setupWorkerConnection(metadata, (rpcStream as unknown) as Duplex);

    // Typecast justification: stream type mismatch
    return {
      command: (commandStream as unknown) as Duplex,
      rpc: (rpcStream as unknown) as Duplex,
      _connection: workerStream,
    };
  }
}

/**
 * Sets up stream multiplexing for the given stream
 * @param {any} connectionStream - the stream to mux
 * @param {string} streamName - the name of the stream, for identification in errors
 * @return {stream.Stream} the multiplexed stream
 */
function setupMultiplex(
  connectionStream: Duplex,
  streamName: string,
): ObjectMultiplex {
  const mux = new ObjectMultiplex();
  pump(
    connectionStream,
    // Typecast justification: stream type mismatch
    (mux as unknown) as Duplex,
    connectionStream,
    (err) => {
      if (err) {
        streamName
          ? console.error(`${streamName} stream failure.`, err)
          : console.error(err);
      }
    },
  );
  return mux;
}
