import { assertExhaustive } from '@metamask/utils';
import { HandlerType } from '@metamask/snap-utils';
import { InvokeSnap, InvokeSnapArgs } from './BaseSnapExecutor';
import {
  ExecuteSnap,
  JsonRpcRequestWithoutId,
  Ping,
  SnapRpc,
  Terminate,
} from './validation';

export type CommandMethodsMapping = {
  ping: Ping;
  terminate: Terminate;
  executeSnap: ExecuteSnap;
  snapRpc: SnapRpc;
};

// TODO: Add validation in cases.
/**
 * Formats the arguments for the given handler.
 *
 * @param origin - The origin of the request.
 * @param handler - The handler to pass the request to.
 * @param request - The request object.
 * @returns The formatted arguments.
 */
function getHandlerArguments(
  origin: string,
  handler: HandlerType,
  request: JsonRpcRequestWithoutId,
): InvokeSnapArgs {
  switch (handler) {
    case HandlerType.OnTransaction: {
      const { transaction, chainId } = request.params as Record<string, any>;
      return {
        transaction,
        chainId,
      };
    }

    case HandlerType.OnRpcRequest:
    case HandlerType.SnapKeyring:
      return { origin, request };

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
    ping: async () => {
      return 'OK';
    },

    terminate: async () => {
      onTerminate();
      return 'OK';
    },

    executeSnap: async (snapName, sourceCode, endowments) => {
      await startSnap(snapName as string, sourceCode as string, endowments);
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
