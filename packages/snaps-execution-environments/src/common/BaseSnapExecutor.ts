// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../../../../node_modules/ses/index.d.ts" />
import { StreamProvider } from '@metamask/providers';
import { RequestArguments } from '@metamask/providers/dist/BaseProvider';
import { SnapsGlobalObject } from '@metamask/rpc-methods';
import {
  SnapExports,
  HandlerType,
  SnapExportsParameters,
  SNAP_EXPORT_NAMES,
  logError,
} from '@metamask/snaps-utils';
import {
  isObject,
  isValidJson,
  JsonRpcNotification,
  assert,
  isJsonRpcRequest,
  JsonRpcId,
  JsonRpcRequest,
  Json,
  hasProperty,
} from '@metamask/utils';
import { errorCodes, ethErrors, serializeError } from 'eth-rpc-errors';
import { createIdRemapMiddleware } from 'json-rpc-engine';
import { Duplex } from 'stream';
import { validate } from 'superstruct';

import { log } from '../logging';
import EEOpenRPCDocument from '../openrpc.json';
import {
  CommandMethodsMapping,
  getCommandMethodImplementations,
} from './commands';
import { createEndowments } from './endowments';
import { addEventListener, removeEventListener } from './globalEvents';
import { wrapKeyring } from './keyring';
import { sortParamKeys } from './sortParams';
import { constructError, proxyStreamProvider, withTeardown } from './utils';
import {
  ExecuteSnapRequestArgumentsStruct,
  PingRequestArgumentsStruct,
  SnapRpcRequestArgumentsStruct,
  TerminateRequestArgumentsStruct,
  validateExport,
} from './validation';

type EvaluationData = {
  stop: () => void;
};

type SnapData = {
  exports: SnapExports;
  runningEvaluations: Set<EvaluationData>;
  idleTeardown: () => Promise<void>;
};

const fallbackError = {
  code: errorCodes.rpc.internal,
  message: 'Execution Environment Error',
};

// TODO: `KeyringParameters` expects a `chainId` for certain methods, but we're
// not providing it in `getHandlerArguments`, resulting in type errors.
export type InvokeSnapArgs = Omit<SnapExportsParameters[0], 'chainId'>;

export type InvokeSnap = (
  target: string,
  handler: HandlerType,
  args: InvokeSnapArgs | undefined,
) => Promise<Json>;

/**
 * The supported methods in the execution environment. The validator checks the
 * incoming JSON-RPC request, and the `params` property is used for sorting the
 * parameters, if they are an object.
 */
const EXECUTION_ENVIRONMENT_METHODS = {
  ping: {
    struct: PingRequestArgumentsStruct,
    params: [],
  },
  executeSnap: {
    struct: ExecuteSnapRequestArgumentsStruct,
    params: ['snapName', 'sourceCode', 'endowments'],
  },
  terminate: {
    struct: TerminateRequestArgumentsStruct,
    params: [],
  },
  snapRpc: {
    struct: SnapRpcRequestArgumentsStruct,
    params: ['target', 'handler', 'origin', 'request'],
  },
};

export class BaseSnapExecutor {
  private readonly snapData: Map<string, SnapData>;

  private readonly commandStream: Duplex;

  private readonly rpcStream: Duplex;

  private readonly methods: CommandMethodsMapping;

  private snapErrorHandler?: (event: ErrorEvent) => void;

  private snapPromiseErrorHandler?: (event: PromiseRejectionEvent) => void;

  private lastTeardown = 0;

  protected constructor(commandStream: Duplex, rpcStream: Duplex) {
    this.snapData = new Map();
    this.commandStream = commandStream;
    this.commandStream.on('data', (data) => {
      this.onCommandRequest(data).catch((error) => {
        // TODO: Decide how to handle errors.
        logError(error);
      });
    });
    this.rpcStream = rpcStream;

    this.methods = getCommandMethodImplementations(
      this.startSnap.bind(this),
      async (target, handlerName, args) => {
        const data = this.snapData.get(target);
        // We're capturing the handler in case someone modifies the data object before the call
        const handler =
          handlerName === HandlerType.SnapKeyring
            ? wrapKeyring(this.notify.bind(this), data?.exports.keyring)
            : data?.exports[handlerName];
        assert(
          handler !== undefined,
          `No ${handlerName} handler exported for snap "${target}`,
        );
        // TODO: fix handler args type cast
        let result = await this.executeInSnapContext(target, () =>
          handler(args as any),
        );

        // The handler might not return anything, but undefined is not valid JSON.
        if (result === undefined) {
          result = null;
        }

        assert(
          isValidJson(result),
          new TypeError('Received non-JSON-serializable value.'),
        );
        return result;
      },
      this.onTerminate.bind(this),
    );
  }

  private errorHandler(error: unknown, data: Record<string, Json>) {
    const constructedError = constructError(error);
    const serializedError = serializeError(constructedError, {
      fallbackError,
      shouldIncludeStack: false,
    });

    // We're setting it this way to avoid sentData.stack = undefined
    const sentData: Json = { ...data, stack: constructedError?.stack ?? null };

    this.notify({
      method: 'UnhandledError',
      params: {
        error: {
          ...serializedError,
          data: sentData,
        },
      },
    });
  }

  private async onCommandRequest(message: JsonRpcRequest) {
    if (!isJsonRpcRequest(message)) {
      throw new Error('Command stream received a non-JSON-RPC request.');
    }

    const { id, method, params } = message;
    if (method === 'rpc.discover') {
      this.respond(id, {
        result: EEOpenRPCDocument,
      });
      return;
    }

    if (!hasProperty(EXECUTION_ENVIRONMENT_METHODS, method)) {
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

    const methodObject =
      EXECUTION_ENVIRONMENT_METHODS[
        method as keyof typeof EXECUTION_ENVIRONMENT_METHODS
      ];

    // support params by-name and by-position
    const paramsAsArray = sortParamKeys(methodObject.params, params);

    const [error] = validate<any, any>(paramsAsArray, methodObject.struct);
    if (error) {
      this.respond(id, {
        error: ethErrors.rpc
          .invalidParams({
            message: `Invalid parameters for method "${method}": ${error.message}.`,
            data: {
              method,
              params: paramsAsArray,
            },
          })
          .serialize(),
      });
      return;
    }

    try {
      const result = await (this.methods as any)[method](...paramsAsArray);
      this.respond(id, { result });
    } catch (rpcError) {
      this.respond(id, {
        error: serializeError(rpcError, {
          fallbackError,
        }),
      });
    }
  }

  protected notify(requestObject: Omit<JsonRpcNotification, 'jsonrpc'>) {
    if (!isValidJson(requestObject) || !isObject(requestObject)) {
      throw new Error(
        'JSON-RPC notifications must be JSON serializable objects',
      );
    }

    this.commandStream.write({
      ...requestObject,
      jsonrpc: '2.0',
    });
  }

  protected respond(id: JsonRpcId, requestObject: Record<string, unknown>) {
    if (!isValidJson(requestObject) || !isObject(requestObject)) {
      throw new Error('JSON-RPC responses must be JSON serializable objects.');
    }

    this.commandStream.write({
      ...requestObject,
      id,
      jsonrpc: '2.0',
    });
  }

  /**
   * Attempts to evaluate a snap in SES. Generates APIs for the snap. May throw
   * on errors.
   *
   * @param snapName - The name of the snap.
   * @param sourceCode - The source code of the snap, in IIFE format.
   * @param _endowments - An array of the names of the endowments.
   */
  protected async startSnap(
    snapName: string,
    sourceCode: string,
    _endowments?: string[],
  ): Promise<void> {
    log(`Starting snap '${snapName}' in worker.`);
    if (this.snapPromiseErrorHandler) {
      removeEventListener('unhandledrejection', this.snapPromiseErrorHandler);
    }

    if (this.snapErrorHandler) {
      removeEventListener('error', this.snapErrorHandler);
    }

    this.snapErrorHandler = (error: ErrorEvent) => {
      this.errorHandler(error.error, { snapName });
    };

    this.snapPromiseErrorHandler = (error: PromiseRejectionEvent) => {
      this.errorHandler(error instanceof Error ? error : error.reason, {
        snapName,
      });
    };

    const provider = new StreamProvider(this.rpcStream, {
      jsonRpcStreamName: 'metamask-provider',
      rpcMiddleware: [createIdRemapMiddleware()],
    });

    await provider.initialize();

    const snap = this.createSnapGlobal(provider);
    const ethereum = this.createEIP1193Provider(provider);
    // We specifically use any type because the Snap can modify the object any way they want
    const snapModule: any = { exports: {} };

    try {
      const { endowments, teardown: endowmentTeardown } = createEndowments(
        snap,
        ethereum,
        _endowments,
      );

      // !!! Ensure that this is the only place the data is being set.
      // Other methods access the object value and mutate its properties.
      this.snapData.set(snapName, {
        idleTeardown: endowmentTeardown,
        runningEvaluations: new Set(),
        exports: {},
      });

      addEventListener('unhandledRejection', this.snapPromiseErrorHandler);
      addEventListener('error', this.snapErrorHandler);

      const compartment = new Compartment({
        ...endowments,
        module: snapModule,
        exports: snapModule.exports,
      });
      // All of those are JavaScript runtime specific and self referential,
      // but we add them for compatibility sake with external libraries.
      //
      // We can't do that in the injected globals object above
      // because SES creates its own globalThis
      compartment.globalThis.self = compartment.globalThis;
      compartment.globalThis.global = compartment.globalThis;
      compartment.globalThis.window = compartment.globalThis;

      await this.executeInSnapContext(snapName, () => {
        compartment.evaluate(sourceCode);
        this.registerSnapExports(snapName, snapModule);
      });
    } catch (error) {
      this.removeSnap(snapName);
      throw new Error(
        `Error while running snap '${snapName}': ${(error as Error).message}`,
      );
    }
  }

  /**
   * Cancels all running evaluations of all snaps and clears all snap data.
   * NOTE:** Should only be called in response to the `terminate` RPC command.
   */
  protected onTerminate() {
    // `stop()` tears down snap endowments.
    // Teardown will also be run for each snap as soon as there are
    // no more running evaluations for that snap.
    this.snapData.forEach((data) =>
      data.runningEvaluations.forEach((evaluation) => evaluation.stop()),
    );
    this.snapData.clear();
  }

  private registerSnapExports(snapName: string, snapModule: any) {
    const data = this.snapData.get(snapName);
    // Somebody deleted the Snap before we could register
    if (!data) {
      return;
    }

    data.exports = SNAP_EXPORT_NAMES.reduce((acc, exportName) => {
      const snapExport = snapModule.exports[exportName];
      if (validateExport(exportName, snapExport)) {
        return { ...acc, [exportName]: snapExport };
      }
      return acc;
    }, {});
  }

  /**
   * Instantiates a snap API object (i.e. `globalThis.snap`).
   *
   * @param provider - A StreamProvider connected to MetaMask.
   * @returns The snap provider object.
   */
  private createSnapGlobal(provider: StreamProvider): SnapsGlobalObject {
    const originalRequest = provider.request.bind(provider);

    const request = async (args: RequestArguments) => {
      assert(
        String.prototype.startsWith.call(args.method, 'wallet_') ||
          String.prototype.startsWith.call(args.method, 'snap_'),
        'The global Snap API only allows RPC methods starting with `wallet_*` and `snap_*`.',
      );
      this.notify({ method: 'OutboundRequest' });
      try {
        return await withTeardown(originalRequest(args), this as any);
      } finally {
        this.notify({ method: 'OutboundResponse' });
      }
    };

    // Proxy target is intentionally set to be an empty object, to ensure
    // that access to the prototype chain is not possible.
    const snapGlobalProxy = new Proxy(
      {},
      {
        has(_target: object, prop: string | symbol) {
          return typeof prop === 'string' && ['request'].includes(prop);
        },
        get(_target, prop: keyof StreamProvider) {
          if (prop === 'request') {
            return request;
          }

          return undefined;
        },
      },
    ) as SnapsGlobalObject;

    return harden(snapGlobalProxy);
  }

  /**
   * Instantiates an EIP-1193 Ethereum provider object (i.e. `globalThis.ethereum`).
   *
   * @param provider - A StreamProvider connected to MetaMask.
   * @returns The EIP-1193 Ethereum provider object.
   */
  private createEIP1193Provider(provider: StreamProvider): StreamProvider {
    const originalRequest = provider.request.bind(provider);

    const request = async (args: RequestArguments) => {
      assert(
        !String.prototype.startsWith.call(args.method, 'snap_'),
        ethErrors.rpc.methodNotFound({
          data: {
            method: args.method,
          },
        }),
      );
      this.notify({ method: 'OutboundRequest' });
      try {
        return await withTeardown(originalRequest(args), this as any);
      } finally {
        this.notify({ method: 'OutboundResponse' });
      }
    };

    const streamProviderProxy = proxyStreamProvider(provider, request);

    return harden(streamProviderProxy);
  }

  /**
   * Removes the snap with the given name.
   *
   * @param snapName - The name of the snap to remove.
   */
  private removeSnap(snapName: string): void {
    this.snapData.delete(snapName);
  }

  /**
   * Calls the specified executor function in the context of the specified snap.
   * Essentially, this means that the operation performed by the executor is
   * counted as an evaluation of the specified snap. When the count of running
   * evaluations of a snap reaches zero, its endowments are torn down.
   *
   * @param snapName - The name of the snap whose context to execute in.
   * @param executor - The function that will be executed in the snap's context.
   * @returns The executor's return value.
   * @template Result - The return value of the executor.
   */
  private async executeInSnapContext<Result>(
    snapName: string,
    executor: () => Promise<Result> | Result,
  ): Promise<Result> {
    const data = this.snapData.get(snapName);
    if (data === undefined) {
      throw new Error(
        `Tried to execute in context of unknown snap: "${snapName}".`,
      );
    }

    let stop: () => void;
    const stopPromise = new Promise<never>(
      (_, reject) =>
        (stop = () =>
          reject(
            // TODO(rekmarks): Specify / standardize error code for this case.
            ethErrors.rpc.internal(
              `The snap "${snapName}" has been terminated during execution.`,
            ),
          )),
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const evaluationData = { stop: stop! };

    try {
      data.runningEvaluations.add(evaluationData);
      // Notice that we have to await this executor.
      // If we didn't, we would decrease the amount of running evaluations
      // before the promise actually resolves
      return await Promise.race([executor(), stopPromise]);
    } finally {
      data.runningEvaluations.delete(evaluationData);

      if (data.runningEvaluations.size === 0) {
        this.lastTeardown += 1;
        await data.idleTeardown();
      }
    }
  }
}
