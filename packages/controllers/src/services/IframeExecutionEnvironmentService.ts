import { Duplex } from 'stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import { ObservableStore } from '@metamask/obs-store';
import ObjectMultiplex from '@metamask/object-multiplex';
import {
  WindowPostMessageStream,
  WorkerParentPostMessageStream,
} from '@metamask/post-message-stream';
import { PLUGIN_STREAM_NAMES } from '@mm-snap/workers';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { PluginData } from '@mm-snap/types';
import {
  JsonRpcEngine,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { ExecutionEnvironmentService } from '../services/ExecutionEnvironmentService';

export type SetupPluginProvider = (pluginName: string, stream: Duplex) => void;

interface WorkerControllerArgs {
  setupPluginProvider: SetupPluginProvider;
  iframeUrl: URL;
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

interface EnvMetadata {
  id: string;
  streams: WorkerStreams;
  rpcEngine: JsonRpcEngine;
}

export class IframeExecutionEnvironmentService
  implements ExecutionEnvironmentService {
  public store: ObservableStore<{ workers: Record<string, EnvMetadata> }>;

  private _pluginRpcHooks: Map<string, PluginRpcHook>;

  private iframeUrl: URL;

  private workers: Map<string, EnvMetadata>;

  private setupPluginProvider: SetupPluginProvider;

  private pluginToWorkerMap: Map<string, string>;

  private workerToPluginMap: Map<string, string>;

  constructor({ setupPluginProvider, iframeUrl }: WorkerControllerArgs) {
    this.iframeUrl = iframeUrl;
    this.setupPluginProvider = setupPluginProvider;
    this.store = new ObservableStore({ workers: {} });
    this.workers = new Map();
    this.pluginToWorkerMap = new Map();
    this.workerToPluginMap = new Map();
    this._pluginRpcHooks = new Map();
  }

  private _setWorker(workerId: string, workerWrapper: EnvMetadata): void {
    this.workers.set(workerId, workerWrapper);

    const newWorkerState = {
      ...(this.store.getState().workers as Record<string, EnvMetadata>),
      [workerId]: workerWrapper,
    };
    this.store.updateState({ workers: newWorkerState });
  }

  private _deleteWorker(workerId: string): void {
    this.workers.delete(workerId);

    const newWorkerState = {
      ...(this.store.getState().workers as Record<string, EnvMetadata>),
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
    const response: PendingJsonRpcResponse<unknown> = await workerWrapper.rpcEngine.handle(
      message,
    );
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
    document.getElementById(workerWrapper.id)?.remove();
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

    const worker = await this._init();
    this._mapPluginAndWorker(pluginData.pluginName, worker.id);
    this.setupPluginProvider(
      pluginData.pluginName,
      (worker.streams.rpc as unknown) as Duplex,
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

  private async _init(): Promise<EnvMetadata> {
    const workerId = nanoid();
    console.log('calling init', workerId);
    const streams = await this._initStreams(workerId);
    const rpcEngine = new JsonRpcEngine();

    const jsonRpcConnection = createStreamMiddleware();

    pump(jsonRpcConnection.stream, streams.command, jsonRpcConnection.stream);

    rpcEngine.push(jsonRpcConnection.middleware);

    const envMetadata = {
      id: workerId,
      streams,
      rpcEngine,
    };
    this._setWorker(workerId, envMetadata);
    console.log('calling handshake', workerId);

    await this._command(workerId, {
      jsonrpc: '2.0',
      method: 'handshake',
      id: nanoid(),
    });

    return envMetadata;
  }

  async _initStreams(envId: string): Promise<any> {
    const iframeWindow = await this._createWindow(
      this.iframeUrl.toString(),
      envId,
    );
    console.log('created iframe', envId);
    const envStream = new WindowPostMessageStream({
      name: 'parent',
      target: 'child',
      targetWindow: iframeWindow,
    });
    // Typecast justification: stream type mismatch
    const mux = setupMultiplex(
      (envStream as unknown) as Duplex,
      `Environment:${envId}`,
    );

    const commandStream = mux.createStream(PLUGIN_STREAM_NAMES.COMMAND);

    const rpcStream = mux.createStream(PLUGIN_STREAM_NAMES.JSON_RPC);

    // Typecast: stream type mismatch
    return {
      command: (commandStream as unknown) as Duplex,
      rpc: rpcStream,
      _connection: envStream,
    };
  }

  _createWindow(uri: string, envId: string): Promise<Window> {
    const iframe = document.createElement('iframe');
    return new Promise((resolve) => {
      const resolved = false;
      iframe.addEventListener('load', () => {
        if (resolved) {
          return;
        }
        if (iframe.contentWindow) {
          resolve(iframe.contentWindow);
        }
      });
      document.body.appendChild(iframe);
      iframe.setAttribute('src', uri);
      iframe.setAttribute('id', envId);
    });
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
