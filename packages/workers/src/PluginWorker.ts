import { Duplex } from 'stream';
import { MetaMaskInpageProvider } from '@metamask/inpage-provider';
import ObjectMultiplex from '@metamask/object-multiplex';
import pump from 'pump';
import { WorkerPostMessageStream } from '@mm-snap/post-message-stream';
import { STREAM_NAMES } from './enums';

// eslint-disable-next-line import/no-unassigned-import
import 'ses/dist/lockdown.cjs';

declare global {
  const lockdown: any;
  const Compartment: any;
  const harden: <T>(value: T) => T;
}

type PluginRpcHandler = (origin: string, request: Record<string, unknown>) => Promise<unknown>;

interface CommandRequest {
  id: number;
  command: string;
  data?: string | Record<string, unknown>;
}

interface RequestedPlugin {
  pluginName: string;
  sourceCode: string;
}

interface PluginRpcRequest {
  origin: string;
  request: Record<string, unknown>;
  target: string;
}

interface PluginProvider extends MetaMaskInpageProvider {
  registerRpcMessageHandler: (handler: PluginRpcHandler) => void;
}

lockdown({
  // TODO: Which would we use in prod?
  mathTaming: 'unsafe',
  errorTaming: 'unsafe',
  dateTaming: 'unsafe',
});

// init
(function () {
  class Controller {
    private pluginRpcHandlers: Map<string, PluginRpcHandler>;

    private _initialized = false;

    private commandStream: Duplex;

    private rpcStream: Duplex;

    constructor() {
      this.pluginRpcHandlers = new Map();
      this.commandStream = null as any;
      this.rpcStream = null as any;
    }

    initialize() {
      if (this._initialized) {
        return;
      }
      this._connectToParent();
    }

    private async _connectToParent() {
      console.log('CONNECTING TO PARENT');

      const parentStream = new WorkerPostMessageStream();
      const mux = setupMultiplex(parentStream, 'Parent');

      this.commandStream = mux.createStream(STREAM_NAMES.COMMAND) as any;
      this.commandStream.on('data', this._onCommandRequest.bind(this));

      this.rpcStream = mux.createStream(STREAM_NAMES.JSON_RPC) as any;
    }

    private async _onCommandRequest(message: CommandRequest) {
      if (!message || typeof message !== 'object' || Array.isArray(message)) {
        console.error('Command stream received non-object message.');
        return;
      }

      const { id, command, data } = message;

      switch (command) {
        case 'installPlugin':
          this.installPlugin(id, data as unknown as RequestedPlugin);
          break;

        case 'ping':
          this._respond(id, { result: 'OK' });
          break;

        case 'pluginRpc':
          await this._handlePluginRpc(id, data as unknown as PluginRpcRequest);
          break;

        default:
          console.error(`Unrecognized command: ${command}.`);
          break;
      }
    }

    private _respond(id: number, responseObj: Record<string, unknown>) {
      this.commandStream.write({ ...responseObj, id });
    }

    private async _handlePluginRpc(id: number, { origin, request, target }: PluginRpcRequest) {
      const handler = this.pluginRpcHandlers.get(target);

      if (!handler) {
        this._respond(id, {
          error: new Error(`No RPC handler registered for plugin "${target}".`),
        });
        return;
      }

      try {
        const result = await handler(origin, request);
        this._respond(id, { result });
      } catch (error) {
        this._respond(id, { error });
      }
    }

    private installPlugin(id: number, {
      pluginName,
      sourceCode,
    }: Partial<RequestedPlugin> = {}) {
      if (!isTruthyString(pluginName) || !isTruthyString(sourceCode)) {
        this._respond(id, {
          error: new Error('Invalid installPlugin parameters.'),
        });
        return;
      }

      try {
        this._startPlugin(
          pluginName as string,
          sourceCode as string,
        );
        this._respond(id, { result: 'OK' });
      } catch (err) {
        this._respond(id, { error: err });
      }
    }

    /**
     * Attempts to evaluate a plugin in SES.
     * Generates the APIs for the plugin. May throw on error.
     *
     * @param {string} pluginName - The name of the plugin.
     * @param {Array<string>} approvedPermissions - The plugin's approved permissions.
     * Should always be a value returned from the permissions controller.
     * @param {string} sourceCode - The source code of the plugin, in IIFE format.
     * @param {Object} ethereumProvider - The plugin's Ethereum provider object.
     */
    private _startPlugin(
      pluginName: string,
      sourceCode: string,
    ) {
      console.log(`starting plugin '${pluginName}' in worker`);

      const wallet = this.createPluginProvider(pluginName);

      try {
        const compartment = new Compartment({
          wallet,
          console, // Adding console for now for logging purposes.
          BigInt,
          setTimeout,
          crypto,
          SubtleCrypto,
          fetch,
          XMLHttpRequest,
          WebSocket,
          Buffer,
          Date,

          window: {
            crypto,
            SubtleCrypto,
            setTimeout,
            fetch,
            XMLHttpRequest,
            WebSocket,
          },
        });
        compartment.evaluate(sourceCode);
      } catch (err) {
        // _removePlugin(pluginName) // TODO:WW
        console.error(
          `Error while running plugin '${pluginName}' in worker:${self.name}.`,
          err,
        );
      }
    }

    /**
     * Sets up the given plugin's RPC message handler, creates a hardened
     * plugin provider object (i.e. globalThis.wallet), and returns it.
     */
    private createPluginProvider(pluginName: string): PluginProvider {
      const pluginProvider = new MetaMaskInpageProvider(this.rpcStream as any, {
        shouldSendMetadata: false,
      }) as unknown as Partial<PluginProvider>;

      pluginProvider.registerRpcMessageHandler = (func: PluginRpcHandler) => {
        if (this.pluginRpcHandlers.has(pluginName)) {
          throw new Error('RPC handler already registered.');
        }
        this.pluginRpcHandlers.set(pluginName, func);
      };

      return harden(pluginProvider as PluginProvider);
    }
  }

  function setupMultiplex(
    connectionStream: Duplex,
    streamName: string,
  ) {
    const mux = new ObjectMultiplex();
    pump(connectionStream, mux as any, connectionStream, (err) => {
      if (err) {
        console.error(`${streamName} stream failure, closing worker.`, err);
      }
      self.close();
    });
    return mux;
  }

  function isTruthyString(value?: unknown): boolean {
    return typeof value === 'string' && Boolean(value);
  }

  const controller = new Controller();
  controller.initialize();
})();
