import { BIP32Node, SLIP10Node } from '@metamask/key-tree';
import {
  PermissionSpecificationBuilder,
  PermissionType,
  PermissionValidatorConstraint,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  SubjectType,
} from '@metamask/permission-controller';
import {
  bip32entropy,
  Bip32PathStruct,
  SnapCaveatType,
} from '@metamask/snaps-utils';
import { NonEmptyArray, assertStruct } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { boolean, enums, object, optional } from 'superstruct';

import { MethodHooksObject } from '../utils';

const targetName = 'snap_getBip32PublicKey';

export type GetBip32PublicKeyMethodHooks = {
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

type GetBip32PublicKeySpecificationBuilderOptions = {
  methodHooks: GetBip32PublicKeyMethodHooks;
};

type GetBip32PublicKeySpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof targetName;
  methodImplementation: ReturnType<typeof getBip32PublicKeyImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
}>;

type GetBip32PublicKeyParameters = {
  path: ['m', ...(`${number}` | `${number}'`)[]];
  curve: 'secp256k1' | 'ed25519';
  compressed?: boolean;
};

export const Bip32PublicKeyArgsStruct = bip32entropy(
  object({
    path: Bip32PathStruct,
    curve: enums(['ed225519', 'secp256k1']),
    compressed: optional(boolean()),
  }),
);

/**
 * The specification builder for the `snap_getBip32PublicKey` permission.
 * `snap_getBip32PublicKey` lets the Snap retrieve public keys for a particular
 * BIP-32 node.
 *
 * @param options - The specification builder options.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getBip32PublicKey` permission.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  GetBip32PublicKeySpecificationBuilderOptions,
  GetBip32PublicKeySpecification
> = ({ methodHooks }: GetBip32PublicKeySpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName,
    allowedCaveats: [SnapCaveatType.PermittedDerivationPaths],
    methodImplementation: getBip32PublicKeyImplementation(methodHooks),
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

const methodHooks: MethodHooksObject<GetBip32PublicKeyMethodHooks> = {
  getMnemonic: true,
  getUnlockPromise: true,
};

export const getBip32PublicKeyBuilder = Object.freeze({
  targetName,
  specificationBuilder,
  methodHooks,
} as const);

/**
 * Builds the method implementation for `snap_getBip32PublicKey`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getMnemonic - A function to retrieve the Secret Recovery Phrase of the user.
 * @param hooks.getUnlockPromise - A function that resolves once the MetaMask extension is unlocked
 * and prompts the user to unlock their MetaMask if it is locked.
 * @returns The method implementation which returns a public key.
 * @throws If the params are invalid.
 */
export function getBip32PublicKeyImplementation({
  getMnemonic,
  getUnlockPromise,
}: GetBip32PublicKeyMethodHooks) {
  return async function getBip32PublicKey(
    args: RestrictedMethodOptions<GetBip32PublicKeyParameters>,
  ): Promise<string> {
    await getUnlockPromise(true);

    assertStruct(
      args.params,
      Bip32PublicKeyArgsStruct,
      'Invalid BIP-32 public key params',
      ethErrors.rpc.invalidParams,
    );

    const { params } = args;

    const node = await SLIP10Node.fromDerivationPath({
      curve: params.curve,
      derivationPath: [
        await getMnemonic(),
        ...params.path
          .slice(1)
          .map<BIP32Node>((index) => `bip32:${index}` as BIP32Node),
      ],
    });

    if (params.compressed) {
      return node.compressedPublicKey;
    }

    return node.publicKey;
  };
}
