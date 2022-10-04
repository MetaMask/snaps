import { JsonRpcRequest, assertExhaustive } from '@metamask/utils';
import { HandlerType } from '@metamask/snap-utils';
import {
  ExecuteSnap,
  Origin,
  Ping,
  SnapRpc,
  Terminate,
} from '../__GENERATED__/openrpc';
import { isEndowments, isJsonRpcRequest } from '../__GENERATED__/openrpc.guard';
import { InvokeSnap, InvokeSnapArgs } from './BaseSnapExecutor';

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
  origin: Origin,
  handler: HandlerType,
  request: JsonRpcRequest<unknown[] | { [key: string]: unknown }>,
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
      if (typeof snapName !== 'string') {
        throw new Error('snapName is not a string');
      }

      if (typeof sourceCode !== 'string') {
        throw new Error('sourceCode is not a string');
      }

      if (endowments !== undefined) {
        if (!isEndowments(endowments)) {
          throw new Error('endowment is not a proper Endowments object');
        }
      }

      await startSnap(snapName as string, sourceCode as string, endowments);
      return 'OK';
    },

    snapRpc: async (target, handler, origin, request) => {
      if (typeof target !== 'string') {
        throw new Error('target is not a string');
      }

      if (typeof origin !== 'string') {
        throw new Error('origin is not a string');
      }

      if (!isJsonRpcRequest(request)) {
        throw new Error('request is not a proper JSON RPC Request');
      }

      if (!isHandler(handler)) {
        throw new Error('Incorrect handler type.');
      }

      return (
        (await invokeSnap(
          target,
          handler,
          getHandlerArguments(
            origin,
            handler,
            // Specifically casting to other JsonRpcRequest type here on purpose, to stop using the OpenRPC type.
            request as JsonRpcRequest<unknown[] | { [key: string]: unknown }>,
          ),
        )) ?? null
      );
    },
  };
}
