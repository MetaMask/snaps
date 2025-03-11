import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { providerErrors } from '@metamask/rpc-errors';
import type {
  EntropySource,
  JsonRpcRequest,
  ListEntropySourcesParams,
  ListEntropySourcesResult,
} from '@metamask/snaps-sdk';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import { getBip32EntropyBuilder } from '../restricted/getBip32Entropy';
import { getBip32PublicKeyBuilder } from '../restricted/getBip32PublicKey';
import { getBip44EntropyBuilder } from '../restricted/getBip44Entropy';
import { getEntropyBuilder } from '../restricted/getEntropy';
import type { MethodHooksObject } from '../utils';

/**
 * A list of permissions that the requesting origin must have at least one of
 * in order to call this method.
 */
const REQUIRED_PERMISSIONS = [
  getBip32EntropyBuilder.targetName,
  getBip32PublicKeyBuilder.targetName,
  getBip44EntropyBuilder.targetName,
  getEntropyBuilder.targetName,
];

const hookNames: MethodHooksObject<ListEntropySourcesHooks> = {
  hasPermission: true,
  getEntropySources: true,
  getUnlockPromise: true,
};

export type ListEntropySourcesHooks = {
  /**
   * Check if the requesting origin has a given permission.
   *
   * @param permissionName - The name of the permission to check.
   * @returns Whether the origin has the permission.
   */
  hasPermission: (permissionName: string) => boolean;

  /**
   * Get the entropy sources from the client.
   *
   * @returns The entropy sources.
   */
  getEntropySources: () => EntropySource[];

  /**
   * Wait for the extension to be unlocked.
   *
   * @returns A promise that resolves once the extension is unlocked.
   */
  getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;
};

export const listEntropySourcesHandler: PermittedHandlerExport<
  ListEntropySourcesHooks,
  ListEntropySourcesParams,
  ListEntropySourcesResult
> = {
  methodNames: ['snap_listEntropySources'],
  implementation: listEntropySourcesImplementation,
  hookNames,
};

/**
 * The `snap_listEntropySources` method implementation.
 *
 * @param _request - The JSON-RPC request object. Not used by this function.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.hasPermission - The function to check if the origin has a
 * permission.
 * @param hooks.getEntropySources - The function to get the entropy sources.
 * @param hooks.getUnlockPromise - The function to get the unlock promise.
 * @returns Noting.
 */
async function listEntropySourcesImplementation(
  _request: JsonRpcRequest<ListEntropySourcesParams>,
  response: PendingJsonRpcResponse<ListEntropySourcesResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  {
    hasPermission,
    getEntropySources,
    getUnlockPromise,
  }: ListEntropySourcesHooks,
): Promise<void> {
  const isPermitted = REQUIRED_PERMISSIONS.some(hasPermission);
  if (!isPermitted) {
    return end(providerErrors.unauthorized());
  }

  await getUnlockPromise(true);

  response.result = getEntropySources();
  return end();
}
