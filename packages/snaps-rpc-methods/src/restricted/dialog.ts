import type { Messenger } from '@metamask/messenger';
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
  ComponentOrElementStruct,
  selectiveUnion,
} from '@metamask/snaps-sdk';
import type {
  DialogParams,
  Component,
  PromptDialog,
  DialogResult,
} from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import type { Infer } from '@metamask/superstruct';
import { create, object, optional, size, string } from '@metamask/superstruct';
import type { NonEmptyArray } from '@metamask/utils';
import { hasProperty, isObject, isPlainObject } from '@metamask/utils';

import type {
  ApprovalControllerAddRequestAction,
  SnapInterfaceControllerCreateInterfaceAction,
  SnapInterfaceControllerGetInterfaceAction,
  SnapInterfaceControllerSetInterfaceDisplayedAction,
} from '../types';
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

export type DialogMethodHooks = Record<string, never>;

export type DialogMessengerActions =
  | ApprovalControllerAddRequestAction
  | SnapInterfaceControllerCreateInterfaceAction
  | SnapInterfaceControllerGetInterfaceAction
  | SnapInterfaceControllerSetInterfaceDisplayedAction;

type DialogSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: DialogMethodHooks;
  messenger: Messenger<string, DialogMessengerActions>;
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
 * @param options.messenger - The messenger.
 * @param options.methodHooks - The RPC method hooks.
 * @returns The specification for the `snap_dialog` permission.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  DialogSpecificationBuilderOptions,
  DialogSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
  messenger,
}: DialogSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getDialogImplementation({ methodHooks, messenger }),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<DialogMethodHooks> = {};

/* eslint-disable jsdoc/check-indentation */
/**
 * Display a [dialog](https://docs.metamask.io/snaps/features/custom-ui/dialogs/)
 * in the MetaMask UI.
 *
 * - `type` - The type of dialog. Not providing a type will create a fully
 * [custom dialog](https://docs.metamask.io/snaps/features/custom-ui/dialogs/#display-a-custom-dialog).
 * Possible values are:
 *   - `alert` - An alert that can only be acknowledged.
 *   - `confirmation` - A confirmation that can be accepted or rejected.
 *   - `prompt` - A prompt where the user can enter a text response.
 *
 * - One of:
 *   - `content` - The content of the alert, as a
 * [custom UI](https://docs.metamask.io/snaps/features/custom-ui/) component.
 *   - `id` - The ID of an
 * [interactive interface](https://docs.metamask.io/snaps/reference/snaps-api/snap_createinterface).
 * - `placeholder` - An optional placeholder text to display in the dialog. Only
 * applicable for the `prompt` dialog.
 *
 * @example
 * ```ts
 * import { Box, Heading, Text } from '@metamask/snaps-sdk/jsx';
 *
 * const walletAddress = await snap.request({
 *   method: 'snap_dialog',
 *   params: {
 *     type: 'prompt',
 *     content: (
 *       <Box>
 *         <Heading>What is the wallet address?</Heading>
 *         <Text>Please enter the wallet address to be monitored.</Text>
 *       </Box>
 *     ),
 *     placeholder: '0x123...',
 *   },
 * });
 *
 * // `walletAddress` will be a string containing the address entered by the
 * // user.
 * ```
 */
export const dialogBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
  actionNames: [
    'ApprovalController:addRequest',
    'SnapInterfaceController:createInterface',
    'SnapInterfaceController:getInterface',
    'SnapInterfaceController:setInterfaceDisplayed',
  ],
} as const);
/* eslint-enable jsdoc/check-indentation */

const AlertParametersWithContentStruct = object({
  type: enumValue(DialogType.Alert),
  content: ComponentOrElementStruct,
});

const AlertParametersWithIdStruct = object({
  type: enumValue(DialogType.Alert),
  id: string(),
});

const AlertParametersStruct = selectiveUnion((value) => {
  if (isPlainObject(value) && hasProperty(value, 'id')) {
    return AlertParametersWithIdStruct;
  }
  return AlertParametersWithContentStruct;
});

const ConfirmationParametersWithContentStruct = object({
  type: enumValue(DialogType.Confirmation),
  content: ComponentOrElementStruct,
});

const ConfirmationParametersWithIdStruct = object({
  type: enumValue(DialogType.Confirmation),
  id: string(),
});

const ConfirmationParametersStruct = selectiveUnion((value) => {
  if (isPlainObject(value) && hasProperty(value, 'id')) {
    return ConfirmationParametersWithIdStruct;
  }
  return ConfirmationParametersWithContentStruct;
});

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

const PromptParametersStruct = selectiveUnion((value) => {
  if (isPlainObject(value) && hasProperty(value, 'id')) {
    return PromptParametersWithIdStruct;
  }
  return PromptParametersWithContentStruct;
});

const DefaultParametersWithContentStruct = object({
  content: ComponentOrElementStruct,
});

const DefaultParametersWithIdStruct = object({
  id: string(),
});

const DefaultParametersStruct = selectiveUnion((value) => {
  if (isPlainObject(value) && hasProperty(value, 'id')) {
    return DefaultParametersWithIdStruct;
  }
  return DefaultParametersWithContentStruct;
});

const DialogParametersStruct = selectiveUnion((value) => {
  if (isPlainObject(value) && hasProperty(value, 'type')) {
    switch (value.type) {
      // We cannot use typedUnion here unfortunately.
      case DialogType.Alert:
        return AlertParametersStruct;
      case DialogType.Confirmation:
        return ConfirmationParametersStruct;
      case DialogType.Prompt:
        return PromptParametersStruct;
      default:
        throw new Error(
          `The "type" property must be one of: ${Object.values(DialogType).join(
            ', ',
          )}.`,
        );
    }
  }
  return DefaultParametersStruct;
});

export type DialogParameters = InferMatching<
  typeof DialogParametersStruct,
  DialogParams
>;

/**
 * Builds the method implementation for `snap_dialog`.
 *
 * @param options - The options.
 * @param options.messenger - The messenger.
 * @returns The method implementation which return value depends on the dialog
 * type, valid return types are: string, boolean, null.
 */
export function getDialogImplementation({
  messenger,
}: DialogSpecificationBuilderOptions) {
  return async function dialogImplementation(
    args: RestrictedMethodOptions<DialogParameters>,
  ): Promise<DialogResult> {
    const {
      params,
      context: { origin },
    } = args;

    if (!isObject(params)) {
      throw rpcErrors.invalidParams({
        message: 'Invalid params: Expected params to be a single object.',
      });
    }

    const validatedParams = getValidatedParams(params);
    const placeholder = isPromptDialog(validatedParams)
      ? validatedParams.placeholder
      : undefined;

    const validatedType = hasProperty(validatedParams, 'type')
      ? validatedParams.type
      : 'default';

    const approvalType =
      DIALOG_APPROVAL_TYPES[
        validatedType as keyof typeof DIALOG_APPROVAL_TYPES
      ];

    if (hasProperty(validatedParams, 'content')) {
      const id = await messenger.call(
        'SnapInterfaceController:createInterface',
        origin,
        validatedParams.content as Component,
      );

      messenger.call(
        'SnapInterfaceController:setInterfaceDisplayed',
        origin,
        id,
      );

      return messenger.call(
        'ApprovalController:addRequest',
        {
          id: approvalType === DIALOG_APPROVAL_TYPES.default ? id : undefined,
          origin,
          type: approvalType,
          requestData: { id, placeholder },
        },
        true,
      );
    }

    validateInterface(origin, validatedParams.id, messenger);

    messenger.call(
      'SnapInterfaceController:setInterfaceDisplayed',
      origin,
      validatedParams.id,
    );

    return messenger.call(
      'ApprovalController:addRequest',
      {
        id:
          approvalType === DIALOG_APPROVAL_TYPES.default
            ? validatedParams.id
            : undefined,
        origin,
        type: approvalType,
        requestData: { id: validatedParams.id, placeholder },
      },
      true,
    );
  };
}
/**
 * Validate that the interface ID is valid.
 *
 * @param origin - The origin of the request.
 * @param id - The interface ID.
 * @param messenger - The messenger.
 */
function validateInterface(
  origin: string,
  id: string,
  messenger: Messenger<string, SnapInterfaceControllerGetInterfaceAction>,
) {
  try {
    messenger.call('SnapInterfaceController:getInterface', origin, id);
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
 * @returns The validated confirm method parameter object.
 */
function getValidatedParams(params: unknown): DialogParameters {
  try {
    return create(params, DialogParametersStruct);
  } catch (error) {
    throw rpcErrors.invalidParams({
      message: `Invalid params: ${error.message}`,
    });
  }
}
