import type {
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  PermissionSpecificationBuilder,
} from '@metamask/permission-controller';
import { SubjectType, PermissionType } from '@metamask/permission-controller';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { JsonStruct } from '@metamask/utils';
import type { Infer } from 'superstruct';
import {
  assert,
  string,
  object,
  optional,
  union,
  array,
  record,
} from 'superstruct';

const SnapMessageStruct = object({
  method: string(),
  params: optional(union([array(JsonStruct), record(string(), JsonStruct)])),
});

type Message = Infer<typeof SnapMessageStruct>;

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

  /**
   * Saves the snap keyring, should be called after mutable operations.
   */
  saveSnapKeyring: () => Promise<void>;
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
 * @param hooks.saveSnapKeyring - A function to save the snap keyring.
 * @returns The method implementation which either returns `null` for a
 * successful state update/deletion or returns the decrypted state.
 * @throws If the params are invalid.
 */
export function manageAccountsImplementation({
  getSnapKeyring,
  saveSnapKeyring,
}: ManageAccountsMethodHooks) {
  return async function manageAccounts(
    options: RestrictedMethodOptions<Message>,
  ): Promise<string[] | Json | boolean> {
    const {
      context: { origin },
      params,
    } = options;

    assert(params, SnapMessageStruct);
    const keyring = await getSnapKeyring(origin);
    const result = await keyring.handleKeyringSnapMessage(origin, params);

    const { method } = params;
    if (['updateAccount', 'createAccount', 'deleteAccount'].includes(method)) {
      await saveSnapKeyring();
    }

    return result;
  };
}

export const manageAccountsBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks: {
    getSnapKeyring: true,
    saveSnapKeyring: true,
  },
} as const);
