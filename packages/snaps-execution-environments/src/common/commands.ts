import { HandlerType } from '@metamask/snaps-utils';
import { assertExhaustive } from '@metamask/utils';

import type { InvokeSnap, InvokeSnapArgs } from './BaseSnapExecutor';
import type {
  ExecuteSnap,
  JsonRpcRequestWithoutId,
  Ping,
  SnapRpc,
  Terminate,
} from './validation';
import { assertIsOnTransactionRequestArguments } from './validation';

export type CommandMethodsMapping = {
  ping: Ping;
  terminate: Terminate;
  executeSnap: ExecuteSnap;
  snapRpc: SnapRpc;
};

/**
 * Formats the arguments for the given handler.
 *
 * @param origin - The origin of the request.
 * @param handler - The handler to pass the request to.
 * @param request - The request object.
 * @returns The formatted arguments.
 */
export function getHandlerArguments(
  origin: string,
  handler: HandlerType,
  request: JsonRpcRequestWithoutId,
): InvokeSnapArgs {
  // `request` is already validated by the time this function is called.

  switch (handler) {
    case HandlerType.OnTransaction: {
      assertIsOnTransactionRequestArguments(request.params);

      const { transaction, chainId, transactionOrigin } = request.params;
      return {
        transaction,
        chainId,
        transactionOrigin,
      };
    }

    case HandlerType.OnRpcRequest:
      return { origin, request };

    case HandlerType.OnCronjob:
    case HandlerType.OnInstall:
    case HandlerType.OnUpdate:
      return { request };

    default:
      return assertExhaustive(handler);
  }
}

/**
 * Gets an object mapping internal, "command" JSON-RPC method names to their
 * implementations.
 *
 * @param startSnap - A function that starts a snap.
 * @param invokeSnap - A function that invokes the RPC method handler of a
 * snap.
 * @param onTerminate - A function that will be called when this executor is
 * terminated in order to handle cleanup tasks.
 * @returns An object containing the "command" method implementations.
 */
export function getCommandMethodImplementations(
  startSnap: (...args: Parameters<ExecuteSnap>) => Promise<void>,
  invokeSnap: InvokeSnap,
  onTerminate: () => void,
): CommandMethodsMapping {
  return {
    ping: async () => Promise.resolve('OK'),
    terminate: async () => {
      onTerminate();
      return Promise.resolve('OK');
    },

    executeSnap: async (snapId, sourceCode, endowments) => {
      await startSnap(snapId, sourceCode, endowments);
      return 'OK';
    },

    snapRpc: async (target, handler, origin, request) => {
      return (
        (await invokeSnap(
          target,
          handler,
          getHandlerArguments(origin, handler, request),
        )) ?? null
      );
    },
  };
}
