import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { ethErrors } from 'eth-rpc-errors';
import { BIP44CoinTypeNode, JsonBIP44CoinTypeNode } from '@metamask/key-tree';
import { NonEmptyArray } from '@metamask/utils';

const methodPrefix = 'snap_getBip44Entropy_';
const targetKey = `${methodPrefix}*` as const;

export type GetBip44EntropyLegacyMethodHooks = {
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

type GetBip44EntropyLegacySpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: GetBip44EntropyLegacyMethodHooks;
};

type GetBip44EntropyLegacySpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof targetKey;
  methodImplementation: ReturnType<typeof getBip44EntropyLegacyImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_getBip44Entropy_*` permission.
 * `snap_getBip44Entropy_*` lets the Snap control private keys for a particular
 * BIP-32 coin type.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getBip44Entropy_*` permission.
 * @deprecated Use `snap_getBip44Entropy` instead.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  GetBip44EntropyLegacySpecificationBuilderOptions,
  GetBip44EntropyLegacySpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: GetBip44EntropyLegacySpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetKey,
    allowedCaveats,
    methodImplementation: getBip44EntropyLegacyImplementation(methodHooks),
  };
};

export const getBip44EntropyLegacyBuilder = Object.freeze({
  targetKey,
  specificationBuilder,
  methodHooks: {
    getMnemonic: true,
    getUnlockPromise: true,
  },
} as const);

const ALL_DIGIT_REGEX = /^\d+$/u;

/**
 * Builds the method implementation for `snap_getBip44Entropy_*`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getMnemonic - A function to retrieve the Secret Recovery Phrase of the user.
 * @param hooks.getUnlockPromise - A function that resolves once the MetaMask extension is unlocked and prompts the user to unlock their MetaMask if it is locked.
 * @returns The method implementation which returns a `BIP44CoinTypeNode`.
 * @throws If the params are invalid.
 * @deprecated Use `snap_getBip44Entropy` instead.
 */
function getBip44EntropyLegacyImplementation({
  getMnemonic,
  getUnlockPromise,
}: GetBip44EntropyLegacyMethodHooks) {
  return async function getBip44Entropy(
    args: RestrictedMethodOptions<void>,
  ): Promise<JsonBIP44CoinTypeNode> {
    console.warn(
      '"snap_getBip44Entropy_*" is deprecated in favour of "snap_getBip44Entropy". This will be removed in a future release. Please refer to the documentation for more information.',
    );

    const bip44Code = args.method.substr(methodPrefix.length);
    if (!ALL_DIGIT_REGEX.test(bip44Code)) {
      throw ethErrors.rpc.methodNotFound({
        message: `Invalid BIP-44 code: ${bip44Code}`,
      });
    }

    await getUnlockPromise(true);

    const node = await BIP44CoinTypeNode.fromDerivationPath([
      `bip39:${await getMnemonic()}`,
      `bip32:44'`,
      `bip32:${Number(bip44Code)}'`,
    ]);

    return node.toJSON();
  };
}
