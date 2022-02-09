import { Duplex } from 'stream';
import { MetaMaskInpageProvider } from '@metamask/inpage-provider';
import { SnapProvider } from '@metamask/snap-types';
import { errorCodes, ethErrors, serializeError } from 'eth-rpc-errors';
/* eslint-disable-next-line import/no-unassigned-import */
import 'ses';
import EEOpenRPCDocument from '../openrpc.json';
import {
  Endowments,
  JSONRPCID,
  JsonRpcRequest,
} from '../__GENERATED__/openrpc';
import { isJsonRpcRequest } from '../__GENERATED__/openrpc.guard';
import { rpcMethods, RpcMethodsMapping } from './rpcMethods';
import { sortParamKeys } from './sortParams';
import { createTimeout } from './timeout';

type SnapRpcHandler = (
  origin: string,
  request: JsonRpcRequest,
) => Promise<unknown>;

const fallbackError = {
  code: errorCodes.rpc.internal,
  message: 'Execution Environment Error',
};

export class BaseController {
  private snapRpcHandlers: Map<string, SnapRpcHandler>;

  private commandStream: Duplex;

  private rpcStream: Duplex;

  private methods: RpcMethodsMapping;

  private snapErrorHandler?: (event: ErrorEvent) => void;

  private snapPromiseErrorHandler?: (event: PromiseRejectionEvent) => void;

  protected constructor(commandStream: Duplex, rpcStream: Duplex) {
    this.snapRpcHandlers = new Map();
    this.commandStream = commandStream;
    this.commandStream.on('data', this.onCommandRequest.bind(this));
    this.rpcStream = rpcStream;

    this.methods = rpcMethods(
      this.startSnap.bind(this),
      (target, origin, request) => {
        const handler = this.snapRpcHandlers.get(target);
        if (!handler) {
          throw new Error(`No RPC handler registered for snap "${target}`);
        }
        return handler(origin, request);
      },
    );
  }

  private errorHandler(error: Error, data = {}) {
    const serializedError = serializeError(error, {
      fallbackError,
      shouldIncludeStack: true,
    });
    this.notify({
      error: {
        ...serializedError,
        data: {
          ...data,
          stack: serializedError.stack,
        },
      },
    });
  }

  private async onCommandRequest(message: JsonRpcRequest) {
    if (!isJsonRpcRequest(message)) {
      throw new Error('Command stream received a non Json Rpc Request');
    }

    const { id, method, params } = message;

    if (id === undefined) {
      throw new Error('Notifications not supported');
    }

    if (method === 'rpc.discover') {
      this.respond(id, {
        result: EEOpenRPCDocument,
      });
      return;
    }

    const methodObject = EEOpenRPCDocument.methods.find(
      (m) => m.name === method,
    );

    if (!methodObject || !(this.methods as any)[method]) {
      this.respond(id, {
        error: ethErrors.rpc
          .methodNotFound({
            data: {
              method,
            },
          })
          .serialize(),
      });
      return;
    }

    // support params by-name and by-position
    const paramsAsArray = sortParamKeys(methodObject, params);

    try {
      const result = await (this.methods as any)[method](...paramsAsArray);
      this.respond(id, { result });
    } catch (e) {
      this.respond(id, {
        error: serializeError(e, {
          fallbackError,
        }),
      });
    }
  }

  protected notify(requestObject: Record<string, unknown>) {
    this.commandStream.write({
      ...requestObject,
      jsonrpc: '2.0',
    });
  }

  protected respond(id: JSONRPCID, responseObj: Record<string, unknown>) {
    this.commandStream.write({
      ...responseObj,
      id,
      jsonrpc: '2.0',
    });
  }

  /**
   * Attempts to evaluate a snap in SES.
   * Generates the APIs for the snap. May throw on error.
   *
   * @param {string} snapName - The name of the snap.
   * @param {Array<string>} approvedPermissions - The snap's approved permissions.
   * Should always be a value returned from the permissions controller.
   * @param {string} sourceCode - The source code of the snap, in IIFE format.
   * @param {Array} endowments - An array of the names of the endowments.
   */
  protected startSnap(
    snapName: string,
    sourceCode: string,
    _endowments: Endowments,
  ) {
    console.log(`starting snap '${snapName}' in worker`);
    if (this.snapPromiseErrorHandler) {
      self?.removeEventListener(
        'unhandledrejection',
        this.snapPromiseErrorHandler,
      );
    }

    if (this.snapErrorHandler) {
      self?.removeEventListener('error', this.snapErrorHandler);
    }

    const wallet = this.createSnapProvider(snapName);

    const endowments: Record<string, any> = {
      BigInt,
      Buffer,
      console,
      crypto: self.crypto,
      Date,
      Math,
      SubtleCrypto: self.SubtleCrypto,
      wallet,
      ...createTimeout(),
    };

    _endowments.forEach((_endowment) => {
      if (!(_endowment in self)) {
        throw new Error(`Unknown endowment: "${_endowment}".`);
      }

      const globalValue = (self as any)[_endowment];
      endowments[_endowment] =
        typeof globalValue === 'function'
          ? globalValue.bind(self)
          : globalValue;
    });

    this.snapErrorHandler = (error: ErrorEvent) => {
      this.errorHandler(error.error, { snapName });
    };

    this.snapPromiseErrorHandler = (error: PromiseRejectionEvent) => {
      this.errorHandler(error.reason, { snapName });
    };

    try {
      const compartment = new Compartment({
        ...endowments,
        window: { ...endowments },
      });
      compartment.evaluate(sourceCode);

      self?.addEventListener(
        'unhandledrejection',
        this.snapPromiseErrorHandler,
      );
      self?.addEventListener('error', this.snapErrorHandler);
    } catch (err) {
      this.removeSnap(snapName);
      throw new Error(
        `Error while running snap '${snapName}': ${(err as Error).message}`,
      );
    }
  }

  /**
   * Sets up the given snap's RPC message handler, creates a hardened
   * snap provider object (i.e. globalThis.wallet), and returns it.
   */
  private createSnapProvider(snapName: string): SnapProvider {
    const snapProvider = new MetaMaskInpageProvider(this.rpcStream, {
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
