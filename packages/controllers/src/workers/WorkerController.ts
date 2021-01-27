import fs from 'fs';
import { Duplex } from 'stream';
import Dnode from 'dnode';
import { nanoid } from 'nanoid';
import pump from 'pump';
import { ObservableStore } from '@metamask/obs-store';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import ObjectMultiplex from '@metamask/object-multiplex';
import { WorkerParentPostMessageStream } from '@mm-snap/post-message-stream';
import { STREAM_NAMES as PLUGIN_STREAM_NAMES } from '@mm-snap/workers';

import { CommandEngine, CommandMessage, CommandResponse } from './CommandEngine';

type SetupWorkerConnection = (metadata: any, stream: Duplex) => void;

// TODO:27
interface PluginData {
  pluginName: string;
  [key: string]: unknown;
}

type PluginWorkerMetadata = Record<string, unknown>;

/**
 *  pluginName,
 *  sourceCode,
 *  backgroundApiKeys: apiKeys,
 */

type GetApiFunction = () => Record<string, unknown>;
// end:TODO:27

interface WebWorkerControllerArgs {
  setupWorkerConnection: SetupWorkerConnection;
}

interface WorkerStreams {
  api: Duplex;
  command: Duplex;
  rpc: Duplex;
  _connection: WorkerParentPostMessageStream;
}

// { id: workerId, streams, commandEngine, worker }
interface WorkerWrapper {
  id: string;
  streams: WorkerStreams;
  commandEngine: CommandEngine;
  worker: Worker;
}

/* eslint-disable node/no-sync */
// Our brfs transform is extremely cranky, and will not apply itself unless
// fs.readFileSync is called here, at the top-level, outside any function, with
// a string literal path, and no encoding parameter ._.
const WORKER_TYPES = {
  plugin: {
    url: getWorkerUrl(
      fs
        .readFileSync(
          require.resolve('@mm-snap/workers/dist/pluginWorker.js'),
        )
        .toString(),
    ),
  },
};
/* eslint-enable node/no-sync */

function getWorkerUrl(workerSrc: string) {
  // the worker must be an IIFE file
  return URL.createObjectURL(
    new Blob([workerSrc], { type: 'application/javascript' }),
  );
}

export class WebWorkerController extends SafeEventEmitter {
  public store: ObservableStore;

  private workers: Map<string, WorkerWrapper>;

  private _setupWorkerConnection: SetupWorkerConnection;

  private pluginToWorkerMap: Map<string, string>;

  private workerToPluginMap: Map<string, string>;

  constructor({ setupWorkerConnection }: WebWorkerControllerArgs) {
    super();
    this._setupWorkerConnection = setupWorkerConnection;
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
    workerId: string,
    message: CommandMessage,
    timeout?: number,
  ): Promise<CommandResponse> {
    if (typeof message !== 'object') {
      throw new Error('Must send object.');
    }

    const workerObj = this.workers.get(workerId);
    if (!workerObj) {
      throw new Error(`Worker with id ${workerId} not found.`);
    }

    console.log('Parent: Sending Command', message);

    return await workerObj.commandEngine.command(message, timeout);
  }

  terminateAll(): void {
    for (const workerId of this.workers.keys()) {
      this.terminate(workerId);
    }
  }

  terminateWorkerOf(pluginName: string): void {
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

  async startPlugin(
    workerId: string,
    pluginData: PluginData,
  ): Promise<CommandResponse> {
    const _workerId: string = workerId || this.workers.keys().next()?.value();
    if (!_workerId) {
      throw new Error('No workers available.');
    }

    this._mapPluginAndWorker(pluginData.pluginName, workerId);

    return await this.command(_workerId, {
      command: 'installPlugin',
      data: pluginData,
    });
  }

  /**
   * @returns The ID of the newly created worker.
   */
  async createPluginWorker(
    metadata: PluginWorkerMetadata,
    getApiFunction: GetApiFunction,
  ): Promise<string> {
    return this._initWorker('plugin', metadata, getApiFunction);
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

  async _initWorker(
    type: keyof typeof WORKER_TYPES,
    metadata: PluginWorkerMetadata,
    getApiFunction: GetApiFunction,
  ): Promise<string> {
    console.log('_initWorker');

    if (!WORKER_TYPES[type]) {
      throw new Error('Unrecognized worker type.');
    }

    const workerId = nanoid();
    const worker = new Worker(WORKER_TYPES[type].url, { name: workerId });
    const streams = this._initWorkerStreams(
      worker,
      workerId,
      getApiFunction,
      metadata,
    );
    const commandEngine = new CommandEngine(
      workerId,
      streams.command,
    );

    this._setWorker(workerId, { id: workerId, streams, commandEngine, worker });
    await this.command(workerId, { command: 'ping' });
    return workerId;
  }

  _initWorkerStreams(
    worker: Worker,
    workerId: string,
    getApiFunction: GetApiFunction,
    metadata: PluginWorkerMetadata,
  ): WorkerStreams {
    const workerStream = new WorkerParentPostMessageStream({ worker });
    const mux = setupMultiplex(workerStream as unknown as Duplex, `Worker:${workerId}`);

    const commandStream = mux.createStream(PLUGIN_STREAM_NAMES.COMMAND);

    const rpcStream = mux.createStream(PLUGIN_STREAM_NAMES.JSON_RPC);
    // Typecast justification: stream type mismatch
    this._setupWorkerConnection(metadata, (rpcStream as unknown) as Duplex);

    // Typecast justification: stream type mismatch
    const apiStream = mux.createStream(PLUGIN_STREAM_NAMES.BACKGROUND_API) as unknown as Duplex;
    const dnode = Dnode(getApiFunction()) as unknown as Duplex;

    pump(
      apiStream,
      dnode,
      apiStream,
      (err) => {
        if (err) {
          console.error(`Worker:${workerId} dnode stream failure.`, err);
        }
      },
    );

    // Typecast justification: stream type mismatch
    return {
      api: (apiStream as unknown) as Duplex,
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
