import {
  JsonRpcRequest,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { RequestedPermissions } from '@metamask/controllers';
import { PermittedHandlerExport } from '@metamask/types';
import {
  handleInstallSnaps,
  InstallSnapsHook,
  InstallSnapsResult,
} from './common/snapInstallation';

/**
 * `wallet_installSnaps` installs the requested Snaps, if they are permitted.
 */
export const installSnapsHandler: PermittedHandlerExport<
  InstallSnapsHooks,
  [RequestedPermissions],
  InstallSnapsResult
> = {
  methodNames: ['wallet_installSnaps'],
  implementation: installSnapsImplementation,
  hookNames: {
    installSnaps: true,
  },
};

export type InstallSnapsHooks = {
  /**
   * Installs the requested snaps if they are permitted.
   */
  installSnaps: InstallSnapsHook;
};

async function installSnapsImplementation(
  req: JsonRpcRequest<[RequestedPermissions]>,
  res: PendingJsonRpcResponse<InstallSnapsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { installSnaps }: InstallSnapsHooks,
): Promise<void> {
  if (!Array.isArray(req.params)) {
    return end(
      ethErrors.rpc.invalidParams({
        message: '"params" must be an array.',
      }),
    );
  }

  try {
    res.result = await handleInstallSnaps(req.params[0], installSnaps);
  } catch (err) {
    res.error = err as Error;
  }
  return end();
}
