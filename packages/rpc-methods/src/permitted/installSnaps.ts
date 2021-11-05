import {
  JsonRpcRequest,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { IRequestedPermissions } from 'rpc-cap/dist/src/@types';
import { PermittedHandlerExport } from '../../types';
import {
  handleInstallSnaps,
  InstallSnapsHook,
  InstallSnapsResult,
} from './common/snapInstallation';

export const installSnapsHandler: PermittedHandlerExport<
  InstallSnapsHooks,
  [IRequestedPermissions],
  InstallSnapsResult
> = {
  methodNames: ['wallet_installSnaps'],
  implementation: installSnapsImplementation,
  methodDescription: 'Installs the requested snaps if they are permitted.',
  hookNames: {
    installSnaps: true,
  },
};

export interface InstallSnapsHooks {
  /**
   * Installs the requested snaps if they are permitted.
   */
  installSnaps: InstallSnapsHook;
}

async function installSnapsImplementation(
  req: JsonRpcRequest<[IRequestedPermissions]>,
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
