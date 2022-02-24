import { ExecuteSnap, Ping, SnapRpc } from '../__GENERATED__/openrpc';
import { isEndowments, isJsonRpcRequest } from '../__GENERATED__/openrpc.guard';

export type RpcMethodsMapping = {
  ping: Ping;
  executeSnap: ExecuteSnap;
  snapRpc: SnapRpc;
};

export function rpcMethods(
  startSnap: (...args: Parameters<ExecuteSnap>) => void,
  invokeSnapRpc: SnapRpc,
): RpcMethodsMapping {
  return {
    ping: async () => {
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

      startSnap(snapName as string, sourceCode as string, endowments);
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
