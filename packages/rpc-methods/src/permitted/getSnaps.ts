import {
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from 'json-rpc-engine';
import { InstallSnapsResult } from '@metamask/snap-controllers';
import { PermittedHandlerExport } from '../../types';

export const getSnapsHandler: PermittedHandlerExport<
  GetSnapsHooks,
  void,
  InstallSnapsResult
> = {
  methodNames: ['wallet_getSnaps'],
  implementation: getSnapsImplementation,
  methodDescription: "Get requester's permitted and installed snaps.",
  hookNames: {
    getSnaps: true,
  },
};

export interface GetSnapsHooks {
  /**
   * @returns The permitted and installed snaps for the requesting origin.
   */
  getSnaps: () => InstallSnapsResult;
}

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
