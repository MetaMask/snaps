import { ethErrors } from 'eth-rpc-errors';
import { RequestedPermissions } from '@metamask/controllers';
import {
  PermittedHandlerExport,
  JsonRpcRequest,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from '@metamask/types';
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

/**
 * The `wallet_installSnaps` method implementation.
 * Tries to install the requested snaps and adds them to the JSON-RPC response.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.installSnaps - A function that tries to install a given snap, prompting the user if necessary.
 * @returns A promise that resolves once the JSON-RPC response has been modified.
 * @throws If the params are invalid.
 */
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
