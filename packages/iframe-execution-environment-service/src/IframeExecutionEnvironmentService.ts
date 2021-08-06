import { Duplex } from 'stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import ObjectMultiplex from '@metamask/object-multiplex';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { PLUGIN_STREAM_NAMES } from '@mm-snap/workers';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { PluginData } from '@mm-snap/types';
import {
  JsonRpcEngine,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { ExecutionEnvironmentService } from '@mm-snap/controllers';

export type SetupPluginProvider = (pluginName: string, stream: Duplex) => void;

interface IframeExecutionEnvironmentServiceArgs {
  createWindowTimeout?: number;
  setupPluginProvider: SetupPluginProvider;
  iframeUrl: URL;
}

interface JobStreams {
  command: Duplex;
  rpc: Duplex | null;
  _connection: WindowPostMessageStream;
}

// The plugin is the callee
export type PluginRpcHook = (
  origin: string,
  request: Record<string, unknown>,
) => Promise<unknown>;

interface EnvMetadata {
  id: string;
  streams: JobStreams;
  rpcEngine: JsonRpcEngine;
}

export class IframeExecutionEnvironmentService
  implements ExecutionEnvironmentService
{
  private _pluginRpcHooks: Map<string, PluginRpcHook>;

  public _iframeWindow?: Window;

  public iframeUrl: URL;

  private jobs: Map<string, EnvMetadata>;

  private setupPluginProvider: SetupPluginProvider;

  private pluginToJobMap: Map<string, string>;

  private jobToPluginMap: Map<string, string>;

  private _createWindowTimeout: number;

  constructor({
    setupPluginProvider,
    iframeUrl,
    createWindowTimeout = 60000,
  }: IframeExecutionEnvironmentServiceArgs) {
    this._createWindowTimeout = createWindowTimeout;
    this.iframeUrl = iframeUrl;
    this.setupPluginProvider = setupPluginProvider;
    this.jobs = new Map();
    this.pluginToJobMap = new Map();
    this.jobToPluginMap = new Map();
    this._pluginRpcHooks = new Map();
  }

  private _setJob(jobId: string, jobWrapper: EnvMetadata): void {
    this.jobs.set(jobId, jobWrapper);
  }

  private _deleteJob(jobId: string): void {
    this.jobs.delete(jobId);
  }

  private async _command(
    jobId: string,
    message: JsonRpcRequest<unknown>,
  ): Promise<unknown> {
    if (typeof message !== 'object') {
      throw new Error('Must send object.');
    }

    const jobWrapper = this.jobs.get(jobId);
    if (!jobWrapper) {
      throw new Error(`Job with id "${jobId}" not found.`);
    }

    console.log('Parent: Sending Command', message);
    const response: PendingJsonRpcResponse<unknown> =
      await jobWrapper.rpcEngine.handle(message);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.result;
  }

  public async terminateAllPlugins() {
    for (const jobId of this.jobs.keys()) {
      this.terminate(jobId);
    }
    this._pluginRpcHooks.clear();
  }

  public async terminatePlugin(pluginName: string) {
    const jobId = this.pluginToJobMap.get(pluginName);
    jobId && this.terminate(jobId);
    this._removePluginHooks(pluginName);
  }

  public terminate(jobId: string): void {
    const jobWrapper = this.jobs.get(jobId);
    if (!jobWrapper) {
      throw new Error(`Job with id "${jobId}" not found.`);
    }

    Object.values(jobWrapper.streams).forEach((stream) => {
      try {
        !stream.destroyed && stream.destroy();
        stream.removeAllListeners();
      } catch (err) {
        console.log('Error while destroying stream', err);
      }
    });
    document.getElementById(jobWrapper.id)?.remove();
    this._removePluginAndJobMapping(jobId);
    this._deleteJob(jobId);
    console.log(`job: "${jobId}" terminated`);
  }

  /**
   * Gets the RPC message handler for the given plugin.
   *
   * @param pluginName - The name of the plugin whose message handler to get.
   */
  public async getRpcMessageHandler(pluginName: string) {
    return this._pluginRpcHooks.get(pluginName);
  }

  private _removePluginHooks(pluginName: string) {
    this._pluginRpcHooks.delete(pluginName);
  }

  private _createPluginHooks(pluginName: string, jobId: string) {
    const rpcHook = async (
      origin: string,
      request: Record<string, unknown>,
    ) => {
      return await this._command(jobId, {
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

  public async executePlugin(pluginData: PluginData): Promise<unknown> {
    if (this.pluginToJobMap.has(pluginData.pluginName)) {
      throw new Error(
        `Plugin "${pluginData.pluginName}" is already being executed.`,
      );
    }

    const job = await this._init();
    this._mapPluginAndJob(pluginData.pluginName, job.id);
    this.setupPluginProvider(
      pluginData.pluginName,
      job.streams.rpc as unknown as Duplex,
    );

    const result = await this._command(job.id, {
      jsonrpc: '2.0',
      method: 'executePlugin',
      params: pluginData,
      id: nanoid(),
    });
    this._createPluginHooks(pluginData.pluginName, job.id);
    return result;
  }

  private _mapPluginAndJob(pluginName: string, jobId: string): void {
    this.pluginToJobMap.set(pluginName, jobId);
    this.jobToPluginMap.set(jobId, pluginName);
  }

  /**
   * @returns The ID of the plugin's job.
   */
  private _getJobForPlugin(pluginName: string): string | undefined {
    return this.pluginToJobMap.get(pluginName);
  }

  /**
   * @returns The ID job's plugin.
   */
  private _getPluginForJob(jobId: string): string | undefined {
    return this.jobToPluginMap.get(jobId);
  }

  private _removePluginAndJobMapping(jobId: string): void {
    const pluginName = this.jobToPluginMap.get(jobId);
    if (!pluginName) {
      throw new Error(`job: "${jobId}" has no mapped plugin.`);
    }

    this.jobToPluginMap.delete(jobId);
    this.pluginToJobMap.delete(pluginName);
  }

  private async _init(): Promise<EnvMetadata> {
    const jobId = nanoid();
    const streams = await this._initStreams(jobId);
    const rpcEngine = new JsonRpcEngine();

    const jsonRpcConnection = createStreamMiddleware();

    pump(jsonRpcConnection.stream, streams.command, jsonRpcConnection.stream);

    rpcEngine.push(jsonRpcConnection.middleware);

    const envMetadata = {
      id: jobId,
      streams,
      rpcEngine,
    };
    this._setJob(jobId, envMetadata);

    await this._command(jobId, {
      jsonrpc: '2.0',
      method: 'handshake',
      id: nanoid(),
    });

    return envMetadata;
  }

  private async _initStreams(jobId: string): Promise<any> {
    this._iframeWindow = await this._createWindow(
      this.iframeUrl.toString(),
      jobId,
      this._createWindowTimeout,
    );
    const envStream = new WindowPostMessageStream({
      name: 'parent',
      target: 'child',
      targetWindow: this._iframeWindow,
    });
    // Typecast justification: stream type mismatch
    const mux = setupMultiplex(
      envStream as unknown as Duplex,
      `Job: "${jobId}"`,
    );

    const commandStream = mux.createStream(PLUGIN_STREAM_NAMES.COMMAND);
    commandStream.write({
      jsonrpc: '2.0',
      method: 'handshake',
      params: [],
      id: 0,
    });
    const rpcStream = mux.createStream(PLUGIN_STREAM_NAMES.JSON_RPC);

    // Typecast: stream type mismatch
    return {
      command: commandStream as unknown as Duplex,
      rpc: rpcStream,
      _connection: envStream,
    };
  }

  private _createWindow(
    uri: string,
    jobId: string,
    timeout: number,
  ): Promise<Window> {
    const iframe = document.createElement('iframe');
    return new Promise((resolve, reject) => {
      const errorTimeout = setTimeout(() => {
        iframe.remove();
        reject(new Error(`Timed out creating iframe window: "${uri}"`));
      }, timeout);
      iframe.addEventListener('load', () => {
        if (iframe.contentWindow) {
          clearTimeout(errorTimeout);
          resolve(iframe.contentWindow);
        }
      });
      document.body.appendChild(iframe);
      iframe.setAttribute('src', uri);
      iframe.setAttribute('id', jobId);
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
    mux as unknown as Duplex,
    connectionStream,
    (err) => {
      if (err) {
        streamName
          ? console.error(`"${streamName}" stream failure.`, err)
          : console.error(err);
      }
    },
  );
  return mux;
}
