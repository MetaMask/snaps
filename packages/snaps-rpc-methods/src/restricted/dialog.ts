import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import {
  DialogType,
  enumValue,
  union,
  ComponentOrElementStruct,
} from '@metamask/snaps-sdk';
import type {
  DialogParams,
  EnumToUnion,
  Component,
  InterfaceState,
  SnapId,
  PromptDialog,
  ComponentOrElement,
} from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import { createUnion } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';
import { hasProperty, type NonEmptyArray } from '@metamask/utils';
import type { Infer, Struct } from 'superstruct';
import { object, optional, size, string } from 'superstruct';

import { type MethodHooksObject } from '../utils';

const methodName = 'snap_dialog';

const PlaceholderStruct = optional(size(string(), 1, 40));

export type Placeholder = Infer<typeof PlaceholderStruct>;

type ShowDialog = (
  snapId: string,
  type: EnumToUnion<DialogType> | undefined,
  id: string,
  placeholder?: Placeholder,
) => Promise<null | boolean | string | Json>;

type CreateInterface = (
  snapId: string,
  content: ComponentOrElement,
) => Promise<string>;

type GetInterface = (
  snapId: string,
  id: string,
) => { content: ComponentOrElement; snapId: SnapId; state: InterfaceState };

export type DialogMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that created the alert.
   * @param type - The dialog type.
   * @param id - The interface ID.
   * @param placeholder - The placeholder for the Prompt dialog input.
   */
  showDialog: ShowDialog;

  /**
   * @param snapId - The Snap ID creating the interface.
   * @param content - The content of the interface.
   */
  createInterface: CreateInterface;
  /**
   * @param snapId - The SnapId requesting the interface.
   * @param id - The interface ID.
   */
  getInterface: GetInterface;
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
  createInterface: true,
  getInterface: true,
};

export const dialogBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
} as const);

const AlertParametersWithContentStruct = object({
  type: enumValue(DialogType.Alert),
  content: ComponentOrElementStruct,
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
  content: ComponentOrElementStruct,
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
  content: ComponentOrElementStruct,
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

const DefaultParametersStruct = object({
  id: string(),
});

const DialogParametersStruct = union([
  AlertParametersStruct,
  ConfirmationParametersStruct,
  PromptParametersStruct,
  DefaultParametersStruct,
]);

export type DialogParameters = InferMatching<
  typeof DialogParametersStruct,
  DialogParams
>;

/**
 * Builds the method implementation for `snap_dialog`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showDialog - A function that shows the specified dialog in the
 * MetaMask UI and returns the appropriate value for the dialog type.
 * @param hooks.createInterface - A function that creates the interface in SnapInterfaceController.
 * @param hooks.getInterface - A function that gets an interface from SnapInterfaceController.
 * @returns The method implementation which return value depends on the dialog
 * type, valid return types are: string, boolean, null.
 */
export function getDialogImplementation({
  showDialog,
  createInterface,
  getInterface,
}: DialogMethodHooks) {
  return async function dialogImplementation(
    args: RestrictedMethodOptions<DialogParameters>,
  ): Promise<boolean | null | string | Json> {
    const {
      params,
      context: { origin },
    } = args;

    const validatedParams = getValidatedParams(params, DialogParametersStruct);

    const type = getDialogType(validatedParams);

    const placeholder = isPromptDialog(validatedParams)
      ? validatedParams.placeholder
      : undefined;

    if (hasProperty(validatedParams, 'content')) {
      const id = await createInterface(
        origin,
        validatedParams.content as Component,
      );
      return showDialog(origin, type, id, placeholder);
    }

    validateInterface(origin, validatedParams.id, getInterface);

    return showDialog(origin, type, validatedParams.id, placeholder);
  };
}
/**
 * Validate that the interface ID is valid.
 *
 * @param origin - The origin of the request.
 * @param id - The interface ID.
 * @param getInterface - The function to get the interface.
 */
function validateInterface(
  origin: string,
  id: string,
  getInterface: GetInterface,
) {
  try {
    getInterface(origin, id);
  } catch (error) {
    throw rpcErrors.invalidParams({
      message: `Invalid params: ${error.message}`,
    });
  }
}

/**
 * Gets the dialog type from the dialog parameters.
 *
 * @param params - The dialog parameters.
 * @returns The dialog type.
 */
function getDialogType(params: DialogParameters): DialogType | undefined {
  return hasProperty(params, 'type') ? (params.type as DialogType) : undefined;
}

/**
 * Checks if the dialog parameters are for an alert dialog.
 *
 * @param params - The dialog parameters.
 * @returns `true` if the dialog parameters are for an alert dialog, `false`
 */
function isPromptDialog(params: DialogParameters): params is PromptDialog {
  return getDialogType(params) === DialogType.Prompt;
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
  struct: Struct<any, any>,
): DialogParameters {
  try {
    return createUnion(params, struct, 'type');
  } catch (error) {
    throw rpcErrors.invalidParams({
      message: `Invalid params: ${error.message}`,
    });
  }
}
