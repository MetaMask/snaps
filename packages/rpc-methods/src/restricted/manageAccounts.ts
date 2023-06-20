import { SnapKeyring } from '@metamask/eth-snap-keyring';
import {
  SubjectType,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  PermissionSpecificationBuilder,
} from '@metamask/permission-controller';
import { Json, NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

export const methodName = 'snap_manageAccounts';

export type ManageAccountParams = {
  action: string;
  accountId?: string;
};

export type ManageAccountsMethodHooks = {
  /**
   * Gets the snap keyring implementation.
   */
  getSnapKeyring: (snapOrigin: string) => Promise<SnapKeyring>;

  /**
   * Saves the snap keyring, should be called after mutable operations.
   *
   * If an account was removed the address of the account must be passed to
   * update the UI.
   */
  saveSnapKeyring: (removedAddress?: string) => Promise<void>;
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
    subjectTypes: [SubjectType.Internal, SubjectType.Snap],
  };
};

// eslint-disable-next-line jsdoc/require-jsdoc
export function manageAccountsImplementation({
  getSnapKeyring,
  saveSnapKeyring,
}: ManageAccountsMethodHooks) {
  return async function manageAccounts(
    options: RestrictedMethodOptions<ManageAccountParams>,
  ): Promise<string[] | Json | boolean> {
    const {
      context: { origin },
      params,
    } = options;

    if (!params?.action) {
      throw ethErrors.rpc.invalidParams('Invalid ManageAccount Arguments');
    }

    const keyring = await getSnapKeyring(origin);
    return await keyring.handleKeyringSnapMessage(
      origin,
      params,
      saveSnapKeyring,
    );
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
