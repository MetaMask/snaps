import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { ethErrors } from 'eth-rpc-errors';
import { JsonSLIP10Node, SLIP10Node } from '@metamask/key-tree';
import { NonEmptyArray } from '@metamask/utils';

const methodPrefix = 'snap_getEd25519Entropy_';
const targetKey = `${methodPrefix}*` as const;

export type GetEd25519EntropyMethodHooks = {
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

type GetEd25519EntropySpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: GetEd25519EntropyMethodHooks;
};

type GetEd25519EntropySpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof targetKey;
  methodImplementation: ReturnType<typeof getEd25519EntropyImplementation>;
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
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  GetEd25519EntropySpecificationBuilderOptions,
  GetEd25519EntropySpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: GetEd25519EntropySpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetKey,
    allowedCaveats,
    methodImplementation: getEd25519EntropyImplementation(methodHooks),
  };
};

export const getEd25519EntropyBuilder = Object.freeze({
  targetKey,
  specificationBuilder,
  methodHooks: {
    getMnemonic: true,
    getUnlockPromise: true,
  },
} as const);

const ALL_DIGIT_REGEX = /^\d+$/u;

/**
 * Builds the method implementation for `snap_getEd25519Entropy_*`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getMnemonic - A function to retrieve the Secret Recovery Phrase
 * of the user.
 * @param hooks.getUnlockPromise - A function that resolves once the MetaMask
 * extension is unlocked and prompts the user to unlock their MetaMask if it is
 * locked.
 * @returns The method implementation which returns a `SLIP10Node`.
 * @throws If the params are invalid.
 */
function getEd25519EntropyImplementation({
  getMnemonic,
  getUnlockPromise,
}: GetEd25519EntropyMethodHooks) {
  return async function getEd25519Entropy(
    args: RestrictedMethodOptions<void>,
  ): Promise<JsonSLIP10Node> {
    const slip10Code = args.method.substr(methodPrefix.length);
    if (!ALL_DIGIT_REGEX.test(slip10Code)) {
      throw ethErrors.rpc.methodNotFound({
        message: `Invalid SLIP-10 code: ${slip10Code}`,
      });
    }

    await getUnlockPromise(true);

    const node = await SLIP10Node.fromDerivationPath({
      curve: 'ed25519',
      derivationPath: [
        `bip39:${await getMnemonic()}`,
        `bip32:${Number(slip10Code)}'`,
      ],
    });

    return node.toJSON();
  };
}
