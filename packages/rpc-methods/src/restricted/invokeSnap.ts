import {
  JsonRpcEngineEndCallback,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { AnnotatedJsonRpcEngine } from 'rpc-cap';
import { SNAP_PREFIX, SnapController } from '@metamask/snap-controllers';
import { RestrictedHandlerExport } from '../../types';
import { isPlainObject } from '../utils';

/**
 * `wallet_snap_*` attempts to invoke an RPC method of the specified Snap.
 * Requesting its corresponding permission will attempt to connect to the Snap,
 * and install it if it's not avaialble yet.
 */
export const invokeSnapHandler: RestrictedHandlerExport<
  InvokeSnapHooks,
  [Record<string, unknown>],
  unknown
> = {
  methodNames: [`${SNAP_PREFIX}*`],
  getImplementation: getInvokeSnapHandlerGetter,
  hookNames: {
    getSnap: true,
    addSnap: true,
    getSnapRpcHandler: true,
  },
};

export interface InvokeSnapHooks {
  getSnap: SnapController['get'];
  addSnap: SnapController['add'];
  getSnapRpcHandler: SnapController['getRpcMessageHandler'];
}

function getInvokeSnapHandlerGetter({
  getSnap,
  addSnap,
  getSnapRpcHandler,
}: InvokeSnapHooks) {
  return async function invokeSnap(
    req: JsonRpcRequest<[Record<string, unknown>]>,
    res: PendingJsonRpcResponse<unknown>,
    _next: unknown,
    end: JsonRpcEngineEndCallback,
    engine: AnnotatedJsonRpcEngine,
  ): Promise<void> {
    try {
      const snapRpcRequest = req.params?.[0];
      if (!isPlainObject(snapRpcRequest)) {
        return end(
          ethErrors.rpc.invalidParams({
            message:
              'Must specify snap RPC request object as single parameter.',
          }),
        );
      }

      const snapOriginString = req.method.substr(SNAP_PREFIX.length);

      if (!getSnap(snapOriginString)) {
        await addSnap({
          name: snapOriginString,
          manifestUrl: snapOriginString,
        });
      }

      const handler = await getSnapRpcHandler(snapOriginString);
      if (!handler) {
        return end(
          ethErrors.rpc.methodNotFound({
            message: `Snap RPC message handler not found for snap "${snapOriginString}".`,
          }),
        );
      }

      const fromDomain = engine.domain;

      // Handler is an async function that takes an snapOriginString string and a request object.
      // It should return the result it would like returned to the fromDomain as part of response.result
      res.result = await handler(fromDomain as string, snapRpcRequest);
      return end();
    } catch (err) {
      return end(err);
    }
  };
}
