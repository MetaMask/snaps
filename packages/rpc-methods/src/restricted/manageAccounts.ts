import {
  SubjectType,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  PermissionSpecificationBuilder,
} from '@metamask/permission-controller';
// import { SnapCaveatType, isChainId } from '@metamask/snaps-utils';
import { isCaipAccount } from '@metamask/snaps-utils';
import { Json, NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

export const methodName = 'snap_manageAccounts';

export type ManageAccountParams = {
  action: ManageAccountsOperation;
  accountId?: string;
};

export enum ManageAccountsOperation {
  ListAccounts = 'list',
  CreateAccount = 'create',
  ReadAccount = 'read',
  UpdateAccount = 'update',
  RemoveAccount = 'remove',
}

export enum ValidManageAccountMethods {
  ListAccounts = 'listAccounts',
  CreateAccount = 'createAccount',
  ReadAccount = 'readAccount',
  UpdateAccount = 'updateAccount',
  RemoveAccount = 'remove',
  DeleteAccount = 'deleteAccount',
  DeleteAccountByOrigin = 'deleteAccountByOrigin',
}

export type ManageAccountsMethodHooks = {
  /**
   * Gets the snap keyring implementation.
   */
  getSnapKeyring: () => Promise<{
    listAccounts(origin: string): Promise<string[]>;
    createAccount(origin: string, accountId: string): Promise<boolean>;
    readAccount(origin: string, accountId: string): Promise<Json>;
    updateAccount(origin: string, accountId: string, methodArgs?: any): any;
    removeAccount(origin: string, accountId: string): Promise<boolean>;
    deleteAccount(accountId: string): any;
    deleteAccountByOrigin(origin: string): any;
  }>;

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

    const keyring = await getSnapKeyring();

    if (params.action === ManageAccountsOperation.ListAccounts) {
      const accounts = await keyring.listAccounts(origin);
      return accounts;
    }

    if (!params.accountId) {
      throw ethErrors.rpc.invalidParams(
        'Invalid ManageAccount Arguments: Missing accountId',
      );
    }

    // validate CAIP-10
    if (!isCaipAccount(params.accountId)) {
      throw ethErrors.rpc.invalidParams(
        `Invalid ManageAccount Arguments: Invalid CAIP10 Account ${params.accountId}`,
      );
    }

    switch (params.action) {
      case ManageAccountsOperation.CreateAccount: {
        const created = await keyring.createAccount(origin, params.accountId);
        if (created) {
          await saveSnapKeyring();
        }
        return created;
      }
      case ManageAccountsOperation.ReadAccount:
        return keyring.readAccount(origin, params.accountId);
      case ManageAccountsOperation.UpdateAccount: {
        const updatedAccount = keyring.updateAccount(origin, params.accountId);
        if (updatedAccount) {
          await saveSnapKeyring();
        }
        return updatedAccount;
      }

      case ManageAccountsOperation.RemoveAccount: {
        // NOTE: we don't call removeAccount() on the keyringController
        // NOTE: as it prunes empty keyrings and we don't want that behavior
        const knownAddress = await keyring.removeAccount(
          origin,
          params.accountId,
        );
        if (!knownAddress) {
          throw ethErrors.rpc.invalidParams(
            `Invalid ManageAccount Request: Unknown account ${params.accountId}`,
          );
        }
        await saveSnapKeyring('address');
        return knownAddress;
      }

      default: {
        throw ethErrors.rpc.invalidRequest(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `Invalid ManageAccount Request: The request ${params.action} is not supported`,
        );
      }
    }
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
