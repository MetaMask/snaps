import type {
  AddApprovalOptions,
  SuccessOptions,
  EndFlowOptions,
  ApprovalFlowStartResult,
  StartFlowOptions,
  SuccessResult,
  ErrorResult,
  ErrorOptions,
} from '@metamask/approval-controller';
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
  union,
  array,
  record,
  optional,
} from 'superstruct';

const SnapMessageStruct = object({
  method: string(),
  params: optional(union([array(JsonStruct), record(string(), JsonStruct)])),
});

type Message = Infer<typeof SnapMessageStruct>;

export const methodName = 'snap_manageAccounts';

type AccountConfirmationResult = {
  confirmed: boolean;
  accountName?: string;
};

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

  showSnapAccountConfirmation: (
    origin: any,
    type: any,
    content: any,
    placeholder: any,
  ) => Promise<AccountConfirmationResult>;
  startApprovalFlow: (opts?: StartFlowOptions) => ApprovalFlowStartResult;
  requestUserApproval: (
    opts: AddApprovalOptions,
  ) => Promise<AccountConfirmationResult>;
  endApprovalFlow: ({ id }: EndFlowOptions) => Promise<void>;
  // setApprovalFlowLoadingText: () => Promise<void>;
  showApprovalSuccess: (opts?: SuccessOptions) => Promise<SuccessResult>;
  showApprovalError: (opts?: ErrorOptions) => Promise<ErrorResult>;
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
 * @param hooks.startApprovalFlow - A function to start the approval flow.
 * @param hooks.requestUserApproval - A function to request user approval to add an account.
 * @param hooks.endApprovalFlow - A function to end the approval flow.
 * @param hooks.showApprovalError - A function to show the approval error.
 * @param hooks.showApprovalSuccess - A function to show the approval success.
 * @returns The method implementation which either returns `null` for a
 * successful state update/deletion or returns the decrypted state.
 * @throws If the params are invalid.
 */
export function manageAccountsImplementation({
  getSnapKeyring,
  startApprovalFlow,
  requestUserApproval,
  endApprovalFlow,
  showApprovalSuccess,
  showApprovalError,
}: ManageAccountsMethodHooks) {
  return async function manageAccounts(
    options: RestrictedMethodOptions<Message>,
  ): Promise<Json> {
    const {
      context: { origin },
      params,
    } = options;

    assert(params, SnapMessageStruct);
    const keyring = await getSnapKeyring(origin);
    const { id: addAccountApprovalId } = startApprovalFlow();

    const confirmationResult = await requestUserApproval({
      origin,
      type: 'snap_manageAccounts:confirmation',
    });

    // eslint-disable-next-line no-console
    console.log(
      'SNAPS/ manageAccountsImplementation/ confirmationResult',
      confirmationResult,
    );
    if (confirmationResult.confirmed) {
      try {
        const account = await keyring.handleKeyringSnapMessage(origin, params);
        await showApprovalSuccess();
        await endApprovalFlow(addAccountApprovalId);

        const accountName = confirmationResult.accountName ?? '[Empty]';

        await showApprovalSuccess({
          flowToEnd: addAccountApprovalId,
          message: `Added Account: **${accountName}**`,
        });

        return account;
      } catch (error) {
        await showApprovalError({ error: error.message });
        await endApprovalFlow({ id: addAccountApprovalId });
      }
    }
    throw new Error('User denied account addition');
  };
}

export const manageAccountsBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks: {
    getSnapKeyring: true,
    showSnapAccountConfirmation: true,
    startApprovalFlow: true,
    requestUserApproval: true,
    endApprovalFlow: true,
    setApprovalFlowLoadingText: true,
    showApprovalSuccess: true,
    showApprovalError: true,
  },
} as const);
