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
import { createEndowments } from './endowments';
import { rootRealmGlobal } from './globalObject';
import { rpcMethods, RpcMethodsMapping } from './rpcMethods';
import { sortParamKeys } from './sortParams';

type OnRpcRequestHandler = (args: {
  origin: string;
  request: JsonRpcRequest;
  wallet: MetaMaskInpageProvider;
}) => Promise<unknown>;

type EvaluationData = {
  stop: () => void;
};

type SnapData = {
  exports: { onRpcRequest?: OnRpcRequestHandler };
  runningEvaluations: Set<EvaluationData>;
  idleTeardown: () => void;
  wallet: MetaMaskInpageProvider;
};

const fallbackError = {
  code: errorCodes.rpc.internal,
  message: 'Execution Environment Error',
};

export class BaseSnapExecutor {
  private snapData: Map<string, SnapData>;

  private commandStream: Duplex;

  private rpcStream: Duplex;

  private methods: RpcMethodsMapping;

  private snapErrorHandler?: (event: ErrorEvent) => void;

  private snapPromiseErrorHandler?: (event: PromiseRejectionEvent) => void;

  protected constructor(commandStream: Duplex, rpcStream: Duplex) {
    this.snapData = new Map();
    this.commandStream = commandStream;
    this.commandStream.on('data', this.onCommandRequest.bind(this));
    this.rpcStream = rpcStream;

    this.methods = rpcMethods(
      this.startSnap.bind(this),
      (target, origin, request) => {
        const data = this.snapData.get(target);
        if (data?.exports?.onRpcRequest === undefined) {
          throw new Error(
            `No onRpcRequest handler exported for snap "${target}`,
          );
        }
        // We're capturing the handler in case someone modifies the data object before the call
        const handler = data.exports.onRpcRequest;
        return this.executeInSnapContext(target, () =>
          handler({ origin, request, wallet: data.wallet }),
        );
      },
      this.onTerminate.bind(this),
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
  protected async startSnap(
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
      this.errorHandler(error.error, { snapName });
    };

    this.snapPromiseErrorHandler = (error: PromiseRejectionEvent) => {
      this.errorHandler(error.reason, { snapName });
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
        wallet,
      });

      rootRealmGlobal.addEventListener(
        'unhandledrejection',
        this.snapPromiseErrorHandler,
      );
      rootRealmGlobal.addEventListener('error', this.snapErrorHandler);

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
   * **NOTE:** Should only be called in response to the `terminate` RPC command.
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
   * Creates a hardened snap provider object (i.e. globalThis.wallet), and returns it.
   */
  private createSnapProvider(): SnapProvider {
    return new MetaMaskInpageProvider(this.rpcStream, {
      shouldSendMetadata: false,
    });
  }

  /**
   * Removes the snap with the given name.
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
        data.idleTeardown();
      }
    }
  }
}
