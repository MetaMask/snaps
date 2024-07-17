import type {
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  PermissionSpecificationBuilder,
} from '@metamask/permission-controller';
import { SubjectType, PermissionType } from '@metamask/permission-controller';
import type {
  ManageAccountsParams,
  ManageAccountsResult,
} from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import {
  assert,
  string,
  object,
  union,
  array,
  record,
} from '@metamask/superstruct';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { JsonStruct } from '@metamask/utils';

const SnapMessageStruct = union([
  object({
    method: string(),
  }),
  object({
    method: string(),
    params: union([array(JsonStruct), record(string(), JsonStruct)]),
  }),
]);

type Message = InferMatching<typeof SnapMessageStruct, ManageAccountsParams>;

export const methodName = 'snap_manageAccounts';

export type ManageAccountsMethodHooks = {
  /**
   * Gets the snap keyring implementation.
   */
  getSnapKeyring: (snapOrigin: string) => Promise<{
    handleKeyringSnapMessage: (
      snapId: string,
      message: Message,
    ) => Promise<Json>;
  }>;
};

type ManageAccountsSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: ManageAccountsMethodHooks;
};

type ManageAccountsSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof manageAccountsImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_manageAccounts` permission.
 * `snap_manageAccounts` lets the Snap manage a set of accounts via a custom keyring.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_manageAccounts` permission.
 */
export const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  ManageAccountsSpecificationBuilderOptions,
  ManageAccountsSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: ManageAccountsSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: manageAccountsImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap],
  };
};

/**
 * Builds the method implementation for `snap_manageAccounts`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getSnapKeyring - A function to get the snap keyring.
 * @returns The method implementation which either returns `null` for a
 * successful state update/deletion or returns the decrypted state.
 * @throws If the params are invalid.
 */
export function manageAccountsImplementation({
  getSnapKeyring,
}: ManageAccountsMethodHooks) {
  return async function manageAccounts(
    options: RestrictedMethodOptions<ManageAccountsParams>,
  ): Promise<ManageAccountsResult> {
    const {
      context: { origin },
      params,
    } = options;

    assert(params, SnapMessageStruct);
    const keyring = await getSnapKeyring(origin);
    return await keyring.handleKeyringSnapMessage(origin, params);
  };
}

export const manageAccountsBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks: {
    getSnapKeyring: true,
  },
} as const);
