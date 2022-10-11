import {
  JsonRpcRequest,
  assertExhaustive,
  JsonRpcParams,
  assert,
} from '@metamask/utils';
import { HandlerType } from '@metamask/snap-utils';
import { InvokeSnap, InvokeSnapArgs } from './BaseSnapExecutor';
import {
  ExecuteSnap,
  isEndowmentsArray,
  isJsonRpcRequestWithoutId,
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
  request: JsonRpcRequest<JsonRpcParams>,
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
 * Typeguard to ensure a handler is part of the HandlerType.
 *
 * @param handler - The handler to pass the request to.
 * @returns A boolean.
 */
function isHandler(handler: string): handler is HandlerType {
  return Object.values(HandlerType).includes(handler as HandlerType);
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
      assert(typeof snapName === 'string', 'Snap name is not a string.');
      assert(typeof sourceCode === 'string', 'Source code is not a string.');
      assert(
        !endowments || isEndowmentsArray(endowments),
        'Endowments is not an array of strings.',
      );

      await startSnap(snapName as string, sourceCode as string, endowments);
      return 'OK';
    },

    snapRpc: async (target, handler, origin, request) => {
      assert(typeof target === 'string', 'Target is not a string.');
      assert(typeof origin === 'string', 'Origin is not a string.');
      assert(
        isJsonRpcRequestWithoutId(request),
        'Request is not a proper JSON-RPC request.',
      );
      assert(isHandler(handler), 'Incorrect handler type.');

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
