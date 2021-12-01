import {
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from 'json-rpc-engine';
import { InstallSnapsResult } from '@metamask/snap-controllers';
import { PermittedHandlerExport } from '../../types';

/**
 * `wallet_getSnaps` gets the requester's permitted and installed Snaps.
 */
export const getSnapsHandler: PermittedHandlerExport<
  GetSnapsHooks,
  void,
  InstallSnapsResult
> = {
  methodNames: ['wallet_getSnaps'],
  implementation: getSnapsImplementation,
  hookNames: {
    getSnaps: true,
  },
};

export type GetSnapsHooks = {
  /**
   * @returns The permitted and installed snaps for the requesting origin.
   */
  getSnaps: () => InstallSnapsResult;
};

async function getSnapsImplementation(
  _req: unknown,
  res: PendingJsonRpcResponse<InstallSnapsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getSnaps }: GetSnapsHooks,
): Promise<void> {
  // getSnaps is already bound to the origin
  res.result = getSnaps();
  return end();
}
