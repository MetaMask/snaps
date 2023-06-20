import { SnapKeyring } from '@metamask/eth-snap-keyring';
import type { SnapMessage } from '@metamask/eth-snap-keyring';
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
    subjectTypes: [SubjectType.Internal, SubjectType.Snap],
  };
};

/**
 * Validates the manageAccount method parameter `message`.
 *
 * @param message - Parameter to be validated.
 */
export function validateParams(message: unknown): void {
  if (!Array.isArray(message)) {
    throw ethErrors.rpc.invalidParams(
      'Invalid ManageAccount Arguments: An array of type SnapMessage was expected',
    );
  }

  const [method] = message;
  if (typeof method !== 'string' || method.length === 0) {
    throw ethErrors.rpc.invalidParams(
      'Invalid ManageAccount Arguments: The parameter "method" should be a non-empty string',
    );
  }
}

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
    options: RestrictedMethodOptions<SnapMessage>,
  ): Promise<string[] | Json | boolean> {
    const {
      context: { origin },
      params,
    } = options;

    validateParams(params);

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
