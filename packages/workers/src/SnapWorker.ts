import { Duplex } from 'stream';
import { MetaMaskInpageProvider } from '@metamask/inpage-provider';
import ObjectMultiplex from '@metamask/object-multiplex';
import pump from 'pump';
import { WorkerPostMessageStream } from '@metamask/post-message-stream';
import { SnapData, SnapProvider } from '@metamask/snap-types';
import type { JsonRpcId, JsonRpcRequest } from 'json-rpc-engine';
import { STREAM_NAMES } from './enums';

// eslint-disable-next-line import/no-unassigned-import
import 'ses/dist/lockdown.cjs';

declare global {
  const lockdown: any;
  const Compartment: any;
  const harden: <T>(value: T) => T;
}

type SnapRpcHandler = (
  origin: string,
  request: Record<string, unknown>,
) => Promise<unknown>;

interface SnapRpcRequest {
  origin: string;
  request: Record<string, unknown>;
  target: string;
}

lockdown({
  // TODO: Which would we use in prod?
  mathTaming: 'unsafe',
  errorTaming: 'unsafe',
  dateTaming: 'unsafe',
});

/**
 * TODO:
 * To support multiple snaps per worker, we need to duplex the rpcStream
 * on this end, and pass MetaMaskInpageProvider the appropriate stream name.
 */

// init
(function () {
  class Controller {
    private snapRpcHandlers: Map<string, SnapRpcHandler>;

    private initialized = false;

    private commandStream: Duplex;

    private rpcStream: Duplex;

    constructor() {
      this.snapRpcHandlers = new Map();
      this.commandStream = null as any;
      this.rpcStream = null as any;
    }

    initialize() {
      if (this.initialized) {
        return;
      }
      this.connectToParent();
    }

    private async connectToParent() {
      console.log('Worker: Connecting to parent.');

      const parentStream = new WorkerPostMessageStream();
      const mux = setupMultiplex(parentStream, 'Parent');

      this.commandStream = mux.createStream(STREAM_NAMES.COMMAND) as any;
      this.commandStream.on('data', this.onCommandRequest.bind(this));

      this.rpcStream = mux.createStream(STREAM_NAMES.JSON_RPC) as any;
    }

    private async onCommandRequest(message: JsonRpcRequest<unknown>) {
      if (!message || typeof message !== 'object' || Array.isArray(message)) {
        console.error('Command stream received non-object message.');
        return;
      }

      const { id, method, params } = message;

      if (
        id === null ||
        id === undefined ||
        (typeof id !== 'string' && typeof id !== 'number')
      ) {
        console.error(`Command stream received invalid id "${id}".`);
        return;
      }

      switch (method) {
        case 'executeSnap':
          this.executeSnap(id, params as unknown as SnapData);
          break;

        case 'ping':
          this.respond(id, { result: 'OK' });
          break;

        case 'snapRpc':
          await this.handleSnapRpc(id, params as unknown as SnapRpcRequest);
          break;

        default:
          this.respond(id, {
            error: new Error(`Unrecognized command: ${method}.`),
          });
          break;
      }
    }

    private respond(id: JsonRpcId, responseObj: Record<string, unknown>) {
      this.commandStream.write({
        ...responseObj,
        id,
        jsonrpc: '2.0',
      });
    }

    private async handleSnapRpc(
      id: JsonRpcId,
      { origin: requestOrigin, request, target }: SnapRpcRequest,
    ) {
      const handler = this.snapRpcHandlers.get(target);

      if (!handler) {
        this.respond(id, {
          error: new Error(`No RPC handler registered for snap "${target}".`),
        });
        return;
      }

      try {
        const result = await handler(requestOrigin, request);
        this.respond(id, { result });
      } catch (error) {
        this.respond(id, { error });
      }
    }

    private executeSnap(
      id: JsonRpcId,
      { snapName, sourceCode }: Partial<SnapData> = {},
    ) {
      if (!isTruthyString(snapName) || !isTruthyString(sourceCode)) {
        this.respond(id, {
          error: new Error('Invalid executeSnap parameters.'),
        });
        return;
      }

      try {
        this.startSnap(snapName as string, sourceCode as string);
        this.respond(id, { result: 'OK' });
      } catch (err) {
        this.respond(id, { error: err });
      }
    }

    /**
     * Attempts to evaluate a snap in SES.
     * Generates the APIs for the snap. May throw on error.
     *
     * @param {string} snapName - The name of the snap.
     * @param {Array<string>} approvedPermissions - The snap's approved permissions.
     * Should always be a value returned from the permissions controller.
     * @param {string} sourceCode - The source code of the snap, in IIFE format.
     * @param {Object} ethereumProvider - The snap's Ethereum provider object.
     */
    private startSnap(snapName: string, sourceCode: string) {
      console.log(`starting snap '${snapName}' in worker`);

      const wallet = this.createSnapProvider(snapName);

      const endowments = {
        BigInt,
        Buffer,
        console, // Adding raw console for now
        crypto,
        Date,
        fetch: self.fetch.bind(self),
        Math, // Math.random is considered unsafe, but we need it
        setTimeout,
        SubtleCrypto,
        wallet,
        WebSocket,
        XMLHttpRequest,
      };

      try {
        const compartment = new Compartment({
          ...endowments,
          window: { ...endowments },
        });
        compartment.evaluate(sourceCode);
      } catch (err) {
        this.removeSnap(snapName);
        console.error(
          `Error while running snap '${snapName}' in worker:${self.name}.`,
          err,
        );
      }
    }

    /**
     * Sets up the given snap's RPC message handler, creates a hardened
     * snap provider object (i.e. globalThis.wallet), and returns it.
     */
    private createSnapProvider(snapName: string): SnapProvider {
      const snapProvider = new MetaMaskInpageProvider(this.rpcStream as any, {
        shouldSendMetadata: false,
      }) as unknown as Partial<SnapProvider>;

      snapProvider.registerRpcMessageHandler = (func: SnapRpcHandler) => {
        console.log('Worker: Registering RPC message handler', func);
        if (this.snapRpcHandlers.has(snapName)) {
          throw new Error('RPC handler already registered.');
        }
        this.snapRpcHandlers.set(snapName, func);
      };

      // TODO: harden throws an error. Why?
      // return harden(snapProvider as SnapProvider);
      return snapProvider as SnapProvider;
    }

    /**
     * Removes the snap with the given name. Specifically:
     * - Deletes the snap's RPC handler, if any
     */
    private removeSnap(snapName: string): void {
      this.snapRpcHandlers.delete(snapName);
    }
  }

  function setupMultiplex(connectionStream: Duplex, streamName: string) {
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
