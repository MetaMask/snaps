import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { hasProperty, isObject, NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

const methodName = 'snap_dialog';

export enum DialogType {
  Alert = 'Alert',
  Confirmation = 'Confirmation',
  Prompt = 'Prompt',
}

export type AlertFields = {
  /**
   * The dialog title, no greater than 40 characters long.
   */
  title: string;

  /**
   * A description, displayed with the title, no greater than 140 characters
   * long.
   */
  description?: string;

  /**
   * Free-from text content, no greater than 1800 characters long.
   */
  textAreaContent?: string;
};

export type ConfirmationFields = {
  /**
   * A question describing what the user is confirming, no greater than 40
   * characters long.
   */
  title: string;

  /**
   * A description, displayed with the question, no greater than 140 characters
   * long.
   */
  description?: string;

  /**
   * Free-from text content, no greater than 1800 characters long.
   */
  textAreaContent?: string;
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
  description?: string;
};

export type DialogFields = AlertFields | ConfirmationFields | PromptFields;

type ShowDialog = (
  snapId: string,
  type: DialogType,
  fields: DialogFields,
) => Promise<null | boolean | string>;

export type DialogMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that created the alert.
   * @param type - The dialog type.
   * @param fields - The dialog fields.
   */
  showDialog: ShowDialog;
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
    showDialog: true,
  },
} as const);

type AlertParameters = {
  type: DialogType.Alert;
  fields: AlertFields;
};

type ConfirmationParameters = {
  type: DialogType.Confirmation;
  fields: ConfirmationFields;
};

type PromptParameters = {
  type: DialogType.Prompt;
  fields: PromptFields;
};

export type DialogParameters =
  | AlertParameters
  | ConfirmationParameters
  | PromptParameters;

/**
 * Builds the method implementation for `snap_dialog`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showDialog - A function that shows the specified dialog in the MetaMask UI
 * and returns the appropriate value for the dialog type.
 * @returns The method implementation which return value depends on the dialog type, valid return types are: string, boolean, null.
 */
export function getDialogImplementation({ showDialog }: DialogMethodHooks) {
  return async function dialogImplementation(
    args: RestrictedMethodOptions<DialogParameters>,
  ): Promise<boolean | null | string> {
    const {
      params,
      context: { origin },
    } = args;

    const { type, fields } = getValidatedParams(params);
    return showDialog(origin, type, fields);
  };
}

// TODO(rekmarks): Use an OpenRPC schema and validator for this.
// The validation logic is a little bit tortured and we do not reject extraneous
// properties, even though we should.
/**
 * Validates the confirm method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated confirm method parameter object.
 */
function getValidatedParams(params: unknown): DialogParameters {
  if (
    !isObject(params) ||
    !isDialogType(params.type) ||
    !isObject(params.fields)
  ) {
    throw ethErrors.rpc.invalidParams({
      message:
        'Must specify object parameter of the form `{ type: DialogType, fields: DialogFields }`.',
    });
  }

  const {
    type: dialogType,
    fields: { title, description, textAreaContent },
  } = params;

  if (!title || typeof title !== 'string' || title.length > 40) {
    throw ethErrors.rpc.invalidParams({
      message:
        'Must specify a non-empty string "title" less than 40 characters long.',
    });
  }

  const validPromptFields: PromptFields = { title };

  if (description) {
    if (typeof description !== 'string' || description.length > 140) {
      throw ethErrors.rpc.invalidParams({
        message:
          '"description" must be a string no more than 140 characters long if specified.',
      });
    }
    validPromptFields.description = description;
  }

  if (dialogType === DialogType.Prompt) {
    if (textAreaContent) {
      throw ethErrors.rpc.invalidParams({
        message: 'Prompts may not specify a "textAreaContent" field.',
      });
    }
    return { type: dialogType, fields: validPromptFields };
  }

  const validFields: AlertFields | ConfirmationFields = validPromptFields;

  if (textAreaContent) {
    if (typeof textAreaContent !== 'string' || textAreaContent.length > 1800) {
      throw ethErrors.rpc.invalidParams({
        message:
          '"textAreaContent" must be a string no more than 1800 characters long if specified.',
      });
    }
    validFields.textAreaContent = textAreaContent;
  }

  return {
    type: dialogType,
    fields: validFields,
  };
}

/**
 * Type guard for {@link DialogType}.
 *
 * @param value - The string to test.
 * @returns Whether the given string is a valid dialog type.
 */
function isDialogType(value: unknown): value is DialogType {
  return typeof value === 'string' && hasProperty(DialogType, value);
}
