import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
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
import type { KeyringControllerGetStateAction } from '../types';
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

/**
 * The keyring type used by HD (mnemonic-based) keyrings.
 */
const HD_KEYRING_TYPE = 'HD Key Tree';

const hookNames: MethodHooksObject<ListEntropySourcesMethodHooks> = {
  getUnlockPromise: true,
};

export type ListEntropySourcesMethodHooks = {
  /**
   * Wait for the extension to be unlocked.
   *
   * @returns A promise that resolves once the extension is unlocked.
   */
  getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;
};

export type ListEntropySourcesMethodActions =
  | PermissionControllerHasPermissionAction
  | KeyringControllerGetStateAction;

/**
 * Get a list of entropy sources available to the Snap. The requesting origin
 * must have at least one of the following permissions to access entropy source
 * metadata:
 *
 * - `snap_getBip32Entropy`
 * - `snap_getBip32PublicKey`
 * - `snap_getBip44Entropy`
 * - `snap_getEntropy`
 *
 * @example
 * ```json name="Manifest"
 * {
 *   "initialPermissions": {
 *     "snap_getBip32Entropy": {}
 *   }
 * }
 * ```
 * ```ts name="Usage"
 * const entropySources = await snap.request({ method: 'snap_listEntropySources' });
 * console.log(entropySources);
 * // Example output:
 * // [
 * //   {
 * //     name: 'Mnemonic 1',
 * //     id: 'mnemonic-1',
 * //     type: 'mnemonic',
 * //     primary: true,
 * //   },
 * //   {
 * //     name: 'Mnemonic 2',
 * //     id: 'mnemonic-2',
 * //     type: 'mnemonic',
 * //     primary: false,
 * //   },
 * // ]
 * ```
 */
export const listEntropySourcesHandler = {
  implementation: listEntropySourcesImplementation,
  hookNames,
  actionNames: [
    'PermissionController:hasPermission',
    'KeyringController:getState',
  ],
} satisfies MethodHandler<
  ListEntropySourcesMethodHooks,
  ListEntropySourcesMethodActions,
  ListEntropySourcesParams,
  ListEntropySourcesResult,
  { origin: string }
>;

/**
 * The `snap_listEntropySources` method implementation.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getUnlockPromise - The function to get the unlock promise.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
async function listEntropySourcesImplementation(
  request: JsonRpcRequest<ListEntropySourcesParams> & { origin: string },
  response: PendingJsonRpcResponse<ListEntropySourcesResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getUnlockPromise }: ListEntropySourcesMethodHooks,
  messenger: Messenger<string, ListEntropySourcesMethodActions>,
): Promise<void> {
  const { origin } = request;

  const isPermitted = REQUIRED_PERMISSIONS.some((permission) =>
    messenger.call('PermissionController:hasPermission', origin, permission),
  );

  if (!isPermitted) {
    return end(providerErrors.unauthorized());
  }

  await getUnlockPromise(true);

  const { keyrings } = messenger.call('KeyringController:getState');

  response.result = keyrings
    .map((keyring, index) => {
      if (keyring.type === HD_KEYRING_TYPE) {
        return {
          id: keyring.metadata.id,
          name: keyring.metadata.name,
          type: 'mnemonic',
          primary: index === 0,
        };
      }

      return null;
    })
    .filter((entropySource): entropySource is EntropySource =>
      Boolean(entropySource),
    );

  return end();
}
