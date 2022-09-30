import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { assertExhaustive } from '@metamask/snap-utils/src';
import { hasProperty, isObject, NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

const methodName = 'snap_dialog';

export enum DialogType {
  alert = 'alert',
  confirmation = 'confirmation',
  prompt = 'prompt',
}

export type AlertFields = {
  /**
   * The alert title, no greater than 40 characters long.
   */
  title: string;

  /**
   * A description, displayed with the title, no greater than 140 characters
   * long.
   */
  description: string;

  /**
   * Free-from text content, no greater than 1800 characters long.
   */
  textAreaContent: string;
};

export type ConfirmFields = {
  /**
   * A question describing what the user is confirming, no greater than 40
   * characters long.
   */
  title: string;

  /**
   * A description, displayed with the question, no greater than 140 characters
   * long.
   */
  description: string;

  /**
   * Free-from text content, no greater than 1800 characters long.
   */
  textAreaContent: string;
};

export type PromptFields = {
  /**
   * The prompt title, no greater than 40 characters long.
   */
  title: string;

  /**
   * A description, displayed with the prompt, no greater than 140 characters
   * long.
   */
  description: string;
};

export type DialogFields = AlertFields | ConfirmFields | PromptFields;

type ShowAlert = (snapId: string, fields: AlertFields) => Promise<null>;
type ShowConfirmation = (
  snapId: string,
  fields: ConfirmFields,
) => Promise<boolean>;
type ShowPrompt = (snapId: string, fields: PromptFields) => Promise<string>;

export type DialogMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that created the alert.
   * @param fields - The alert text fields.
   */
  showAlert: ShowAlert;

  /**
   * @param snapId - The ID of the Snap that created the confirmation.
   * @param fields - The confirmation text fields.
   * @returns Whether the user accepted or rejected the confirmation.
   */
  showConfirmation: ShowConfirmation;

  /**
   * @param snapId - The ID of the Snap that created the prompt.
   * @param fields - The prompt text fields.
   * @returns The value the user entered in the prompt's input text field.
   */
  showPrompt: ShowPrompt;
};

type DialogSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: DialogMethodHooks;
};

type DialogSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof methodName;
  methodImplementation: ReturnType<typeof getDialogImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_dialog` permission. `snap_dialog`
 * lets the Snap display one of the following dialogs to the user:
 * - An alert, for displaying information.
 * - A confirmation, for accepting or rejecting some action.
 * - A prompt, for inputting some information.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_dialog` permission.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  DialogSpecificationBuilderOptions,
  DialogSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: DialogSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetKey: methodName,
    allowedCaveats,
    methodImplementation: getDialogImplementation(methodHooks),
  };
};

export const dialogBuilder = Object.freeze({
  targetKey: methodName,
  specificationBuilder,
  methodHooks: {
    showAlert: true,
    showConfirmation: true,
    showPrompt: true,
  },
} as const);

/**
 * Builds the method implementation for `snap_dialog`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showAlert - A function that shows an alert in the MetaMask UI
 * and returns when the user has closed the alert.
 * @param hooks.showConfirmation - A function that shows a dialog in the
 * MetaMask UI and returns a `boolean` that signals whether the user
 * approved or denied the confirmation.
 * @param hooks.showPrompt - A function that shows a prompt in the MetaMask UI
 * and returns the value the user entered into the prompt's text field.
 * @returns The method implementation which returns `true` if the user approved the confirmation, otherwise `false`.
 */
function getDialogImplementation({
  showAlert,
  showConfirmation,
  showPrompt,
}: DialogMethodHooks) {
  // This rule is probably triggering due to a bug.
  // eslint-disable-next-line consistent-return
  return async function dialogImplementation(
    args: RestrictedMethodOptions<[DialogType, DialogFields]>,
  ): Promise<boolean | null | string> {
    const {
      params,
      context: { origin },
    } = args;

    const [dialogType, dialogFields] = getValidatedParams(params);
    switch (dialogType) {
      case DialogType.alert:
        return showAlert(origin, dialogFields);

      case DialogType.confirmation:
        return showConfirmation(origin, dialogFields);

      case DialogType.prompt:
        return showPrompt(origin, dialogFields);

      default:
        assertExhaustive(dialogType);
    }
  };
}

/**
 * Validates the confirm method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated confirm method parameter object.
 */
function getValidatedParams(
  params: unknown,
):
  | [DialogType.prompt, PromptFields]
  | [DialogType.alert | DialogType.confirmation, AlertFields | ConfirmFields] {
  if (
    !Array.isArray(params) ||
    !hasProperty(DialogType, params[0]) ||
    !isObject(params[1])
  ) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected arrays params of the form [DialogType, DialogFields].',
    });
  }

  const dialogType = params[0] as DialogType;
  const { title, description, textAreaContent } = params[1];

  if (!title || typeof title !== 'string' || title.length > 40) {
    throw ethErrors.rpc.invalidParams({
      message:
        'Must specify a non-empty string "title" less than 40 characters long.',
    });
  }

  if (
    description &&
    (typeof description !== 'string' || description.length > 140)
  ) {
    throw ethErrors.rpc.invalidParams({
      message:
        '"description" must be a string no more than 140 characters long if specified.',
    });
  }

  if (dialogType === DialogType.prompt) {
    if (textAreaContent) {
      throw ethErrors.rpc.invalidParams({
        message: 'Prompts may not specify a "textAreaContent" field.',
      });
    }
    return [dialogType, params[1] as PromptFields];
  }

  if (
    textAreaContent &&
    (typeof textAreaContent !== 'string' || textAreaContent.length > 1800)
  ) {
    throw ethErrors.rpc.invalidParams({
      message:
        '"textAreaContent" must be a string no more than 1800 characters long if specified.',
    });
  }
  return [dialogType, params[1] as AlertFields | ConfirmFields];
}
