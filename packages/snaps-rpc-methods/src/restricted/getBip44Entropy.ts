import type { JsonBIP44CoinTypeNode } from '@metamask/key-tree';
import { BIP44CoinTypeNode } from '@metamask/key-tree';
import type {
  PermissionSpecificationBuilder,
  PermissionValidatorConstraint,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

import type { MethodHooksObject } from '../utils';

const targetName = 'snap_getBip44Entropy';

export type GetBip44EntropyMethodHooks = {
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

type GetBip44EntropySpecificationBuilderOptions = {
  methodHooks: GetBip44EntropyMethodHooks;
};

type GetBip44EntropySpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof targetName;
  methodImplementation: ReturnType<typeof getBip44EntropyImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
}>;

export type GetBip44EntropyParams = {
  coinType: number;
};

/**
 * The specification builder for the `snap_getBip44Entropy` permission.
 * `snap_getBip44Entropy_*` lets the Snap control private keys for a particular
 * BIP-32 coin type.
 *
 * @param options - The specification builder options.
 * @param options.methodHooks - The RPC method hooks needed by the method
 * implementation.
 * @returns The specification for the `snap_getBip44Entropy` permission.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  GetBip44EntropySpecificationBuilderOptions,
  GetBip44EntropySpecification
> = ({ methodHooks }: GetBip44EntropySpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName,
    allowedCaveats: [SnapCaveatType.PermittedCoinTypes],
    methodImplementation: getBip44EntropyImplementation(methodHooks),
    validator: ({ caveats }) => {
      if (
        caveats?.length !== 1 ||
        caveats[0].type !== SnapCaveatType.PermittedCoinTypes
      ) {
        throw ethErrors.rpc.invalidParams({
          message: `Expected a single "${SnapCaveatType.PermittedCoinTypes}" caveat.`,
        });
      }
    },
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<GetBip44EntropyMethodHooks> = {
  getMnemonic: true,
  getUnlockPromise: true,
};

export const getBip44EntropyBuilder = Object.freeze({
  targetName,
  specificationBuilder,
  methodHooks,
} as const);

/**
 * Builds the method implementation for `snap_getBip44Entropy`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getMnemonic - A function to retrieve the Secret Recovery Phrase
 * of the user.
 * @param hooks.getUnlockPromise - A function that resolves once the MetaMask
 * extension is unlocked and prompts the user to unlock their MetaMask if it is
 * locked.
 * @returns The method implementation which returns a `BIP44CoinTypeNode`.
 * @throws If the params are invalid.
 */
export function getBip44EntropyImplementation({
  getMnemonic,
  getUnlockPromise,
}: GetBip44EntropyMethodHooks) {
  return async function getBip44Entropy(
    args: RestrictedMethodOptions<GetBip44EntropyParams>,
  ): Promise<JsonBIP44CoinTypeNode> {
    await getUnlockPromise(true);

    // `args.params` is validated by the decorator, so it's safe to assert here.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const params = args.params!;

    const node = await BIP44CoinTypeNode.fromDerivationPath([
      await getMnemonic(),
      `bip32:44'`,
      `bip32:${params.coinType}'`,
    ]);

    return node.toJSON();
  };
}
