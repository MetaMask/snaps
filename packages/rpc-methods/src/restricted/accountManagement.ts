import {
  Caveat,
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { Json, NonEmptyArray } from '@metamask/utils';
import type { Keyring } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

const methodName = 'snap_manageAccounts';

export enum AccountType {
  EOA = 'externally-owned-account',
}

export type ManageAccountsMethodHooks = {
  /**
   * Gets the snap keyring implementation.
   */
  getSnapKeyring: () => Promise<
    Keyring<any> & {
      listAccounts(origin: string): any;
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
    }
  >;

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
  targetKey: typeof methodName;
  methodImplementation: ReturnType<typeof getManageAccountsImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

export enum ManageAccountsOperation {
  ListAccounts = 'list',
  CreateAccount = 'create',
  ReadAccount = 'read',
  UpdateAccount = 'update',
  RemoveAccount = 'remove',
}

const getManageAccountsImplementation = ({
  getSnapKeyring,
  saveSnapKeyring,
}: ManageAccountsMethodHooks) => {
  return async function manageAccounts(
    options: RestrictedMethodOptions<
      [ManageAccountsOperation, Record<string, Json>]
    >,
  ): Promise<string[] | Json | boolean> {
    // FIXME[muji]: `origin` should be a stable identifier not snapId
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
        'public key must be a SEC-1 compressed point or an uncompressed point (33 or 64 bytes)',
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
};

const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  ManageAccountsSpecificationBuilderOptions,
  ManageAccountsSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: ManageAccountsSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetKey: methodName,
    allowedCaveats,
    methodImplementation: getManageAccountsImplementation(methodHooks),
    validator: ({ caveats }: { caveats: Caveat<string, any>[] }) => {
      if (
        caveats?.length !== 1 ||
        caveats[0].type !== SnapCaveatType.AccountType
      ) {
        throw ethErrors.rpc.invalidParams({
          message: `Expected a single "${SnapCaveatType.AccountType}" caveat.`,
        });
      } else if (caveats[0].value !== AccountType.EOA) {
        throw ethErrors.provider.unauthorized({
          message: `The requested account of type ${caveats[0].value} is not permitted`,
        });
      }
    },
  };
};

export const manageAccountsBuilder = Object.freeze({
  targetKey: methodName,
  specificationBuilder,
  methodHooks: {
    getSnapKeyring: true,
    saveSnapKeyring: true,
  },
} as const);
