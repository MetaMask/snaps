import { BIP44CoinTypeNode, JsonBIP44CoinTypeNode } from '@metamask/key-tree';
import {
  Caveat,
  PermissionSpecificationBuilder,
  PermissionType,
  PermissionValidatorConstraint,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  PermissionConstraint,
  RestrictedMethodCaveatSpecificationConstraint,
} from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import {
  hasProperty,
  isPlainObject,
  Json,
  NonEmptyArray,
} from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

const targetKey = 'snap_getBip44Entropy';

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
  targetKey: typeof targetKey;
  methodImplementation: ReturnType<typeof getBip44EntropyImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
}>;

type GetBip44EntropyParams = {
  coinType: number;
};

/**
 * Validate the params for `snap_getBip44Entropy`.
 *
 * @param value - The params to validate.
 * @throws If the params are invalid.
 */
export function validateParams(
  value: unknown,
): asserts value is GetBip44EntropyParams {
  if (!isPlainObject(value) || !hasProperty(value, 'coinType')) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a plain object containing a coin type.',
    });
  }

  if (
    typeof value.coinType !== 'number' ||
    !Number.isInteger(value.coinType) ||
    value.coinType < 0 ||
    value.coinType > 0x7fffffff
  ) {
    throw ethErrors.rpc.invalidParams({
      message:
        'Invalid "coinType" parameter. Coin type must be a non-negative integer.',
    });
  }
}

/**
 * Validate the coin types values associated with a caveat. This checks if the
 * values are non-negative integers (>= 0).
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat is invalid.
 */
export function validateCaveat(caveat: Caveat<string, any>) {
  if (
    !hasProperty(caveat, 'value') ||
    !Array.isArray(caveat.value) ||
    caveat.value.length === 0
  ) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected non-empty array of coin types.',
    });
  }

  caveat.value.forEach(validateParams);
}

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
    targetKey,
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
  };
};

export const getBip44EntropyBuilder = Object.freeze({
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
export function getBip44EntropyCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  return {
    caveats: [
      {
        type: SnapCaveatType.PermittedCoinTypes,
        value,
      },
    ],
  };
}

export const getBip44EntropyCaveatSpecifications: Record<
  SnapCaveatType.PermittedCoinTypes,
  RestrictedMethodCaveatSpecificationConstraint
> = {
  [SnapCaveatType.PermittedCoinTypes]: Object.freeze({
    type: SnapCaveatType.PermittedCoinTypes,
    decorator: (
      method,
      caveat: Caveat<
        SnapCaveatType.PermittedCoinTypes,
        GetBip44EntropyParams[]
      >,
    ) => {
      return async (args) => {
        const { params } = args;
        validateParams(params);

        const coinType = caveat.value.find(
          (caveatValue) => caveatValue.coinType === params.coinType,
        );

        if (!coinType) {
          throw ethErrors.provider.unauthorized({
            message:
              'The requested coin type is not permitted. Allowed coin types must be specified in the snap manifest.',
          });
        }

        return await method(args);
      };
    },
    validator: (caveat) => validateCaveat(caveat),
  }),
};

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
