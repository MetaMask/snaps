import {
  constructPermission,
  PermissionFactory,
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  CaveatSpecificationConstraint,
  Caveat,
} from '@metamask/controllers';
import { ethErrors } from 'eth-rpc-errors';
import { NonEmptyArray } from '@metamask/utils';
import { BIP32Node, JsonSLIP10Node, SLIP10Node } from '@metamask/key-tree';

import { SnapCaveatType } from '../caveats';

const DERIVATION_PATH_REGEX = /^m(\/[0-9]+'?)+$/u;

const targetKey = 'snap_getBip32Entropy';

export type GetBip32EntropyMethodHooks = {
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

type GetBip32EntropySpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: GetBip32EntropyMethodHooks;
};

type GetBip32EntropySpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof targetKey;
  methodImplementation: ReturnType<typeof getBip32EntropyImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

type GetBip32EntropyParameters = {
  path: string;
  curve?: 'secp256k1' | 'ed25519';
};

// TODO: See if this is necessary.
const getBip32EntropyFactory: PermissionFactory<any, any> = (
  permissionOptions,
) => {
  return constructPermission(permissionOptions);
};

/**
 * Validate a path object.
 *
 * @param value - The value to validate.
 * @throws If the value is invalid.
 */
function validatePath(
  value: unknown,
): asserts value is GetBip32EntropyParameters {
  // TODO: Use `@metamask/utils`. The extension currently uses an old version of
  // `utils`, so this is just a workaround for testing.
  const isPlainObject = (v: unknown): v is Record<string, unknown> => {
    return true;
  };

  if (!isPlainObject(value)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  if (
    !('path' in value) ||
    typeof value.path !== 'string' ||
    !DERIVATION_PATH_REGEX.test(value.path)
  ) {
    throw ethErrors.rpc.invalidParams({
      message: `Invalid "path" parameter. The path must be a valid BIP-32 derivation path.`,
    });
  }

  if (
    !('curve' in value) ||
    (value.curve !== 'secp256k1' && value.curve !== 'ed25519')
  ) {
    throw ethErrors.rpc.invalidParams({
      message: `Invalid "curve" parameter. The curve must be "secp256k1" or "ed25519".`,
    });
  }
}

/**
 * Validate the path values associated with a caveat. This validates that the
 * value is a non-empty array with valid derivation paths and curves.
 *
 * @param value - The value to validate.
 * @throws If the value is invalid.
 */
function validateCaveatPaths(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected non-empty array of paths.',
    });
  }

  value.forEach((path) => validatePath(path));
}

/**
 * The specification builder for the `snap_getBip32Entropy` permission.
 * `snap_getBip32Entropy` lets the Snap control private keys for a particular
 * BIP-32 node.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getBip32Entropy` permission.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  GetBip32EntropySpecificationBuilderOptions,
  GetBip32EntropySpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: GetBip32EntropySpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetKey,
    allowedCaveats: [
      SnapCaveatType.PermittedDerivationPaths,
      ...(allowedCaveats ?? []),
    ],
    factory: getBip32EntropyFactory,
    methodImplementation: getBip32EntropyImplementation(methodHooks),
  };
};

export const getBip32EntropyBuilder = Object.freeze({
  targetKey,
  specificationBuilder,
  methodHooks: {
    getMnemonic: true,
    getUnlockPromise: true,
  },
} as const);

export const getBip32EntropyCaveatSpecificationBuilder: CaveatSpecificationConstraint =
  Object.freeze({
    type: SnapCaveatType.PermittedDerivationPaths,
    decorator: (
      method,
      caveat: Caveat<
        SnapCaveatType.PermittedDerivationPaths,
        GetBip32EntropyParameters[]
      >,
    ) => {
      return async (args) => {
        const { params } = args;
        validatePath(params);

        const path = caveat.value.find(
          (caveatPath) =>
            caveatPath.path === params.path &&
            caveatPath.curve === params.curve,
        );

        if (!path) {
          throw ethErrors.rpc.invalidParams({
            message: 'Requested path is not permitted.',
          });
        }

        return await method(args);
      };
    },
    validator: (caveat) => validateCaveatPaths(caveat.value),
  });

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
function getBip32EntropyImplementation({
  getMnemonic,
  getUnlockPromise,
}: GetBip32EntropyMethodHooks) {
  return async function getBip32Entropy(
    args: RestrictedMethodOptions<GetBip32EntropyParameters>,
  ): Promise<JsonSLIP10Node> {
    // TODO: Verify shape of `args.params`.
    const derivationPath = args.params?.path;
    if (!derivationPath) {
      throw ethErrors.rpc.invalidParams({
        message: `Missing "path" parameter.`,
      });
    }

    await getUnlockPromise(true);

    const node = await SLIP10Node.fromDerivationPath({
      curve: args.params?.curve ?? 'secp256k1',
      derivationPath: [
        `bip39:${await getMnemonic()}`,
        ...derivationPath
          .split('/')
          .slice(1)
          .map((index) => `bip32:${index}` as BIP32Node),
      ],
    });

    return node.toJSON();
  };
}
