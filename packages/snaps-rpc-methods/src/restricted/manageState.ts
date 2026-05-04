import type { CryptographicFunctions } from '@metamask/key-tree';
import type { Messenger } from '@metamask/messenger';
import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { ManageStateParams, ManageStateResult } from '@metamask/snaps-sdk';
import { ManageStateOperation } from '@metamask/snaps-sdk';
import {
  getJsonSizeUnsafe,
  STATE_ENCRYPTION_MAGIC_VALUE,
} from '@metamask/snaps-utils';
import type { NonEmptyArray } from '@metamask/utils';
import { isObject, isValidJson } from '@metamask/utils';

import type {
  SnapControllerClearSnapStateAction,
  SnapControllerGetSnapAction,
  SnapControllerGetSnapStateAction,
  SnapControllerUpdateSnapStateAction,
} from '../types';
import type { MethodHooksObject } from '../utils';
import { deriveEntropyFromSeed } from '../utils';

// The salt used for SIP-6-based entropy derivation.
export const STATE_ENCRYPTION_SALT = 'snap_manageState encryption';

const methodName = 'snap_manageState';

export type ManageStateMethodHooks = {
  /**
   * Waits for the extension to be unlocked.
   *
   * @returns A promise that resolves once the extension is unlocked.
   */
  getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;
};

export type ManageStateMessengerActions =
  | SnapControllerClearSnapStateAction
  | SnapControllerGetSnapAction
  | SnapControllerGetSnapStateAction
  | SnapControllerUpdateSnapStateAction;

type ManageStateSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: ManageStateMethodHooks;
  messenger: Messenger<string, ManageStateMessengerActions>;
};

type ManageStateSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof getManageStateImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_manageState` permission.
 * `snap_manageState` lets the Snap store and manage some of its state on
 * your device.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.messenger - The messenger.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_manageState` permission.
 */
export const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  ManageStateSpecificationBuilderOptions,
  ManageStateSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
  messenger,
}: ManageStateSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getManageStateImplementation({
      methodHooks,
      messenger,
    }),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<ManageStateMethodHooks> = {
  getUnlockPromise: true,
};

/**
 * Allow the Snap to persist up to 64 MB of data to disk and retrieve it at
 * will. By default, the data is automatically encrypted using a Snap-specific
 * key and automatically decrypted when retrieved. You can set `encrypted` to
 * `false` to use unencrypted storage (available when the client is locked).
 *
 * @example
 * ```json name="Manifest"
 * {
 *   "initialPermissions": {
 *     "snap_manageState": {}
 *   }
 * }
 * ```
 * ```ts name="Usage"
 * // Persist some data.
 * await snap.request({
 *   method: 'snap_manageState',
 *   params: {
 *     operation: 'update',
 *     newState: { hello: 'world' },
 *   },
 * })
 *
 * // At a later time, get the stored data.
 * const persistedData = await snap.request({
 *   method: 'snap_manageState',
 *   params: { operation: 'get' },
 * })
 *
 * console.log(persistedData)
 * // { hello: 'world' }
 *
 * // If there's no need to store data anymore, clear it out.
 * await snap.request({
 *   method: 'snap_manageState',
 *   params: {
 *     operation: 'clear',
 *   },
 * })
 * ```
 */
export const manageStateBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
  actionNames: [
    'SnapController:clearSnapState',
    'SnapController:getSnap',
    'SnapController:getSnapState',
    'SnapController:updateSnapState',
  ],
} as const);

export const STORAGE_SIZE_LIMIT = 64_000_000; // In bytes (64 MB)

type GetEncryptionKeyArgs = {
  snapId: string;
  seed: Uint8Array;
  cryptographicFunctions?: CryptographicFunctions | undefined;
};

/**
 * Get a deterministic encryption key to use for encrypting and decrypting the
 * state.
 *
 * This key should only be used for state encryption using `snap_manageState`.
 * To get other encryption keys, a different salt can be used.
 *
 * @param args - The encryption key args.
 * @param args.snapId - The ID of the snap to get the encryption key for.
 * @param args.seed - The mnemonic seed to derive the encryption key
 * from.
 * @param args.cryptographicFunctions - The cryptographic functions to use for
 * the client.
 * @returns The state encryption key.
 */
export async function getEncryptionEntropy({
  seed,
  snapId,
  cryptographicFunctions,
}: GetEncryptionKeyArgs) {
  return await deriveEntropyFromSeed({
    seed,
    input: snapId,
    salt: STATE_ENCRYPTION_SALT,
    magic: STATE_ENCRYPTION_MAGIC_VALUE,
    cryptographicFunctions,
  });
}

/**
 * Builds the method implementation for `snap_manageState`.
 *
 * @param options - The options.
 * @param options.messenger - The messenger.
 * @param options.methodHooks - The RPC method hooks.
 * @param options.methodHooks.getUnlockPromise - A function that resolves once the MetaMask
 * extension is unlocked and prompts the user to unlock their MetaMask if it is
 * locked.
 * @returns The method implementation which either returns `null` for a
 * successful state update/deletion or returns the decrypted state.
 * @throws If the params are invalid.
 */
export function getManageStateImplementation({
  methodHooks: { getUnlockPromise },
  messenger,
}: ManageStateSpecificationBuilderOptions) {
  return async function manageState(
    options: RestrictedMethodOptions<ManageStateParams>,
  ): Promise<ManageStateResult> {
    const {
      params = {},
      method,
      context: { origin },
    } = options;
    const validatedParams = getValidatedParams(params, method);

    const snap = messenger.call('SnapController:getSnap', origin);

    if (
      !snap?.preinstalled &&
      validatedParams.operation === ManageStateOperation.UpdateState
    ) {
      const size = getJsonSizeUnsafe(validatedParams.newState, true);

      if (size > STORAGE_SIZE_LIMIT) {
        throw rpcErrors.invalidParams({
          message: `Invalid ${method} "newState" parameter: The new state must not exceed ${
            STORAGE_SIZE_LIMIT / 1_000_000
          } MB in size.`,
        });
      }
    }

    // If the encrypted param is undefined or null we default to true.
    const shouldEncrypt = validatedParams.encrypted ?? true;

    // We only need to prompt the user when the mnemonic is needed
    // which it isn't for the clear operation or unencrypted storage.
    if (
      shouldEncrypt &&
      validatedParams.operation !== ManageStateOperation.ClearState
    ) {
      await getUnlockPromise(true);
    }

    switch (validatedParams.operation) {
      case ManageStateOperation.ClearState:
        messenger.call('SnapController:clearSnapState', origin, shouldEncrypt);
        return null;

      case ManageStateOperation.GetState: {
        return await messenger.call(
          'SnapController:getSnapState',
          origin,
          shouldEncrypt,
        );
      }

      case ManageStateOperation.UpdateState: {
        await messenger.call(
          'SnapController:updateSnapState',
          origin,
          validatedParams.newState,
          shouldEncrypt,
        );
        return null;
      }

      /* istanbul ignore next */
      default:
        throw rpcErrors.invalidParams(
          `Invalid ${method} operation: "${
            validatedParams.operation as string
          }"`,
        );
    }
  };
}

/**
 * Validates the manageState method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @param method - RPC method name used for debugging errors.
 * @returns The validated method parameter object.
 */
export function getValidatedParams(
  params: unknown,
  method: string,
): ManageStateParams {
  if (!isObject(params)) {
    throw rpcErrors.invalidParams({
      message: 'Expected params to be a single object.',
    });
  }

  const { operation, newState, encrypted } = params;

  if (
    !operation ||
    typeof operation !== 'string' ||
    !Object.values(ManageStateOperation).includes(
      operation as ManageStateOperation,
    )
  ) {
    throw rpcErrors.invalidParams({
      message: 'Must specify a valid manage state "operation".',
    });
  }

  if (encrypted !== undefined && typeof encrypted !== 'boolean') {
    throw rpcErrors.invalidParams({
      message: '"encrypted" parameter must be a boolean if specified.',
    });
  }

  if (operation === ManageStateOperation.UpdateState) {
    if (!isObject(newState)) {
      throw rpcErrors.invalidParams({
        message: `Invalid ${method} "newState" parameter: The new state must be a plain object.`,
      });
    }

    if (!isValidJson(newState)) {
      throw rpcErrors.invalidParams({
        message: `Invalid ${method} "newState" parameter: The new state must be JSON serializable.`,
      });
    }
  }

  return params as ManageStateParams;
}
