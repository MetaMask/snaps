import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { DialogType, ComponentStruct, enumValue } from '@metamask/snaps-sdk';
import type {
  DialogParams,
  EnumToUnion,
  Component,
  InterfaceState,
} from '@metamask/snaps-sdk';
import {
  getFirstErrorInUnion,
  validateComponentLinks,
} from '@metamask/snaps-utils';
import type { InferMatching } from '@metamask/snaps-utils';
import { hasProperty, type NonEmptyArray } from '@metamask/utils';
import type { Infer, Struct } from 'superstruct';
import {
  create,
  enums,
  object,
  optional,
  size,
  string,
  StructError,
  type,
  union,
} from 'superstruct';

import { type MethodHooksObject } from '../utils';

const methodName = 'snap_dialog';

const PlaceholderStruct = optional(size(string(), 1, 40));

export type Placeholder = Infer<typeof PlaceholderStruct>;

type ShowDialog = (
  snapId: string,
  type: EnumToUnion<DialogType>,
  id: string,
  placeholder?: Placeholder,
) => Promise<null | boolean | string>;

type MaybeUpdatePhisingList = () => Promise<void>;
type IsOnPhishingList = (url: string) => boolean;
type GetInterface = (
  snapId: string,
  id: string,
) => {
  content: Component;
  state: InterfaceState;
};

type CreateInterface = (snapId: string, content: Component) => string;

export type DialogMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that created the alert.
   * @param type - The dialog type.
   * @param id - The interface ID.
   * @param placeholder - The placeholder for the Prompt dialog input.
   */
  showDialog: ShowDialog;

  maybeUpdatePhishingList: MaybeUpdatePhisingList;

  /**
   * @param url - The URL to check against the phishing list.
   */
  isOnPhishingList: IsOnPhishingList;
  /**
   * @param snapId - The Snap ID requesting the interface.
   * @param id - The interface ID to get.
   */
  getInterface: GetInterface;
  /**
   * @param snapId - The Snap ID creating the interface.
   * @param content - The content of the interface.
   */
  createInterface: CreateInterface;
};

type DialogSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: DialogMethodHooks;
};

type DialogSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
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
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getDialogImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<DialogMethodHooks> = {
  showDialog: true,
  isOnPhishingList: true,
  maybeUpdatePhishingList: true,
  getInterface: true,
  createInterface: true,
};

export const dialogBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
} as const);

// Note: We use `type` here instead of `object` because `type` does not validate
// the keys of the object, which is what we want.
const BaseParamsStruct = type({
  type: enums([DialogType.Alert, DialogType.Confirmation, DialogType.Prompt]),
});

const AlertParametersWithContentStruct = object({
  type: enumValue(DialogType.Alert),
  content: ComponentStruct,
});
const AlertParametersWithIdStruct = object({
  type: enumValue(DialogType.Alert),
  id: string(),
});

const AlertParametersStruct = union([
  AlertParametersWithContentStruct,
  AlertParametersWithIdStruct,
]);

const ConfirmationParametersWithContentStruct = object({
  type: enumValue(DialogType.Confirmation),
  content: ComponentStruct,
});

const ConfirmationParametersWithIdStruct = object({
  type: enumValue(DialogType.Confirmation),
  id: string(),
});

const ConfirmationParametersStruct = union([
  ConfirmationParametersWithContentStruct,
  ConfirmationParametersWithIdStruct,
]);

const PromptParametersWithContentStruct = object({
  type: enumValue(DialogType.Prompt),
  content: ComponentStruct,
  placeholder: PlaceholderStruct,
});

const PromptParametersWithIdStruct = object({
  type: enumValue(DialogType.Prompt),
  id: string(),
  placeholder: PlaceholderStruct,
});

const PromptParametersStruct = union([
  PromptParametersWithContentStruct,
  PromptParametersWithIdStruct,
]);

const DialogParametersStruct = union([
  AlertParametersStruct,
  ConfirmationParametersStruct,
  PromptParametersStruct,
]);

export type DialogParameters = InferMatching<
  typeof DialogParametersStruct,
  DialogParams
>;

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
 * @param hooks.isOnPhishingList - A function that checks a link against the
 * phishing list and return true if it's in, otherwise false.
 * @param hooks.maybeUpdatePhishingList - A function that updates the phishing list if needed.
 * @param hooks.getInterface - A function that gets the interface data from the InterfaceController.
 * @param hooks.createInterface - A function that creates the interface in InterfaceController.
 * @returns The method implementation which return value depends on the dialog
 * type, valid return types are: string, boolean, null.
 */
export function getDialogImplementation({
  showDialog,
  isOnPhishingList,
  maybeUpdatePhishingList,
  getInterface,
  createInterface,
}: DialogMethodHooks) {
  return async function dialogImplementation(
    args: RestrictedMethodOptions<DialogParameters>,
  ): Promise<boolean | null | string> {
    const {
      params,
      context: { origin },
    } = args;

    const validatedType = getValidatedType(params);
    const validatedParams = getValidatedParams(params, structs[validatedType]);

    let content, id;

    if (hasProperty(validatedParams, 'id')) {
      content = getInterface(origin, validatedParams.id as string).content;
      id = validatedParams.id as string;
    } else {
      id = createInterface(origin, validatedParams.content);
      content = validatedParams.content;
    }

    await maybeUpdatePhishingList();

    validateComponentLinks(content, isOnPhishingList);

    const placeholder =
      validatedParams.type === DialogType.Prompt
        ? validatedParams.placeholder
        : undefined;

    return showDialog(origin, validatedType, id, placeholder);
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
    throw rpcErrors.invalidParams({
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
      const { failures } = error;

      const failureArray = failures();

      const placeholderFailure = failureArray.find(
        ({ key, type: errorType }) =>
          key === 'placeholder' && errorType === 'never',
      );
      if (placeholderFailure) {
        throw rpcErrors.invalidParams({
          message:
            'Invalid params: Alerts or confirmations may not specify a "placeholder" field.',
        });
      }

      throw rpcErrors.invalidParams({
        message: `Invalid params: ${getFirstErrorInUnion(failureArray)}.`,
      });
    }

    /* istanbul ignore next */
    throw rpcErrors.internal();
  }
}
