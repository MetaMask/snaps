import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import {
  create,
  enums,
  Infer,
  literal,
  object,
  omit,
  optional,
  size,
  string,
  Struct,
  StructError,
  type,
  union,
} from 'superstruct';

const methodName = 'snap_dialog';

export enum DialogType {
  Alert = 'Alert',
  Confirmation = 'Confirmation',
  Prompt = 'Prompt',
}

const BaseFieldsStruct = object({
  title: size(string(), 1, 40),
  description: optional(size(string(), 1, 140)),
  textAreaContent: optional(size(string(), 1, 1800)),
});

const PromptFieldsStruct = omit(BaseFieldsStruct, ['textAreaContent']);

/**
 * @property title - The alert title, no greater than 40 characters long.
 * @property description - A description, displayed with the title, no greater
 * than 140 characters long.
 * @property textAreaContent - Free-from text content, no greater than 1800
 * characters long.
 */
export type AlertFields = Infer<typeof BaseFieldsStruct>;

/**
 * @property title - A question describing what the user is confirming, no
 * greater than 40 characters long.
 * @property description - A description, displayed with the question, no
 * greater than 140 characters long.
 * @property textAreaContent - Free-from text content, no greater than 1800
 * characters long.
 */
export type ConfirmationFields = Infer<typeof BaseFieldsStruct>;

/**
 * @property title - The prompt title, no greater than 40 characters long.
 * @property description - A description, displayed with the prompt, no greater
 * than 140 characters long.
 */
export type PromptFields = Infer<typeof PromptFieldsStruct>;

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
 * @param options.allowedCaveats - The optional allowed caveats for the
 * permission.
 * @param options.methodHooks - The RPC method hooks needed by the method
 * implementation.
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

// Note: We use `type` here instead of `object` because `type` does not validate
// the keys of the object, which is what we want.
const BaseParamsStruct = type({
  type: enums([DialogType.Alert, DialogType.Confirmation, DialogType.Prompt]),
});

const AlertParametersStruct = object({
  type: literal(DialogType.Alert),
  fields: BaseFieldsStruct,
});

const ConfirmationParametersStruct = object({
  type: literal(DialogType.Confirmation),
  fields: BaseFieldsStruct,
});

const PromptParametersStruct = object({
  type: literal(DialogType.Prompt),
  fields: PromptFieldsStruct,
});

const DialogParametersStruct = union([
  AlertParametersStruct,
  ConfirmationParametersStruct,
  PromptParametersStruct,
]);

export type DialogParameters = Infer<typeof DialogParametersStruct>;

const structs = {
  [DialogType.Alert]: AlertParametersStruct,
  [DialogType.Confirmation]: ConfirmationParametersStruct,
  [DialogType.Prompt]: PromptParametersStruct,
};

/**
 * Builds the method implementation for `snap_dialog`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showDialog - A function that shows the specified dialog in the
 * MetaMask UI and returns the appropriate value for the dialog type.
 * @returns The method implementation which return value depends on the dialog
 * type, valid return types are: string, boolean, null.
 */
export function getDialogImplementation({ showDialog }: DialogMethodHooks) {
  return async function dialogImplementation(
    args: RestrictedMethodOptions<DialogParameters>,
  ): Promise<boolean | null | string> {
    const {
      params,
      context: { origin },
    } = args;

    const validatedType = getValidatedType(params);
    const { fields } = getValidatedParams(params, structs[validatedType]);

    return showDialog(origin, validatedType, fields);
  };
}

/**
 * Get the validated type of the dialog parameters. Throws an error if the type
 * is invalid.
 *
 * @param params - The parameters to validate.
 * @returns The validated type of the dialog parameters.
 */
function getValidatedType(params: unknown): DialogType {
  try {
    return create(params, BaseParamsStruct).type;
  } catch (error) {
    throw ethErrors.rpc.invalidParams({
      message: `The "type" property must be one of: ${Object.values(
        DialogType,
      ).join(', ')}.`,
    });
  }
}

/**
 * Validates the confirm method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @param struct - The struct to validate the params against.
 * @returns The validated confirm method parameter object.
 */
function getValidatedParams(
  params: unknown,
  struct: Struct<any>,
): DialogParameters {
  try {
    return create(params, struct);
  } catch (error) {
    if (error instanceof StructError) {
      const { key, type: errorType } = error;

      if (key === 'textAreaContent' && errorType === 'never') {
        throw ethErrors.rpc.invalidParams({
          message:
            'Invalid params: Prompts may not specify a "textAreaContent" field.',
        });
      }

      throw ethErrors.rpc.invalidParams({
        message: `Invalid params: ${error.message}.`,
      });
    }

    /* istanbul ignore next */
    throw ethErrors.rpc.internal();
  }
}
