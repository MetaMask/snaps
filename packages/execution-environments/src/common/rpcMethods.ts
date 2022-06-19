import {
  ExecuteSnap,
  Ping,
  SnapRpc,
  Terminate,
} from '../__GENERATED__/openrpc';
import { isEndowments, isJsonRpcRequest } from '../__GENERATED__/openrpc.guard';

export type RpcMethodsMapping = {
  ping: Ping;
  terminate: Terminate;
  executeSnap: ExecuteSnap;
  snapRpc: SnapRpc;
};

/**
 * @param startSnap
 * @param invokeSnapRpc
 * @param onTerminate
 */
export function rpcMethods(
  startSnap: (...args: Parameters<ExecuteSnap>) => Promise<void>,
  invokeSnapRpc: SnapRpc,
  onTerminate: () => void,
): RpcMethodsMapping {
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
    snapRpc: async (target, origin, request) => {
      if (typeof target !== 'string') {
        throw new Error('target is not a string');
      }

      if (typeof origin !== 'string') {
        throw new Error('origin is not a string');
      }

      if (!isJsonRpcRequest(request)) {
        throw new Error('request is not a proper JSON RPC Request');
      }

      return invokeSnapRpc(target, origin, request);
    },
  };
}
