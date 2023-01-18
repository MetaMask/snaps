import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { SIP_6_MAGIC_VALUE } from '@metamask/snaps-utils';
import { assertStruct, Hex, NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { Infer, literal, object, optional, string } from 'superstruct';

import { deriveEntropy } from '../utils';

const targetKey = 'snap_getEntropy';

type GetEntropySpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: GetEntropyHooks;
};

type GetEntropySpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof targetKey;
  methodImplementation: ReturnType<typeof getEntropyImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

export const GetEntropyArgsStruct = object({
  version: literal(1),
  salt: optional(string()),
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
}: GetEntropySpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetKey,
    allowedCaveats,
    methodImplementation: getEntropyImplementation(methodHooks),
  };
};

export const getEntropyBuilder = Object.freeze({
  targetKey,
  specificationBuilder,
  methodHooks: {
    getMnemonic: true,
    getUnlockPromise: true,
  },
} as const);

export type GetEntropyHooks = {
  /**
   * @returns The mnemonic of the user's primary keyring.
   */
  getMnemonic: () => Promise<Uint8Array>;

  /**
   * Waits for the extension to be unlocked.
   *
   * @returns A promise that resolves once the extension is unlocked.
   */
  getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;
};

/**
 * Builds the method implementation for `snap_getEntropy`. The implementation
 * is based on the reference implementation of
 * [SIP-6](https://metamask.github.io/SIPs/SIPS/sip-6).
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getMnemonic - The method to get the mnemonic of the user's
 * primary keyring.
 * @param hooks.getUnlockPromise - The method to get a promise that resolves
 * once the extension is unlocked.
 * @returns The method implementation.
 */
function getEntropyImplementation({
  getMnemonic,
  getUnlockPromise,
}: GetEntropyHooks) {
  return async function getEntropy(
    options: RestrictedMethodOptions<GetEntropyArgs>,
  ): Promise<Hex> {
    const {
      params,
      context: { origin },
    } = options;

    assertStruct(
      params,
      GetEntropyArgsStruct,
      'Invalid "snap_getEntropy" parameters',
      ethErrors.rpc.invalidParams,
    );

    await getUnlockPromise(true);
    const mnemonicPhrase = await getMnemonic();

    return deriveEntropy({
      input: origin,
      salt: params.salt,
      mnemonicPhrase,
      magic: SIP_6_MAGIC_VALUE,
    });
  };
}
