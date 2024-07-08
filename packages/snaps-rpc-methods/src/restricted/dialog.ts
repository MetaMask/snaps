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
  Component,
  InterfaceState,
  SnapId,
  PromptDialog,
  ComponentOrElement,
} from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import { createUnion } from '@metamask/snaps-utils';
import type { Infer, Struct } from '@metamask/superstruct';
import {
  create,
  enums,
  object,
  optional,
  size,
  string,
  type,
} from '@metamask/superstruct';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { hasProperty, isObject } from '@metamask/utils';

import { type MethodHooksObject } from '../utils';

const methodName = 'snap_dialog';

export type DialogApprovalTypes = Record<DialogType, string> & {
  default: string;
};

export const DIALOG_APPROVAL_TYPES = {
  [DialogType.Alert]: `${methodName}:alert`,
  [DialogType.Confirmation]: `${methodName}:confirmation`,
  [DialogType.Prompt]: `${methodName}:prompt`,
  default: methodName,
};

const PlaceholderStruct = optional(size(string(), 1, 40));

export type Placeholder = Infer<typeof PlaceholderStruct>;

type RequestUserApprovalOptions = {
  id?: string;
  origin: string;
  type: string;
  requestData: {
    id: string;
    placeholder?: string;
  };
};

type RequestUserApproval = (
  opts: RequestUserApprovalOptions,
) => Promise<boolean | null | string | Json>;

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
   * @param opts - The `requestUserApproval` options.
   * @param opts.id - The approval ID. If not provided, a new approval ID will be generated.
   * @param opts.origin - The origin of the request. In this case, the Snap ID.
   * @param opts.type - The type of the approval request.
   * @param opts.requestData - The data of the approval request.
   * @param opts.requestData.id - The ID of the interface.
   * @param opts.requestData.placeholder - The placeholder of the `Prompt` dialog.
   */
  requestUserApproval: RequestUserApproval;

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
  requestUserApproval: true,
  createInterface: true,
  getInterface: true,
};

export const dialogBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
} as const);

// Note: We use `type` here instead of `object` because `type` does not validate
// the keys of the object, which is what we want.
const BaseParamsStruct = type({
  type: optional(
    enums([DialogType.Alert, DialogType.Confirmation, DialogType.Prompt]),
  ),
});

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

const DefaultParametersWithContentStruct = object({
  content: ComponentOrElementStruct,
});

const DefaultParametersWithIdStruct = object({
  id: string(),
});

const DefaultParametersStruct = union([
  DefaultParametersWithContentStruct,
  DefaultParametersWithIdStruct,
]);

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

const structs: Record<DialogType, Struct<any, any>> = {
  [DialogType.Alert]: AlertParametersStruct,
  [DialogType.Confirmation]: ConfirmationParametersStruct,
  [DialogType.Prompt]: PromptParametersStruct,
};

/**
 * Builds the method implementation for `snap_dialog`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.requestUserApproval - A function that creates a new Approval in the ApprovalController.
 * This function should return a Promise that resolves with the appropriate value when the user has approved or rejected the request.
 * @param hooks.createInterface - A function that creates the interface in SnapInterfaceController.
 * @param hooks.getInterface - A function that gets an interface from SnapInterfaceController.
 * @returns The method implementation which return value depends on the dialog
 * type, valid return types are: string, boolean, null.
 */
export function getDialogImplementation({
  requestUserApproval,
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

    if (!isObject(params)) {
      throw rpcErrors.invalidParams({
        message: 'Invalid params: Expected params to be a single object.',
      });
    }

    const validatedType = getValidatedType(params);

    const approvalType = validatedType
      ? DIALOG_APPROVAL_TYPES[validatedType]
      : DIALOG_APPROVAL_TYPES.default;

    const validatedParams = getValidatedParams(params, validatedType);
    const placeholder = isPromptDialog(validatedParams)
      ? validatedParams.placeholder
      : undefined;

    if (hasProperty(validatedParams, 'content')) {
      const id = await createInterface(
        origin,
        validatedParams.content as Component,
      );

      return requestUserApproval({
        id: validatedType ? undefined : id,
        origin,
        type: approvalType,
        requestData: { id, placeholder },
      });
    }

    validateInterface(origin, validatedParams.id, getInterface);

    return requestUserApproval({
      id: validatedType ? undefined : validatedParams.id,
      origin,
      type: approvalType,
      requestData: { id: validatedParams.id, placeholder },
    });
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
 * Get the validated type of the dialog parameters. Throws an error if the type
 * is invalid.
 *
 * @param params - The parameters to validate.
 * @returns The validated type of the dialog parameters.
 */
function getValidatedType(params: unknown): DialogType | undefined {
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
 * Checks if the dialog parameters are for a prompt dialog.
 *
 * @param params - The dialog parameters.
 * @returns `true` if the dialog parameters are for a prompt dialog, `false` otherwise.
 */
function isPromptDialog(params: DialogParameters): params is PromptDialog {
  return getDialogType(params) === DialogType.Prompt;
}

/**
 * Validates the confirm method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @param validatedType - The validated dialog type.
 * @returns The validated confirm method parameter object.
 */
function getValidatedParams(
  params: unknown,
  validatedType: DialogType | undefined,
): DialogParameters {
  try {
    return validatedType
      ? createUnion(params, structs[validatedType], 'type')
      : create(params, DefaultParametersStruct);
  } catch (error) {
    throw rpcErrors.invalidParams({
      message: `Invalid params: ${error.message}`,
    });
  }
}
