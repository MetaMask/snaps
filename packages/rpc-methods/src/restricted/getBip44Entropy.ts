import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { ethErrors } from 'eth-rpc-errors';
import { BIP44CoinTypeNode, JsonBIP44CoinTypeNode } from '@metamask/key-tree';
import { NonEmptyArray } from '@metamask/snap-controllers';

// TODO: Remove this after key-tree is bumped
// We redeclare this type locally because the import relies on an interface,
// which is incompatible with our Json type.
type _JsonBIP44CoinTypeNode = {
  // eslint-disable-next-line camelcase
  coin_type: number;
  depth: JsonBIP44CoinTypeNode['depth'];
  key: string;
  path: JsonBIP44CoinTypeNode['path'];
};

const methodPrefix = 'snap_getBip44Entropy_';
const targetKey = `${methodPrefix}*` as const;

export type GetBip44EntropyMethodHooks = {
  /**
   * @returns The mnemonic of the user's primary keyring.
   */
  getMnemonic: () => Promise<string>;
};

type GetBip44EntropySpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: GetBip44EntropyMethodHooks;
};

type GetBip44EntropySpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof targetKey;
  methodImplementation: ReturnType<typeof getBip44EntropyImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * `snap_getBip44Entropy_*` lets the Snap control private keys for a particular
 * BIP-32 coin type.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  GetBip44EntropySpecificationBuilderOptions,
  GetBip44EntropySpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: GetBip44EntropySpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetKey,
    allowedCaveats,
    methodImplementation: getBip44EntropyImplementation(methodHooks),
  };
};

export const getBip44EntropyBuilder = Object.freeze({
  targetKey,
  specificationBuilder,
  methodHooks: {
    getMnemonic: true,
  },
} as const);

const ALL_DIGIT_REGEX = /^\d+$/u;

function getBip44EntropyImplementation({
  getMnemonic,
}: GetBip44EntropyMethodHooks) {
  return async function getBip44Entropy(
    args: RestrictedMethodOptions<void>,
  ): Promise<_JsonBIP44CoinTypeNode> {
    const bip44Code = args.method.substr(methodPrefix.length);
    if (!ALL_DIGIT_REGEX.test(bip44Code)) {
      throw ethErrors.rpc.methodNotFound({
        message: `Invalid BIP-44 code: ${bip44Code}`,
      });
    }

    return new BIP44CoinTypeNode([
      `bip39:${await getMnemonic()}`,
      `bip32:44'`,
      `bip32:${Number(bip44Code)}'`,
    ]).toJSON();
  };
}
