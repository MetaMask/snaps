import type {
  BIP32Node,
  JsonSLIP10Node,
  SLIP10PathNode,
} from '@metamask/key-tree';
import { SLIP10Node } from '@metamask/key-tree';
import type {
  PermissionSpecificationBuilder,
  PermissionValidatorConstraint,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import type { Bip32Entropy } from '@metamask/snaps-utils';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { NonEmptyArray } from '@metamask/utils';
import { assert } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

import type { MethodHooksObject } from '../utils';

const targetName = 'snap_getBip32Entropy';

export type GetBip32EntropyMethodHooks = {
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

type GetBip32EntropySpecificationBuilderOptions = {
  methodHooks: GetBip32EntropyMethodHooks;
};

type GetBip32EntropySpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof targetName;
  methodImplementation: ReturnType<typeof getBip32EntropyImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
}>;

/**
 * The specification builder for the `snap_getBip32Entropy` permission.
 * `snap_getBip32Entropy` lets the Snap control private keys for a particular
 * BIP-32 node.
 *
 * @param options - The specification builder options.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getBip32Entropy` permission.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  GetBip32EntropySpecificationBuilderOptions,
  GetBip32EntropySpecification
> = ({ methodHooks }: GetBip32EntropySpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName,
    allowedCaveats: [SnapCaveatType.PermittedDerivationPaths],
    methodImplementation: getBip32EntropyImplementation(methodHooks),
    validator: ({ caveats }) => {
      if (
        caveats?.length !== 1 ||
        caveats[0].type !== SnapCaveatType.PermittedDerivationPaths
      ) {
        throw ethErrors.rpc.invalidParams({
          message: `Expected a single "${SnapCaveatType.PermittedDerivationPaths}" caveat.`,
        });
      }
    },
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<GetBip32EntropyMethodHooks> = {
  getMnemonic: true,
  getUnlockPromise: true,
};

export const getBip32EntropyBuilder = Object.freeze({
  targetName,
  specificationBuilder,
  methodHooks,
} as const);

/**
 * Builds the method implementation for `snap_getBip32Entropy`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getMnemonic - A function to retrieve the Secret Recovery Phrase of the user.
 * @param hooks.getUnlockPromise - A function that resolves once the MetaMask extension is unlocked
 * and prompts the user to unlock their MetaMask if it is locked.
 * @returns The method implementation which returns a `JsonSLIP10Node`.
 * @throws If the params are invalid.
 */
export function getBip32EntropyImplementation({
  getMnemonic,
  getUnlockPromise,
}: GetBip32EntropyMethodHooks) {
  return async function getBip32Entropy(
    args: RestrictedMethodOptions<Bip32Entropy>,
  ): Promise<JsonSLIP10Node> {
    await getUnlockPromise(true);

    const { params } = args;
    assert(params);

    const prefix = params.curve === 'ed25519' ? 'slip10' : 'bip32';

    const node = await SLIP10Node.fromDerivationPath({
      curve: params.curve,
      derivationPath: [
        await getMnemonic(),
        ...(params.path.slice(1).map((index) => `${prefix}:${index}`) as
          | BIP32Node[]
          | SLIP10PathNode[]),
      ],
    });

    return node.toJSON();
  };
}
