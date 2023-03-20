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
import { SnapCaveatType } from '@metamask/snaps-utils';
import { Json, NonEmptyArray, assertStruct } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { type } from 'superstruct';

const targetKey = 'snap_manageAccounts';

enum AccountType {
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
  chainId: `${string}:${string}`;
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
    listAccounts(origin: string): string[];
    createAccount(
      origin: string,
      publicKeyBuffer: Buffer,
      methodArgs?: any,
    ): any;
    readAccount(origin: string, publicKeyBuffer: Buffer): any;
    updateAccount(
      origin: string,
      publicKeyBuffer: Buffer,
      methodArgs?: any,
    ): any;
    removeAccount(origin: string, publicKeyBuffer: Buffer): any;
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
  targetKey: typeof targetKey;
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
    options: RestrictedMethodOptions<
      [ManageAccountsOperation, Record<string, Json>]
    >,
  ): Promise<string[] | Json | boolean> {
    const {
      context: { origin },
      params = [],
    } = options;
    const [methodAction, methodArgs] = params;

    // Create and update args is a two-value tuple whereas
    // read and delete just expect a single parameter
    const publicKeyBuffer = Buffer.from(
      Array.isArray(methodArgs) ? methodArgs[0] : methodArgs,
      'hex',
    );

    // Expecting a SEC-1 encoded compressed point or a uncompressed point
    if (publicKeyBuffer.length !== 33 && publicKeyBuffer.length !== 64) {
      throw new Error(
        'Public key must be a SEC-1 compressed point or an uncompressed point (33 or 64 bytes)',
      );
    }

    const keyring = await getSnapKeyring();

    switch (methodAction) {
      case ManageAccountsOperation.ListAccounts:
        return keyring.listAccounts(origin);
      case ManageAccountsOperation.CreateAccount: {
        const created = keyring.createAccount(
          origin,
          publicKeyBuffer,
          methodArgs ? methodArgs[1] : null,
        );
        if (created) {
          await saveSnapKeyring();
        }
        return created;
      }
      case ManageAccountsOperation.ReadAccount:
        return keyring.readAccount(origin, publicKeyBuffer);
      case ManageAccountsOperation.UpdateAccount: {
        const updated = keyring.updateAccount(
          origin,
          publicKeyBuffer,
          methodArgs ? methodArgs[1] : null,
        );
        if (updated) {
          await saveSnapKeyring();
        }
        return updated;
      }

      case ManageAccountsOperation.RemoveAccount: {
        // NOTE: we don't call removeAccount() on the keyringController
        // NOTE: as it prunes empty keyrings and we don't want that behavior
        const address = keyring.removeAccount(origin, publicKeyBuffer);
        if (address) {
          await saveSnapKeyring(address);
        }
        return address !== null;
      }
      default:
        throw new Error('invalid snap_manageAccounts action');
    }
  };
}

const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  ManageAccountsSpecificationBuilderOptions,
  ManageAccountsSpecification
> = ({ methodHooks }: ManageAccountsSpecificationBuilderOptions) => {
  return {
    targetKey,
    permissionType: PermissionType.RestrictedMethod,
    allowedCaveats: [SnapCaveatType.ManageAccounts],
    methodImplementation: manageAccountsImplementation(methodHooks),
    validator: ({ caveats }: { caveats: [Caveat<string, any>] }): void => {
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
  targetKey,
  specificationBuilder,
  methodHooks: {
    getSnapKeyring: true,
    saveSnapKeyring: true,
  },
} as const);
