// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../../../../node_modules/ses/index.d.ts" />
import { Duplex } from 'stream';
import { MetaMaskInpageProvider } from '@metamask/providers';
import {
  SnapProvider,
  OnRpcRequestHandler,
  OnTxConfirmationHandler,
  SnapExports,
} from '@metamask/snap-types';
import { errorCodes, ethErrors, serializeError } from 'eth-rpc-errors';
import { JsonRpcNotification } from '@metamask/utils';
import EEOpenRPCDocument from '../openrpc.json';
import {
  Endowments,
  JSONRPCID,
  JsonRpcRequest,
  Target,
} from '../__GENERATED__/openrpc';
import { isJsonRpcRequest } from '../__GENERATED__/openrpc.guard';
import { createEndowments } from './endowments';
import {
  getCommandMethodImplementations,
  CommandMethodsMapping,
} from './commands';
import { removeEventListener, addEventListener } from './globalEvents';
import { sortParamKeys } from './sortParams';
import { constructError } from './utils';

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

export type InvokeSnap = (
  target: Target,
  handler: keyof SnapExports,
  args: Parameters<OnRpcRequestHandler | OnTxConfirmationHandler>[0],
) => Promise<unknown>;

export class BaseSnapExecutor {
  private snapData: Map<string, SnapData>;

  private commandStream: Duplex;

  private rpcStream: Duplex;

  private methods: CommandMethodsMapping;

  private snapErrorHandler?: (event: ErrorEvent) => void;

  private snapPromiseErrorHandler?: (event: PromiseRejectionEvent) => void;

  protected constructor(commandStream: Duplex, rpcStream: Duplex) {
    this.snapData = new Map();
    this.commandStream = commandStream;
    this.commandStream.on('data', this.onCommandRequest.bind(this));
    this.rpcStream = rpcStream;

    this.methods = getCommandMethodImplementations(
      this.startSnap.bind(this),
      (target, handlerName, args) => {
        const data = this.snapData.get(target);
        if (data?.exports?.[handlerName] === undefined) {
          throw new Error(
            `No ${handlerName} handler exported for snap "${target}`,
          );
        }

        // We're capturing the handler in case someone modifies the data object before the call
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const handler = data.exports[handlerName]!;
        return this.executeInSnapContext(target, () => handler(args));
      },
      this.onTerminate.bind(this),
    );
  }

  private errorHandler(error: unknown, data: Record<string, unknown>) {
    const constructedError = constructError(error);
    const serializedError = serializeError(constructedError, {
      fallbackError,
      shouldIncludeStack: false,
    });
    this.notify({
      method: 'UnhandledError',
      params: {
        error: {
          ...serializedError,
          data: {
            ...data,
            stack: constructedError?.stack,
          },
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

  protected notify(
    requestObject: Omit<
      JsonRpcNotification<Record<string, unknown> | unknown[]>,
      'jsonrpc'
    >,
  ) {
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
    _endowments?: Endowments,
  ): Promise<void> {
    console.log(`starting snap '${snapName}' in worker`);
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

    const wallet = this.createSnapProvider();
    // We specifically use any type because the Snap can modify the object any way they want
    const snapModule: any = { exports: {} };

    try {
      const { endowments, teardown: endowmentTeardown } = createEndowments(
        wallet,
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
        window: { ...endowments },
        self: { ...endowments },
      });

      await this.executeInSnapContext(snapName, () => {
        compartment.evaluate(sourceCode);
        this.registerSnapExports(snapName, snapModule);
      });
    } catch (err) {
      this.removeSnap(snapName);
      throw new Error(
        `Error while running snap '${snapName}': ${(err as Error).message}`,
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
    if (typeof snapModule?.exports?.onRpcRequest === 'function') {
      const data = this.snapData.get(snapName);
      // Somebody deleted the Snap before we could register
      if (data !== undefined) {
        console.log(
          'Worker: Registering RPC message handler',
          snapModule.exports.onRpcRequest,
        );

        data.exports = {
          ...data.exports,
          onRpcRequest: snapModule.exports.onRpcRequest,
        };
      }
    }
  }

  /**
   * Instantiates a snap provider object (i.e. `globalThis.wallet`).
   *
   * @returns The snap provider object.
   */
  private createSnapProvider(): SnapProvider {
    const provider = new MetaMaskInpageProvider(this.rpcStream, {
      shouldSendMetadata: false,
    });
    const originalRequest = provider.request;

    provider.request = async (args) => {
      this.notify({ method: 'OutboundRequest' });
      try {
        return await originalRequest(args);
      } finally {
        this.notify({ method: 'OutboundResponse' });
      }
    };

    return provider;
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
        await data.idleTeardown();
      }
    }
  }
}
