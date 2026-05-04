import type { CryptographicFunctions } from '@metamask/key-tree';
import type { Messenger } from '@metamask/messenger';
import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { GetEntropyParams, GetEntropyResult } from '@metamask/snaps-sdk';
import { SIP_6_MAGIC_VALUE } from '@metamask/snaps-utils';
import type { Infer } from '@metamask/superstruct';
import { literal, object, optional, string } from '@metamask/superstruct';
import type { NonEmptyArray } from '@metamask/utils';
import { assertStruct } from '@metamask/utils';

import type { KeyringControllerWithKeyringAction } from '../types';
import type { MethodHooksObject } from '../utils';
import {
  deriveEntropyFromSeed,
  getMnemonicSeed,
  getValueFromEntropySource,
} from '../utils';

const targetName = 'snap_getEntropy';

export type GetEntropyMessengerActions = KeyringControllerWithKeyringAction;

type GetEntropySpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: GetEntropyHooks;
  messenger: Messenger<string, GetEntropyMessengerActions>;
};

type GetEntropySpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof targetName;
  methodImplementation: ReturnType<typeof getEntropyImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

export const GetEntropyArgsStruct = object({
  version: literal(1),
  salt: optional(string()),
  source: optional(string()),
});

/**
 * @property version - The version of the `snap_getEntropy` method. This must be
 * the numeric literal `1`.
 * @property salt - A string to use as the salt when deriving the entropy. If
 * omitted, the salt will be an empty string.
 */
export type GetEntropyArgs = Infer<typeof GetEntropyArgsStruct>;

const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  GetEntropySpecificationBuilderOptions,
  GetEntropySpecification
> = ({
  allowedCaveats = null,
  methodHooks,
  messenger,
}: GetEntropySpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName,
    allowedCaveats,
    methodImplementation: getEntropyImplementation({ methodHooks, messenger }),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<GetEntropyHooks> = {
  getUnlockPromise: true,
  getClientCryptography: true,
};

/**
 * Get a deterministic 256-bit entropy value, specific to the Snap and the
 * user's account. You can use this entropy to generate a private key, or any
 * other value that requires a high level of randomness. Other Snaps can't
 * access this entropy, and it changes if the user's secret recovery phrase
 * changes.
 *
 * You can optionally specify a salt to generate different entropy for different
 * purposes. Using a salt results in entropy unrelated to the entropy generated
 * without a salt.
 *
 * This value is deterministic: it's always the same for the same Snap, user
 * account, and salt.
 *
 * @example
 * ```json name="Manifest"
 * {
 *   "initialPermissions": {
 *     "snap_getEntropy": {}
 *   }
 * }
 * ```
 * ```ts name="Usage"
 * const entropy = await snap.request({
 *   method: 'snap_getEntropy',
 *   params: {
 *     version: 1,
 *     salt: 'foo', // Optional.
 *   },
 * })
 *
 * // '0x...'
 * console.log(entropy)
 * ```
 */
export const getEntropyBuilder = Object.freeze({
  targetName,
  specificationBuilder,
  methodHooks,
  actionNames: ['KeyringController:withKeyring'],
} as const);

export type GetEntropyHooks = {
  /**
   * Waits for the extension to be unlocked.
   *
   * @returns A promise that resolves once the extension is unlocked.
   */
  getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;

  /**
   * Get the cryptographic functions to use for the client. This may return an
   * empty object or `undefined` to fall back to the default cryptographic
   * functions.
   *
   * @returns The cryptographic functions to use for the client.
   */
  getClientCryptography: () => CryptographicFunctions | undefined;
};

/**
 * Builds the method implementation for `snap_getEntropy`. The implementation
 * is based on the reference implementation of
 * [SIP-6](https://metamask.github.io/SIPs/SIPS/sip-6).
 *
 * @param options - The options.
 * @param options.messenger - The messenger.
 * @param options.methodHooks - The RPC method hooks.
 * @param options.methodHooks.getUnlockPromise - The method to get a promise that resolves
 * once the extension is unlocked.
 * @param options.methodHooks.getClientCryptography - A function to retrieve the cryptographic
 * functions to use for the client.
 * @returns The method implementation.
 */
function getEntropyImplementation({
  methodHooks: { getUnlockPromise, getClientCryptography },
  messenger,
}: GetEntropySpecificationBuilderOptions) {
  return async function getEntropy(
    options: RestrictedMethodOptions<GetEntropyParams>,
  ): Promise<GetEntropyResult> {
    const {
      params,
      context: { origin },
    } = options;

    assertStruct(
      params,
      GetEntropyArgsStruct,
      'Invalid "snap_getEntropy" parameters',
      rpcErrors.invalidParams,
    );

    await getUnlockPromise(true);

    const seed = await getValueFromEntropySource(
      getMnemonicSeed.bind(null, messenger),
      params.source,
    );

    return deriveEntropyFromSeed({
      input: origin,
      salt: params.salt,
      seed,
      magic: SIP_6_MAGIC_VALUE,
      cryptographicFunctions: getClientCryptography(),
    });
  };
}
