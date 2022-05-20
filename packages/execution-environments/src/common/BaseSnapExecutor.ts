// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../../../../node_modules/ses/index.d.ts" />
import { Duplex } from 'stream';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapProvider } from '@metamask/snap-types';
import { errorCodes, ethErrors, serializeError } from 'eth-rpc-errors';
import EEOpenRPCDocument from '../openrpc.json';
import {
  Endowments,
  JSONRPCID,
  JsonRpcRequest,
} from '../__GENERATED__/openrpc';
import { isJsonRpcRequest } from '../__GENERATED__/openrpc.guard';
import { rpcMethods, RpcMethodsMapping } from './rpcMethods';
import { getSortedParams } from './sortParams';
import { createEndowments } from './endowments';
import { rootRealmGlobal } from './globalObject';
import { constructError } from './utils';

type SnapRpcHandler = (
  origin: string,
  request: JsonRpcRequest,
) => Promise<unknown>;

const fallbackError = {
  code: errorCodes.rpc.internal,
  message: 'Execution Environment Error',
};

export class BaseSnapExecutor {
  private snapRpcHandlers: Map<string, SnapRpcHandler>;

  private commandStream: Duplex;

  private rpcStream: Duplex;

  private methods: RpcMethodsMapping;

  private snapErrorHandler?: (event: ErrorEvent) => void;

  private snapPromiseErrorHandler?: (event: PromiseRejectionEvent) => void;

  private endowmentTeardown?: () => void;

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
          throw new Error(`No RPC handler registered for snap "${target}"`);
        }
        return handler(origin, request);
      },
      this.onTerminate.bind(this),
    );
  }

  private errorHandler(
    reason: string,
    originalError: unknown,
    data: Record<string, unknown>,
  ) {
    const error = new Error(reason);

    const _originalError: Error | undefined = constructError(originalError);

    const serializedError = serializeError(error, {
      shouldIncludeStack: false,
    });

    this.notify({
      error: {
        ...serializedError,
        data: {
          ...data,
          originalError: _originalError,
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
    const paramsAsArray = getSortedParams(methodObject, params);

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
    _endowments?: Endowments,
  ) {
    console.log(`starting snap '${snapName}' in worker`);
    if (this.snapPromiseErrorHandler) {
      rootRealmGlobal.removeEventListener(
        'unhandledrejection',
        this.snapPromiseErrorHandler,
      );
    }

    if (this.snapErrorHandler) {
      rootRealmGlobal.removeEventListener('error', this.snapErrorHandler);
    }

    this.snapErrorHandler = (error: ErrorEvent) => {
      this.errorHandler('Uncaught error in snap.', error.error, { snapName });
    };

    this.snapPromiseErrorHandler = (error: PromiseRejectionEvent) => {
      this.errorHandler('Unhandled promise rejection in snap.', error.reason, {
        snapName,
      });
    };

    const wallet = this.createSnapProvider(snapName);

    try {
      const { endowments, teardown: endowmentTeardown } = createEndowments(
        wallet,
        _endowments,
      );

      this.endowmentTeardown = endowmentTeardown;

      rootRealmGlobal.addEventListener(
        'unhandledrejection',
        this.snapPromiseErrorHandler,
      );
      rootRealmGlobal.addEventListener('error', this.snapErrorHandler);

      const compartment = new Compartment({
        ...endowments,
        window: { ...endowments },
        self: { ...endowments },
      });

      compartment.evaluate(sourceCode);
    } catch (err) {
      this.removeSnap(snapName);
      throw new Error(
        `Error while running snap '${snapName}': ${(err as Error).message}`,
      );
    }
  }

  protected onTerminate() {
    if (this.endowmentTeardown) {
      this.endowmentTeardown();
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
