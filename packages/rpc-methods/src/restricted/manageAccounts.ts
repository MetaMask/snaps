import {
  Caveat,
  PermissionType,
  PermissionConstraint,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  PermissionValidatorConstraint,
  PermissionSpecificationBuilder,
  RestrictedMethodCaveatSpecificationConstraint,
} from '@metamask/permission-controller';
// import { SnapCaveatType, isChainId } from '@metamask/snaps-utils';
import {
  SnapCaveatType,
  isCaipAccount,
  isChainId,
} from '@metamask/snaps-utils';
import { Json, NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import * as superstruct from 'superstruct';

export const MANAGE_ACCOUNT_PERMISSION_KEY = 'snap_manageAccounts';

export type ManageAccountParams = {
  action: ManageAccountsOperation;
  accountId?: string;
  accountType?: AccountType;
};

export enum AccountType {
  EOA = 'externally-owned-account',
}

export enum ManageAccountsOperation {
  ListAccounts = 'list',
  CreateAccount = 'create',
  ReadAccount = 'read',
  UpdateAccount = 'update',
  RemoveAccount = 'remove',
}

type ManageAccountCaveat = {
  // To Do: Use isChainId from '@metamask/snaps-utils' to validate CAIP-2 standard in network caveat
  chainId: `${string}:${string}`;
  // To Do: Define validation for accountType. At the moment it is only AccountType.EOA but we need a more generic validator
  accountType: AccountType.EOA;
};

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export const manageAccountsCaveatMapper = (
  value: Json,
): Pick<PermissionConstraint, 'caveats'> => {
  return {
    caveats: [
      {
        type: SnapCaveatType.ManageAccounts,
        value,
      },
    ],
  };
};

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

/**
 * Validate chainId property of manageAccounts caveat according to CAIP-2.
 *
 * @param chainId - Caveat property Chain ID.
 * @returns Boolean indicating if the value is CAIP-2.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validateChainId = (chainId: string): boolean => isChainId(chainId);

/**
 * Validate chainId property of manageAccounts caveat according to CAIP-2.
 *
 * @param accountType - Caveat property Account Type.
 * @returns Boolean indicating if value is EOA.
 */
const validateAccountType = (accountType: AccountType): boolean =>
  accountType === AccountType.EOA;

export const validateCaveatManageAccounts = (caveat: Caveat<string, any>) => {
  const caveatStruct = superstruct.object({
    chainId: superstruct.string(),
    accountType: superstruct.string(),
  });

  superstruct.assert(
    caveat.value,
    caveatStruct,
    'Expect object containing chainId and accountType.',
  );
};

type ManageAccountsSpecificationBuilderOptions = {
  methodHooks: ManageAccountsMethodHooks;
};

type ManageAccountsSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof MANAGE_ACCOUNT_PERMISSION_KEY;
  methodImplementation: ReturnType<typeof manageAccountsImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
}>;

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

    if (!params?.action || !params?.accountId) {
      throw ethErrors.rpc.invalidParams('Invalid ManageAccount Arguments');
    }

    const keyring = await getSnapKeyring();

    if (params.action === ManageAccountsOperation.ListAccounts) {
      const accounts = await keyring.listAccounts(origin);
      return accounts;
    }
    // validate CAIP-10
    if (!isCaipAccount(params.accountId)) {
      throw ethErrors.rpc.invalidParams(
        `Invalid ManageAccount Arguments: Invalid CAIP10 Account ${params?.accountId}`,
      );
    }
    switch (params.action) {
      case ManageAccountsOperation.CreateAccount: {
        if (!params.accountType || !validateAccountType(params.accountType)) {
          throw ethErrors.rpc.invalidParams(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `Invalid ManageAccount Arguments: Account Type ${params.accountType} is not supported`,
          );
        }
        const created = await keyring.createAccount(origin, params.accountId);
        if (created) {
          await saveSnapKeyring();
        }
        return created;
      }
      case ManageAccountsOperation.ReadAccount:
        return keyring.readAccount(origin, params.accountId);
      case ManageAccountsOperation.UpdateAccount: {
        const updated = keyring.updateAccount(origin, params.accountId);
        if (updated) {
          await saveSnapKeyring();
        }
        return updated;
      }

      case ManageAccountsOperation.RemoveAccount: {
        // NOTE: we don't call removeAccount() on the keyringController
        // NOTE: as it prunes empty keyrings and we don't want that behavior
        const address = await keyring.removeAccount(origin, params.accountId);
        if (address) {
          // @montelaidev - This is returning a boolean. Is the idea for removeAccount to return an address?
          // Probably is better to throw an error if it fails
          await saveSnapKeyring('address');
        }
        return address !== null;
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

const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  ManageAccountsSpecificationBuilderOptions,
  ManageAccountsSpecification
> = ({ methodHooks }: ManageAccountsSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetKey: MANAGE_ACCOUNT_PERMISSION_KEY,
    allowedCaveats: [SnapCaveatType.ManageAccounts],
    methodImplementation: manageAccountsImplementation(methodHooks),
    validator: ({ caveats }): void => {
      if (
        caveats?.length !== 1 ||
        caveats[0].type !== SnapCaveatType.ManageAccounts
      ) {
        throw ethErrors.rpc.invalidParams({
          message: `Expected a single "${SnapCaveatType.ManageAccounts}" caveat.`,
        });
      }
    },
  };
};

export const manageAccountsCaveatSpecification: Record<
  SnapCaveatType.ManageAccounts,
  RestrictedMethodCaveatSpecificationConstraint
> = {
  [SnapCaveatType.ManageAccounts]: Object.freeze({
    type: SnapCaveatType.ManageAccounts,
    decorator: (
      method,
      caveat: Caveat<SnapCaveatType.ManageAccounts, ManageAccountCaveat>,
    ) => {
      return async (args) => {
        // eslint-disable-next-line no-console
        console.log({ caveat, args, method });
        throw new Error(
          'Mock error on manageAccountsCaveatSpecification decorator',
        );
        return await method(args);
      };
    },
    validator: (caveat) => validateCaveatManageAccounts(caveat),
  }),
};

export const manageAccountsBuilder = Object.freeze({
  targetKey: MANAGE_ACCOUNT_PERMISSION_KEY,
  specificationBuilder,
  methodHooks: {
    getSnapKeyring: true,
    saveSnapKeyring: true,
  },
} as const);
