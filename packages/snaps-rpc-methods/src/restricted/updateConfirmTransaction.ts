import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { create, object, optional, record, string } from '@metamask/superstruct';
import type { CaipAssetType, Json, NonEmptyArray } from '@metamask/utils';
import { CaipAssetTypeStruct, isObject, JsonStruct } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_updateConfirmTransaction';

export type UpdateConfirmTransactionParams = {
  id: string;
  fee?: {
    amount: string;
    assetId?: CaipAssetType;
  };
  custom?: Record<string, Json>;
};

const UpdateConfirmTransactionParametersStruct = object({
  id: string(),
  fee: optional(
    object({
      amount: string(),
      assetId: optional(CaipAssetTypeStruct),
    }),
  ),
  custom: optional(record(string(), JsonStruct)),
});

export type UpdateConfirmTransactionMethodHooks = {
  updateUniversalTransactionConfirmation: (
    snapId: string,
    params: UpdateConfirmTransactionParams,
  ) => Promise<void>;
};

type UpdateConfirmTransactionSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: UpdateConfirmTransactionMethodHooks;
};

type UpdateConfirmTransactionSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof getUpdateConfirmTransactionImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  UpdateConfirmTransactionSpecificationBuilderOptions,
  UpdateConfirmTransactionSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: UpdateConfirmTransactionSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getUpdateConfirmTransactionImplementation({
      methodHooks,
    }),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<UpdateConfirmTransactionMethodHooks> = {
  updateUniversalTransactionConfirmation: true,
};

export const updateConfirmTransactionBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
} as const);

export function getUpdateConfirmTransactionImplementation({
  methodHooks: { updateUniversalTransactionConfirmation },
}: UpdateConfirmTransactionSpecificationBuilderOptions) {
  return async function updateConfirmTransactionImplementation(
    args: RestrictedMethodOptions<UpdateConfirmTransactionParams>,
  ): Promise<null> {
    const {
      params,
      context: { origin: snapId },
    } = args;

    const validatedParams = getValidatedParams(params);

    try {
      await updateUniversalTransactionConfirmation(snapId, validatedParams);
      return null;
    } catch (error) {
      throw rpcErrors.internal({
        message: `Unable to update transaction confirmation: ${error.message}`,
      });
    }
  };
}

function getValidatedParams(params: unknown): UpdateConfirmTransactionParams {
  if (!isObject(params)) {
    throw rpcErrors.invalidParams({
      message: 'Invalid params: Expected params to be a single object.',
    });
  }

  try {
    return create(params, UpdateConfirmTransactionParametersStruct);
  } catch (error) {
    throw rpcErrors.invalidParams({
      message: `Invalid params: ${error.message}`,
    });
  }
}
