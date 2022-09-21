import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  Caveat,
  PermissionValidatorConstraint,
  RestrictedMethodCaveatSpecificationConstraint,
} from '@metamask/controllers';
import { ethErrors } from 'eth-rpc-errors';
import { NonEmptyArray } from '@metamask/utils';
import { BIP32Node, SLIP10Node } from '@metamask/key-tree';
import { SnapCaveatType } from '@metamask/snap-utils';
import { isEqual } from '../utils';
import { validateCaveatPaths, validatePath } from './getBip32Entropy';

const targetKey = 'snap_getBip32PublicKey';

export type GetBip32PublicKeyMethodHooks = {
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

type GetBip32PublicKeySpecificationBuilderOptions = {
  methodHooks: GetBip32PublicKeyMethodHooks;
};

type GetBip32PublicKeySpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof targetKey;
  methodImplementation: ReturnType<typeof getBip32PublicKeyImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
}>;

type GetBip32PublicKeyParameters = {
  path: ['m', ...(`${number}` | `${number}'`)[]];
  curve: 'secp256k1' | 'ed25519';
  compressed?: boolean;
};

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
    targetKey,
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
  };
};

export const getBip32PublicKeyBuilder = Object.freeze({
  targetKey,
  specificationBuilder,
  methodHooks: {
    getMnemonic: true,
    getUnlockPromise: true,
  },
} as const);

export const getBip32PublicKeyCaveatSpecifications: Record<
  SnapCaveatType.PermittedDerivationPaths,
  RestrictedMethodCaveatSpecificationConstraint
> = {
  [SnapCaveatType.PermittedDerivationPaths]: Object.freeze({
    type: SnapCaveatType.PermittedDerivationPaths,
    decorator: (
      method,
      caveat: Caveat<
        SnapCaveatType.PermittedDerivationPaths,
        GetBip32PublicKeyParameters[]
      >,
    ) => {
      return async (args) => {
        const { params } = args;
        validatePath(params);

        const path = caveat.value.find(
          (caveatPath) =>
            isEqual(params.path, caveatPath.path) &&
            caveatPath.curve === params.curve,
        );

        if (!path) {
          throw ethErrors.provider.unauthorized({
            message:
              'The requested path is not permitted. Allowed paths must be specified in the snap manifest.',
          });
        }

        return await method(args);
      };
    },
    validator: (caveat) => validateCaveatPaths(caveat),
  }),
};

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

    // `args.params` is validated by the decorator, so it's safe to assert here.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const params = args.params!;

    const node = await SLIP10Node.fromDerivationPath({
      curve: params.curve,
      derivationPath: [
        `bip39:${await getMnemonic()}`,
        ...params.path
          .slice(1)
          .map<BIP32Node>((index) => `bip32:${index}` as BIP32Node),
      ],
    });

    if (params.compressed) {
      return node.compressedPublicKeyBuffer.toString('hex');
    }

    return node.publicKey;
  };
}
