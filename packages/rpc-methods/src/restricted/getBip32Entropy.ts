import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  Caveat,
  PermissionValidatorConstraint,
  PermissionConstraint,
  RestrictedMethodCaveatSpecificationConstraint,
} from '@metamask/controllers';
import { ethErrors } from 'eth-rpc-errors';
import {
  hasProperty,
  isPlainObject,
  Json,
  NonEmptyArray,
} from '@metamask/utils';
import { BIP32Node, JsonSLIP10Node, SLIP10Node } from '@metamask/key-tree';
import { SnapCaveatType } from '@metamask/snap-utils';
import { isEqual } from '../utils';

const INDEX_REGEX = /^\d+'?$/u;

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
  methodHooks: GetBip32EntropyMethodHooks;
};

type GetBip32EntropySpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof targetKey;
  methodImplementation: ReturnType<typeof getBip32EntropyImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
}>;

type GetBip32EntropyParameters = {
  path: ['m', ...(`${number}` | `${number}'`)[]];
  curve: 'secp256k1' | 'ed25519';
};

/**
 * Validate a caveat path object. The object must consist of a `path` array and
 * optionally a `curve` string. Paths must start with `m`, and must contain at
 * least two indices. If `ed25519` is used, this checks if all the path indices
 * are hardened.
 *
 * @param value - The value to validate.
 * @throws If the value is invalid.
 */
export function validatePath(
  value: unknown,
): asserts value is GetBip32EntropyParameters {
  if (!isPlainObject(value)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  if (
    !hasProperty(value, 'path') ||
    !Array.isArray(value.path) ||
    value.path.length === 0
  ) {
    throw ethErrors.rpc.invalidParams({
      message: `Invalid "path" parameter. The path must be a non-empty BIP-32 derivation path array.`,
    });
  }

  if (value.path[0] !== 'm') {
    throw ethErrors.rpc.invalidParams({
      message: `Invalid "path" parameter. The path must start with "m".`,
    });
  }

  if (
    value.path
      .slice(1)
      .some((v) => typeof v !== 'string' || !INDEX_REGEX.test(v))
  ) {
    throw ethErrors.rpc.invalidParams({
      message: `Invalid "path" parameter. The path must be a valid BIP-32 derivation path array.`,
    });
  }

  if (value.path.length < 3) {
    throw ethErrors.rpc.invalidParams({
      message: `Invalid "path" parameter. Paths must have a length of at least three.`,
    });
  }

  if (
    !hasProperty(value, 'curve') ||
    (value.curve !== 'secp256k1' && value.curve !== 'ed25519')
  ) {
    throw ethErrors.rpc.invalidParams({
      message: `Invalid "curve" parameter. The curve must be "secp256k1" or "ed25519".`,
    });
  }

  if (
    value.curve === 'ed25519' &&
    value.path.slice(1).some((v) => !v.endsWith("'"))
  ) {
    throw ethErrors.rpc.invalidParams({
      message: `Invalid "path" parameter. Ed25519 does not support unhardened paths.`,
    });
  }
}

/**
 * Validate the path values associated with a caveat. This validates that the
 * value is a non-empty array with valid derivation paths and curves.
 *
 * @param caveat - The caveat to validate.
 * @throws If the value is invalid.
 */
export function validateCaveatPaths(caveat: Caveat<string, any>) {
  if (
    !hasProperty(caveat, 'value') ||
    !Array.isArray(caveat.value) ||
    caveat.value.length === 0
  ) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected non-empty array of paths.',
    });
  }

  caveat.value.forEach((path) => validatePath(path));
}

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
    targetKey,
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

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function getBip32EntropyCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  return {
    caveats: [
      {
        type: SnapCaveatType.PermittedDerivationPaths,
        value,
      },
    ],
  };
}

export const getBip32EntropyCaveatSpecifications: Record<
  SnapCaveatType.PermittedDerivationPaths,
  RestrictedMethodCaveatSpecificationConstraint
> = {
  [SnapCaveatType.PermittedDerivationPaths]: Object.freeze({
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
            isEqual(
              params.path.slice(0, caveatPath.path.length),
              caveatPath.path,
            ) && caveatPath.curve === params.curve,
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
    args: RestrictedMethodOptions<GetBip32EntropyParameters>,
  ): Promise<JsonSLIP10Node> {
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

    return node.toJSON();
  };
}
