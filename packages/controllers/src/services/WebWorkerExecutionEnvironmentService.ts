import { Duplex } from 'stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import { ObservableStore } from '@metamask/obs-store';
import ObjectMultiplex from '@metamask/object-multiplex';
import { WorkerParentPostMessageStream } from '@metamask/post-message-stream';
import { PLUGIN_STREAM_NAMES } from '@metamask/snap-workers';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { PluginData, ServiceMessenger } from '@metamask/snap-types';
import {
  JsonRpcEngine,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { ExecutionEnvironmentService } from './ExecutionEnvironmentService';

export type SetupPluginProvider = (pluginName: string, stream: Duplex) => void;

interface WorkerControllerArgs {
  setupPluginProvider: SetupPluginProvider;
  workerUrl: URL;
  messenger: ServiceMessenger;
}

interface WorkerStreams {
  command: Duplex;
  rpc: Duplex | null;
  _connection: WorkerParentPostMessageStream;
}

// The plugin is the callee
export type PluginRpcHook = (
  origin: string,
  request: Record<string, unknown>,
) => Promise<unknown>;

interface WorkerWrapper {
  id: string;
  streams: WorkerStreams;
  rpcEngine: JsonRpcEngine;
  worker: Worker;
}

export class WebWorkerExecutionEnvironmentService
  implements ExecutionEnvironmentService
{
  public store: ObservableStore<{ workers: Record<string, WorkerWrapper> }>;

  private _pluginRpcHooks: Map<string, PluginRpcHook>;

  private workerUrl: URL;

  private workers: Map<string, WorkerWrapper>;

  private setupPluginProvider: SetupPluginProvider;

  private pluginToWorkerMap: Map<string, string>;

  private workerToPluginMap: Map<string, string>;

  private _messenger: ServiceMessenger;

  constructor({
    setupPluginProvider,
    workerUrl,
    messenger,
  }: WorkerControllerArgs) {
    this.workerUrl = workerUrl;
    this.setupPluginProvider = setupPluginProvider;
    this.store = new ObservableStore({ workers: {} });
    this.workers = new Map();
    this.pluginToWorkerMap = new Map();
    this.workerToPluginMap = new Map();
    this._pluginRpcHooks = new Map();
    this._messenger = messenger;
  }

  private _setWorker(workerId: string, workerWrapper: WorkerWrapper): void {
    this.workers.set(workerId, workerWrapper);

    const newWorkerState = {
      ...(this.store.getState().workers as Record<string, WorkerWrapper>),
      [workerId]: workerWrapper,
    };
    this.store.updateState({ workers: newWorkerState });
  }

  private _deleteWorker(workerId: string): void {
    this.workers.delete(workerId);

    const newWorkerState = {
      ...(this.store.getState().workers as Record<string, WorkerWrapper>),
    };
    delete newWorkerState[workerId];
    this.store.updateState({ workers: newWorkerState });
  }

  private async _command(
    workerId: string,
    message: JsonRpcRequest<unknown>,
  ): Promise<unknown> {
    if (typeof message !== 'object') {
      throw new Error('Must send object.');
    }

    const workerWrapper = this.workers.get(workerId);
    if (!workerWrapper) {
      throw new Error(`Worker with id ${workerId} not found.`);
    }

    console.log('Parent: Sending Command', message);
    const response: PendingJsonRpcResponse<unknown> =
      await workerWrapper.rpcEngine.handle(message);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.result;
  }

  async terminateAllPlugins() {
    for (const workerId of this.workers.keys()) {
      this.terminate(workerId);
    }
    this._pluginRpcHooks.clear();
  }

  async terminatePlugin(pluginName: string) {
    const workerId = this.pluginToWorkerMap.get(pluginName);
    workerId && this.terminate(workerId);
    this._removePluginHooks(pluginName);
  }

  terminate(workerId: string): void {
    const workerWrapper = this.workers.get(workerId);
    if (!workerWrapper) {
      throw new Error(`Worked with id "${workerId}" not found.`);
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
    this._removePluginAndWorkerMapping(workerId);
    this._deleteWorker(workerId);
    console.log(`worker:${workerId} terminated`);
  }

  /**
   * Gets the RPC message handler for the given plugin.
   *
   * @param pluginName - The name of the plugin whose message handler to get.
   */
  async getRpcMessageHandler(pluginName: string) {
    return this._pluginRpcHooks.get(pluginName);
  }

  private _removePluginHooks(pluginName: string) {
    this._pluginRpcHooks.delete(pluginName);
  }

  private _createPluginHooks(pluginName: string, workerId: string) {
    const rpcHook = async (
      origin: string,
      request: Record<string, unknown>,
    ) => {
      return await this._command(workerId, {
        id: nanoid(),
        jsonrpc: '2.0',
        method: 'pluginRpc',
        params: {
          origin,
          request,
          target: pluginName,
        },
      });
    };

    this._pluginRpcHooks.set(pluginName, rpcHook);
  }

  async executePlugin(pluginData: PluginData): Promise<unknown> {
    if (this.pluginToWorkerMap.has(pluginData.pluginName)) {
      throw new Error(
        `Plugin "${pluginData.pluginName}" is already being executed.`,
      );
    }

    const worker = await this._initWorker();
    this._mapPluginAndWorker(pluginData.pluginName, worker.id);
    this.setupPluginProvider(
      pluginData.pluginName,
      worker.streams.rpc as unknown as Duplex,
    );

    const result = await this._command(worker.id, {
      jsonrpc: '2.0',
      method: 'executePlugin',
      params: pluginData,
      id: nanoid(),
    });
    this._createPluginHooks(pluginData.pluginName, worker.id);
    return result;
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

  private async _initWorker(): Promise<WorkerWrapper> {
    const workerId = nanoid();
    const worker = new Worker(this.workerUrl, {
      name: workerId,
    });
    // Handle out-of-band errors, i.e. errors thrown from the plugin outside of the req/res cycle.
    const errorHandler = (ev: ErrorEvent) => {
      if (this._messenger) {
        const pluginName = this.workerToPluginMap.get(workerId);
        if (pluginName) {
          this._messenger.publish(
            'ServiceMessenger:unhandledError',
            pluginName,
            {
              code: ev.error.code,
              message: ev.error.message,
              data: ev.error.data,
            },
          );
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

    const commandStream = mux.createStream(PLUGIN_STREAM_NAMES.COMMAND);

    const rpcStream = mux.createStream(PLUGIN_STREAM_NAMES.JSON_RPC);

    // Typecast: stream type mismatch
    return {
      command: commandStream as unknown as Duplex,
      rpc: rpcStream,
      _connection: workerStream,
    };
  }
}

/**
 * Sets up stream multiplexing for the given stream.
 *
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
    // Typecast: stream type mismatch
    mux as unknown as Duplex,
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
