import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { Json, NonEmptyArray } from '@metamask/utils';

const methodName = 'snap_manageAccounts';

export type ManageAccountsMethodHooks = {
  /**
   *  Gets the snap keyring implementation.
   */
  // TODO[muji]: Use SnapKeyring type in return value
  getSnapKeyring: () => Promise<any>;

  /**
   *  Saves the snap keyring, should be called after mutable operations.
   *
   *  If an account was removed the address of the account must be passed to
   *  update the UI.
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

/**
 * `snap_manageAccounts` let's the Snap manage it's own accounts.
 */
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

export enum ManageAccountsOperation {
  listAccounts = 'list',
  createAccount = 'create',
  readAccount = 'read',
  updateAccount = 'update',
  deleteAccount = 'delete',
}

function getManageAccountsImplementation({
  getSnapKeyring,
  saveSnapKeyring,
}: ManageAccountsMethodHooks) {
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
      case ManageAccountsOperation.listAccounts:
        return keyring.listAccounts(origin);
      case ManageAccountsOperation.createAccount: {
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
      case ManageAccountsOperation.readAccount:
        return keyring.readAccount(origin, publicKeyBuffer);
      case ManageAccountsOperation.updateAccount: {
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

      case ManageAccountsOperation.deleteAccount: {
        // NOTE: we don't call removeAccount() on the keyringController
        // NOTE: as it prunes empty keyrings and we don't want that behavior
        const address = keyring.deleteAccount(origin, publicKeyBuffer);
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
