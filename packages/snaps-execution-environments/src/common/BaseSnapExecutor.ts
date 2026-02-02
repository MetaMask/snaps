// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../../../../node_modules/ses/types.d.ts" />
import { createIdRemapMiddleware } from '@metamask/json-rpc-engine';
import ObjectMultiplex from '@metamask/object-multiplex';
import type { RequestArguments, StreamProvider } from '@metamask/providers';
import { errorCodes, rpcErrors, serializeError } from '@metamask/rpc-errors';
import type { SnapsEthereumProvider, SnapsProvider } from '@metamask/snaps-sdk';
import { getErrorData } from '@metamask/snaps-sdk';
import type {
  SnapExports,
  HandlerType,
  SnapExportsParameters,
} from '@metamask/snaps-utils';
import {
  SNAP_EXPORT_NAMES,
  logError,
  SNAP_EXPORTS,
  WrappedSnapError,
  unwrapError,
  logInfo,
} from '@metamask/snaps-utils';
import { is } from '@metamask/superstruct';
import type {
  JsonRpcNotification,
  JsonRpcId,
  JsonRpcRequest,
  Json,
} from '@metamask/utils';
import {
  assert,
  isJsonRpcRequest,
  hasProperty,
  getSafeJson,
  JsonRpcIdStruct,
  createDeferredPromise,
} from '@metamask/utils';
import type { Duplex } from 'readable-stream';
import { pipeline } from 'readable-stream';

import { assertCommandParams, getHandlerArguments } from './commands';
import { createEndowments } from './endowments';
import { addEventListener, removeEventListener } from './globalEvents';
import { SnapProvider } from './SnapProvider';
import {
  assertEthereumOutboundRequest,
  assertSnapOutboundRequest,
  sanitizeRequestArguments,
  withTeardown,
  isValidResponse,
  isMultichainRequest,
  assertMultichainOutboundRequest,
} from './utils';
import type {
  ExecuteSnapRequestArguments,
  SnapRpcRequestArguments,
} from './validation';
import {
  ExecuteSnapRequestArgumentsStruct,
  SnapRpcRequestArgumentsStruct,
} from './validation';
import { log } from '../logging';

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

const unhandledError = rpcErrors
  .internal<Json>({
    message: 'Unhandled Snap Error',
  })
  .serialize();

export type InvokeSnapArgs = Omit<SnapExportsParameters[0], 'chainId'>;

export type InvokeSnap = (
  target: string,
  handler: HandlerType,
  args: InvokeSnapArgs | undefined,
) => Promise<Json>;

export type NotifyFunction = (
  notification: Omit<JsonRpcNotification, 'jsonrpc'>,
) => Promise<void>;

export class BaseSnapExecutor {
  readonly #snapData: Map<string, SnapData>;

  readonly #commandStream: Duplex;

  readonly #rpcStream: Duplex;

  #snapErrorHandler?: (event: ErrorEvent) => void;

  #snapPromiseErrorHandler?: (event: PromiseRejectionEvent) => void;

  readonly #teardownRef = { lastTeardown: 0 };

  protected constructor(commandStream: Duplex, rpcStream: Duplex) {
    this.#snapData = new Map();
    this.#commandStream = commandStream;
    this.#commandStream.on('data', (data) => {
      /* istanbul ignore next 2 */
      this.#onCommandRequest(data).catch((error) => {
        logError(error);
      });
    });
    this.#rpcStream = rpcStream;
  }

  #errorHandler(error: unknown, data: Record<string, Json>) {
    const serializedError = serializeError(error, {
      fallbackError: unhandledError,
      shouldIncludeStack: false,
      shouldPreserveMessage: false,
    });

    const errorData = getErrorData(serializedError);

    this.#notify({
      method: 'UnhandledError',
      params: {
        error: {
          ...serializedError,
          data: {
            ...errorData,
            ...data,
          },
        },
      },
    }).catch((notifyError) => {
      logError(notifyError);
    });
  }

  async #onCommandRequest(message: JsonRpcRequest) {
    if (!isJsonRpcRequest(message)) {
      if (
        hasProperty(message, 'id') &&
        is((message as Pick<JsonRpcRequest, 'id'>).id, JsonRpcIdStruct)
      ) {
        // Instead of throwing, we directly respond with an error.
        // We can only do this if the message ID is still valid.
        await this.#respond((message as Pick<JsonRpcRequest, 'id'>).id, {
          error: serializeError(
            rpcErrors.internal(
              'JSON-RPC requests must be JSON serializable objects.',
            ),
          ),
        });
      } else {
        logInfo(
          'Command stream received a non-JSON-RPC request, and was unable to respond.',
        );
      }
      return;
    }

    const { id, method, params } = message;

    try {
      const result = await this.#handleCommand(method, params);
      await this.#respond(id, { result });
    } catch (rpcError) {
      await this.#respond(id, {
        error: serializeError(rpcError, {
          fallbackError,
          shouldPreserveMessage: false,
        }),
      });
    }
  }

  async #handleCommand(method: string, params?: Json) {
    switch (method) {
      case 'ping':
        return 'OK';

      case 'terminate': {
        this.#handleTerminate();
        return 'OK';
      }

      case 'executeSnap': {
        assertCommandParams(method, params, ExecuteSnapRequestArgumentsStruct);
        await this.#startSnap(params);
        return 'OK';
      }

      case 'snapRpc': {
        assertCommandParams(method, params, SnapRpcRequestArgumentsStruct);
        return await this.#invokeSnap(params);
      }

      default:
        throw rpcErrors.methodNotFound({
          data: {
            method,
          },
        });
    }
  }

  async #invokeSnap({
    snapId,
    handler: handlerType,
    origin,
    request,
  }: SnapRpcRequestArguments) {
    const args = getHandlerArguments(origin, handlerType, request);

    const data = this.#snapData.get(snapId);
    // We're capturing the handler in case someone modifies the data object
    // before the call.
    const handler = data?.exports[handlerType];
    const { required } = SNAP_EXPORTS[handlerType];

    assert(
      !required || handler !== undefined,
      `No ${handlerType} handler exported for Snap "${snapId}".`,
      rpcErrors.methodNotSupported,
    );

    // Certain handlers are not required. If they are not exported, we
    // return null.
    if (!handler) {
      return null;
    }

    const result = await this.#executeInSnapContext(snapId, async () =>
      // TODO: fix handler args type cast
      handler(args as any),
    );

    // The handler might not return anything, but undefined is not valid JSON.
    if (result === undefined || result === null) {
      return null;
    }

    // /!\ Always return only sanitized JSON to prevent security flaws. /!\
    try {
      return getSafeJson(result);
    } catch (error) {
      throw rpcErrors.internal(
        `Received non-JSON-serializable value: ${error.message.replace(
          /^Assertion failed: /u,
          '',
        )}`,
      );
    }
  }

  // Awaitable function that writes back to the command stream
  // To prevent snap execution from blocking writing we wrap in a promise
  // and await it before continuing execution
  async #write(chunk: Json) {
    return new Promise<void>((resolve, reject) => {
      this.#commandStream.write(chunk, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  async #notify(notification: Omit<JsonRpcNotification, 'jsonrpc'>) {
    if (!isValidResponse(notification)) {
      throw rpcErrors.internal(
        'JSON-RPC notifications must be JSON serializable objects smaller than 64 MB.',
      );
    }

    await this.#write({
      ...notification,
      jsonrpc: '2.0',
    });
  }

  async #respond(id: JsonRpcId, response: Record<string, Json>) {
    if (!isValidResponse(response)) {
      // Instead of throwing, we directly respond with an error.
      // This prevents an issue where we wouldn't respond when errors were non-serializable
      await this.#write({
        error: serializeError(
          rpcErrors.internal(
            'JSON-RPC responses must be JSON serializable objects smaller than 64 MB.',
          ),
        ),
        id,
        jsonrpc: '2.0',
      });
      return;
    }

    await this.#write({
      ...response,
      id,
      jsonrpc: '2.0',
    });
  }

  /**
   * Attempts to evaluate a snap in SES. Generates APIs for the snap. May throw
   * on errors.
   *
   * @param params - The parameters.
   * @param params.snapId - The id of the snap.
   * @param params.sourceCode - The source code of the snap, in IIFE format.
   * @param params.endowments - An array of the names of the endowments.
   */
  async #startSnap({
    snapId,
    sourceCode,
    endowments: endowmentKeys,
  }: ExecuteSnapRequestArguments): Promise<void> {
    log(`Starting snap '${snapId}' in worker.`);
    if (this.#snapPromiseErrorHandler) {
      removeEventListener('unhandledrejection', this.#snapPromiseErrorHandler);
    }

    if (this.#snapErrorHandler) {
      removeEventListener('error', this.#snapErrorHandler);
    }

    this.#snapErrorHandler = (error: ErrorEvent) => {
      this.#errorHandler(error.error, { snapId });
    };

    this.#snapPromiseErrorHandler = (error: PromiseRejectionEvent) => {
      this.#errorHandler(error instanceof Error ? error : error.reason, {
        snapId,
      });
    };

    const multiplex = new ObjectMultiplex();
    pipeline(this.#rpcStream, multiplex, this.#rpcStream, (error) => {
      if (error && !error.message?.match('Premature close')) {
        logError(`Provider stream failure.`, error);
      }
    });

    const provider = new SnapProvider(
      multiplex.createStream('metamask-provider'),
      {
        rpcMiddleware: [createIdRemapMiddleware()],
      },
    );

    provider.initializeSync();

    const multichainProvider = new SnapProvider(
      multiplex.createStream('metamask-multichain-provider'),
      {
        rpcMiddleware: [createIdRemapMiddleware()],
      },
    );

    multichainProvider.initializeSync();

    const snap = this.#createSnapGlobal(provider, multichainProvider);
    const ethereum = this.#createEIP1193Provider(provider);
    // We specifically use any type because the Snap can modify the object any way they want
    const snapModule: any = { exports: {} };

    try {
      const { endowments, teardown: endowmentTeardown } = createEndowments({
        snap,
        ethereum,
        snapId,
        endowments: endowmentKeys,
        notify: this.#notify.bind(this),
      });

      // !!! Ensure that this is the only place the data is being set.
      // Other methods access the object value and mutate its properties.
      this.#snapData.set(snapId, {
        idleTeardown: endowmentTeardown,
        runningEvaluations: new Set(),
        exports: {},
      });

      addEventListener('unhandledRejection', this.#snapPromiseErrorHandler);
      addEventListener('error', this.#snapErrorHandler);

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

      await this.#executeInSnapContext(snapId, async () => {
        compartment.evaluate(sourceCode);
        await this.#registerSnapExports(snapId, snapModule);
      });
    } catch (error) {
      this.#removeSnap(snapId);

      const [cause] = unwrapError(error);
      throw rpcErrors.internal({
        message: `Error while running snap '${snapId}': ${cause.message}`,
        data: {
          cause: cause.serialize(),
        },
      });
    }
  }

  /**
   * Cancels all running evaluations of all snaps and clears all snap data.
   * NOTE:** Should only be called in response to the `terminate` RPC command.
   */
  #handleTerminate() {
    // `stop()` tears down snap endowments.
    // Teardown will also be run for each snap as soon as there are
    // no more running evaluations for that snap.
    this.#snapData.forEach((data) =>
      data.runningEvaluations.forEach((evaluation) => evaluation.stop()),
    );
    this.#snapData.clear();
  }

  async #registerSnapExports(snapId: string, snapModule: any) {
    const data = this.#snapData.get(snapId);
    // Somebody deleted the snap before we could register.
    if (!data) {
      return;
    }

    // If the module is async, we must await the exports.
    const snapExports = await snapModule.exports;
    data.exports = SNAP_EXPORT_NAMES.reduce((acc, exportName) => {
      const snapExport = snapExports[exportName];
      const { validator } = SNAP_EXPORTS[exportName];
      if (validator(snapExport)) {
        return { ...acc, [exportName]: snapExport };
      }
      return acc;
    }, {});

    // If the Snap has no valid exports after this, fail.
    assert(Object.keys(data.exports).length > 0, 'Snap has no valid exports.');
  }

  /**
   * Instantiates a snap API object (i.e. `globalThis.snap`).
   *
   * @param provider - A StreamProvider connected to the EIP-1193 client stream.
   * @param multichainProvider - A StreamProvider connected to the CAIP-27 client stream.
   * @returns The snap provider object.
   */
  #createSnapGlobal(
    provider: StreamProvider,
    multichainProvider: StreamProvider,
  ): SnapsProvider {
    const originalRequest = provider.request.bind(provider);
    const originalMultichainRequest =
      multichainProvider.request.bind(multichainProvider);

    const request = async (args: RequestArguments) => {
      // As part of the sanitization, we validate that the args are valid JSON.
      const sanitizedArgs = sanitizeRequestArguments(args);
      assertSnapOutboundRequest(sanitizedArgs);

      if (isMultichainRequest(sanitizedArgs)) {
        assertMultichainOutboundRequest(sanitizedArgs);
        return await withTeardown(
          originalMultichainRequest(sanitizedArgs),
          this.#teardownRef,
        );
      }

      return await withTeardown(
        originalRequest(sanitizedArgs),
        this.#teardownRef,
      );
    };

    const snapsProvider = { request } as SnapsProvider;

    return harden(snapsProvider);
  }

  /**
   * Instantiates an EIP-1193 Ethereum provider object (i.e. `globalThis.ethereum`).
   *
   * @param provider - A StreamProvider connected to MetaMask.
   * @returns The EIP-1193 Ethereum provider object.
   */
  #createEIP1193Provider(provider: StreamProvider): SnapsEthereumProvider {
    const originalRequest = provider.request.bind(provider);

    const request = async (args: RequestArguments) => {
      // As part of the sanitization, we validate that the args are valid JSON.
      const sanitizedArgs = sanitizeRequestArguments(args);
      assertEthereumOutboundRequest(sanitizedArgs);
      return await withTeardown(
        originalRequest(sanitizedArgs),
        this.#teardownRef,
      );
    };

    const ethereumProvider = { request };

    return harden(ethereumProvider);
  }

  /**
   * Removes the snap with the given name.
   *
   * @param snapId - The id of the snap to remove.
   */
  #removeSnap(snapId: string): void {
    this.#snapData.delete(snapId);
  }

  /**
   * Calls the specified executor function in the context of the specified snap.
   * Essentially, this means that the operation performed by the executor is
   * counted as an evaluation of the specified snap. When the count of running
   * evaluations of a snap reaches zero, its endowments are torn down.
   *
   * @param snapId - The id of the snap whose context to execute in.
   * @param executor - The function that will be executed in the snap's context.
   * @returns The executor's return value.
   * @template Result - The return value of the executor.
   */
  async #executeInSnapContext<Result>(
    snapId: string,
    executor: () => Promise<Result> | Result,
  ): Promise<Result> {
    const data = this.#snapData.get(snapId);
    if (data === undefined) {
      throw rpcErrors.internal(
        `Tried to execute in context of unknown snap: "${snapId}".`,
      );
    }

    const { promise: stopPromise, reject } = createDeferredPromise<Result>();

    const stop = () =>
      reject(
        rpcErrors.internal(
          `The Snap "${snapId}" has been terminated during execution.`,
        ),
      );

    const evaluationData = { stop };

    try {
      data.runningEvaluations.add(evaluationData);
      // Notice that we have to await this executor.
      // If we didn't, we would decrease the amount of running evaluations
      // before the promise actually resolves
      return await Promise.race([executor(), stopPromise]);
    } catch (error) {
      throw new WrappedSnapError(error);
    } finally {
      data.runningEvaluations.delete(evaluationData);

      if (data.runningEvaluations.size === 0) {
        this.#teardownRef.lastTeardown += 1;
        await data.idleTeardown();
      }
    }
  }
}
