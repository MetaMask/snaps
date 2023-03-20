import {
  Caveat,
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  RestrictedMethodCaveatSpecificationConstraint,
  PermissionValidatorConstraint,
} from '@metamask/permission-controller';
// import { SnapCaveatType, isChainId } from '@metamask/snaps-utils';
import { SnapCaveatType, isCaipAccount } from '@metamask/snaps-utils';
import { Json, NonEmptyArray, assertStruct } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { type } from 'superstruct';

export const MANAGE_ACCOUNT_PERMISSION_KEY = 'snap_manageAccounts';

export type ManageAccountParams = {
  action: ManageAccountsOperation;
  caip10Account?: string;
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
  // To Do: Define validation for accountType. At the moment is it only AccountType.EOA but we need a more generic validator
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
// export const manageAccountsCaveatMapper = (
//   value: Json,
// ): Pick<PermissionConstraint, 'caveats'> => {
//   return {
//     caveats: {
//       type: SnapCaveatType.ManageAccounts,
//       value,
//     },
//   };
// };

export type ManageAccountsMethodHooks = {
  /**
   * Gets the snap keyring implementation.
   */
  getSnapKeyring: () => Promise<{
    listAccounts(origin: string): Promise<string[]>;
    createAccount(origin: string, caip10Account: string): Promise<boolean>;
    readAccount(origin: string, caip10Account: string): Promise<Json>;
    updateAccount(origin: string, caip10Account: string, methodArgs?: any): any;
    removeAccount(origin: string, caip10Account: string): Promise<boolean>;
    deleteAccount(caip10Account: string): any;
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

export const validateCaveatManageAccounts = (
  caveat: Caveat<string, any>,
): asserts caveat is Caveat<string, ManageAccountCaveat> => {
  assertStruct(
    caveat,
    type({}),
    'Invalid ManageAccount caveat',
    ethErrors.rpc.internal,
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

    if (!params || !params.action) {
      throw ethErrors.rpc.invalidParams('Invalid ManageAccount Arguments');
    }

    const keyring = await getSnapKeyring();

    if (params.action === ManageAccountsOperation.ListAccounts) {
      const accounts = await keyring.listAccounts(origin);
      return accounts;
    } else {
      // validate CAIP-10
      if (!params.caip10Account || !isCaipAccount(params.caip10Account)) {
        throw ethErrors.rpc.invalidParams(
          `Invalid ManageAccount Arguments: Invalid CAIP10 Account ${params?.caip10Account}`,
        );
      }

      // Throw if network is not ethereum
      if (params.caip10Account.split(':')[0] !== 'eip155') {
        throw ethErrors.rpc.invalidParams(
          `Invalid ManageAccount Arguments: Only ethereum EOA are supported.`,
        );
      }

      switch (params.action) {
        case ManageAccountsOperation.CreateAccount: {
          if (params.accountType !== AccountType.EOA) {
            throw ethErrors.rpc.invalidParams(
              `Invalid ManageAccount Arguments: Account Type ${params.accountType} is not supported`,
            );
          }
          const created = await keyring.createAccount(
            origin,
            params.caip10Account,
          );
          if (created) {
            await saveSnapKeyring();
          }
          return created;
        }
        case ManageAccountsOperation.ReadAccount:
          return await keyring.readAccount(origin, params.caip10Account);
        case ManageAccountsOperation.UpdateAccount: {
          const updated = keyring.updateAccount(origin, params.caip10Account);
          if (updated) {
            await saveSnapKeyring();
          }
          return updated;
        }

        case ManageAccountsOperation.RemoveAccount: {
          // NOTE: we don't call removeAccount() on the keyringController
          // NOTE: as it prunes empty keyrings and we don't want that behavior
          const removed = await keyring.removeAccount(
            origin,
            params.caip10Account,
          );
          if (removed) {
            await saveSnapKeyring(params.caip10Account);
          }
          return removed;
        }
        default:
          throw new Error('invalid snap_manageAccounts action');
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
    validator: (caveat) => {
      // eslint-disable-next-line no-console
      console.log('Execute validator for caveat', caveat);
      throw new Error(
        'Mock error on manageAccountsCaveatSpecification validator',
      );
    },
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
