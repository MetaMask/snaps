import { ethErrors } from 'eth-rpc-errors';
import { Infer, literal, object, optional, string } from 'superstruct';
import {
  add0x,
  assert,
  assertStruct,
  concatBytes,
  Hex,
  NonEmptyArray,
  stringToBytes,
} from '@metamask/utils';
import { HardenedBIP32Node, SLIP10Node } from '@metamask/key-tree';
import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { keccak_256 as keccak256 } from '@noble/hashes/sha3';

// 0xd36e6170 - 0x80000000
export const SIP_6_MAGIC_VALUE = `1399742832'` as `${number}'`;
const HARDENED_VALUE = 0x80000000;

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
  getMnemonic: () => Promise<string>;

  /**
   * Waits for the extension to be unlocked.
   *
   * @returns A promise that resolves once the extension is unlocked.
   */
  getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;
};

/**
 * Get a BIP-32 derivation path array from a hash, which is compatible with
 * `@metamask/key-tree`. The hash is assumed to be 32 bytes long.
 *
 * @param hash - The hash to derive indices from.
 * @returns The derived indices as a {@link HardenedBIP32Node} array.
 */
function getDerivationPathArray(hash: Uint8Array): HardenedBIP32Node[] {
  const array: HardenedBIP32Node[] = [];
  const view = new DataView(hash.buffer, hash.byteOffset, hash.byteLength);

  for (let index = 0; index < 8; index++) {
    const uint32 = view.getUint32(index * 4);

    // This is essentially `index | 0x80000000`. Because JavaScript numbers are
    // signed, we use the bitwise unsigned right shift operator to ensure that
    // the result is a positive number.
    // eslint-disable-next-line no-bitwise
    const pathIndex = (uint32 | HARDENED_VALUE) >>> 0;
    array.push(`bip32:${pathIndex - HARDENED_VALUE}'` as const);
  }

  return array;
}

/**
 * Derive entropy from the given mnemonic phrase and salt.
 *
 * This is based on the reference implementation of
 * [SIP-6](https://metamask.github.io/SIPs/SIPS/sip-6).
 *
 * @param snapId - The snap ID to derive entropy for.
 * @param mnemonicPhrase - The mnemonic phrase to derive entropy from.
 * @param salt - The salt to use when deriving entropy.
 * @returns The derived entropy.
 */
export async function deriveEntropy(
  snapId: string,
  mnemonicPhrase: string,
  salt = '',
): Promise<Hex> {
  const snapIdBytes = stringToBytes(snapId);
  const saltBytes = stringToBytes(salt);

  // Get the derivation path from the snap ID.
  const hash = keccak256(concatBytes([snapIdBytes, keccak256(saltBytes)]));
  const computedDerivationPath = getDerivationPathArray(hash);

  // Derive the private key using BIP-32.
  const { privateKey } = await SLIP10Node.fromDerivationPath({
    derivationPath: [
      `bip39:${mnemonicPhrase}`,
      `bip32:${SIP_6_MAGIC_VALUE}`,
      ...computedDerivationPath,
    ],
    curve: 'secp256k1',
  });

  // This should never happen, but this keeps TypeScript happy.
  assert(privateKey, 'Failed to derive the entropy.');

  return add0x(privateKey);
}

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

    return deriveEntropy(origin, mnemonicPhrase, params.salt);
  };
}
