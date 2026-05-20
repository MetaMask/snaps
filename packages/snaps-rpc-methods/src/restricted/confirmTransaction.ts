import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import {
  create,
  literal,
  number,
  object,
  optional,
  string,
  union,
} from '@metamask/superstruct';
import type { NonEmptyArray } from '@metamask/utils';
import { isObject } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_confirmTransaction';

export type ConfirmTransactionParams = {
  chainNamespace: 'solana' | 'bip122' | 'tron';
  chain: string;
  accountId: string;
  from: string;
  to: string;
  value: string;
  assetType: string;
  assetSymbol: string;
  assetDecimals: number;
  feeRaw?: string;
  feeAssetType?: string;
  origin?: string;
};

const ConfirmTransactionParametersStruct = object({
  chainNamespace: union([literal('solana'), literal('bip122'), literal('tron')]),
  chain: string(),
  accountId: string(),
  from: string(),
  to: string(),
  value: string(),
  assetType: string(),
  assetSymbol: string(),
  assetDecimals: number(),
  feeRaw: optional(string()),
  feeAssetType: optional(string()),
  origin: optional(string()),
});

export type ConfirmTransactionMethodHooks = {
  showUniversalTransactionConfirmation: (
    snapId: string,
    params: ConfirmTransactionParams,
  ) => Promise<boolean>;
};

type ConfirmTransactionSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: ConfirmTransactionMethodHooks;
};

type ConfirmTransactionSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof getConfirmTransactionImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_confirmTransaction` permission.
 * `snap_confirmTransaction` lets the Snap request user confirmation for a
 * transaction on a supported non-EVM chain.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the
 * permission.
 * @param options.methodHooks - The RPC method hooks needed by the method
 * implementation.
 * @returns The specification for the `snap_confirmTransaction` permission.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  ConfirmTransactionSpecificationBuilderOptions,
  ConfirmTransactionSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: ConfirmTransactionSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getConfirmTransactionImplementation({ methodHooks }),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<ConfirmTransactionMethodHooks> = {
  showUniversalTransactionConfirmation: true,
};

/**
 * Request user confirmation for a non-EVM transaction.
 *
 * @example
 * ```json name="Manifest"
 * {
 *   "initialPermissions": {
 *     "snap_confirmTransaction": {}
 *   }
 * }
 * ```
 * ```ts name="Usage"
 * const approved = await snap.request({
 *   method: 'snap_confirmTransaction',
 *   params: {
 *     chainNamespace: 'solana',
 *     chain: 'solana:mainnet',
 *     accountId: 'solana:mainnet:account',
 *     from: 'from-address',
 *     to: 'to-address',
 *     value: '1000000',
 *     assetType: 'solana:mainnet/slip44:501',
 *     assetSymbol: 'SOL',
 *     assetDecimals: 9,
 *   },
 * });
 * ```
 */
export const confirmTransactionBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
} as const);

/**
 * Builds the method implementation for `snap_confirmTransaction`.
 *
 * @param options - The options.
 * @param options.methodHooks - The RPC method hooks.
 * @param options.methodHooks.showUniversalTransactionConfirmation - A function
 * that shows the universal transaction confirmation UI.
 * @returns The method implementation which returns `true` if approved, or
 * `false` if rejected.
 * @throws If the params are invalid, or the confirmation hook fails.
 */
export function getConfirmTransactionImplementation({
  methodHooks: { showUniversalTransactionConfirmation },
}: ConfirmTransactionSpecificationBuilderOptions) {
  return async function confirmTransactionImplementation(
    args: RestrictedMethodOptions<ConfirmTransactionParams>,
  ): Promise<boolean> {
    const {
      params,
      context: { origin: snapId },
    } = args;

    const validatedParams = getValidatedParams(params);

    try {
      return await showUniversalTransactionConfirmation(
        snapId,
        validatedParams,
      );
    } catch (error) {
      throw rpcErrors.internal({
        message: `Unable to confirm transaction: ${error.message}`,
      });
    }
  };
}

/**
 * Validates the confirm transaction method `params` and returns them cast to the
 * correct type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated confirm transaction method parameter object.
 * @throws If the params are invalid.
 */
function getValidatedParams(params: unknown): ConfirmTransactionParams {
  if (!isObject(params)) {
    throw rpcErrors.invalidParams({
      message: 'Invalid params: Expected params to be a single object.',
    });
  }

  try {
    return create(params, ConfirmTransactionParametersStruct);
  } catch (error) {
    throw rpcErrors.invalidParams({
      message: `Invalid params: ${error.message}`,
    });
  }
}
