import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { ComponentStruct } from '@metamask/snaps-ui';
import { enumValue } from '@metamask/snaps-utils';
import { ethErrors } from 'eth-rpc-errors';
import { create, enums, object, optional, size, string, StructError, type, union } from 'superstruct';
const methodName = 'snap_dialog';
export var DialogType;
(function(DialogType) {
    DialogType["Alert"] = 'alert';
    DialogType["Confirmation"] = 'confirmation';
    DialogType["Prompt"] = 'prompt';
})(DialogType || (DialogType = {}));
const PlaceholderStruct = optional(size(string(), 1, 40));
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
 */ const specificationBuilder = ({ allowedCaveats = null, methodHooks })=>{
    return {
        permissionType: PermissionType.RestrictedMethod,
        targetName: methodName,
        allowedCaveats,
        methodImplementation: getDialogImplementation(methodHooks),
        subjectTypes: [
            SubjectType.Snap
        ]
    };
};
const methodHooks = {
    showDialog: true
};
export const dialogBuilder = Object.freeze({
    targetName: methodName,
    specificationBuilder,
    methodHooks
});
// Note: We use `type` here instead of `object` because `type` does not validate
// the keys of the object, which is what we want.
const BaseParamsStruct = type({
    type: enums([
        DialogType.Alert,
        DialogType.Confirmation,
        DialogType.Prompt
    ])
});
const AlertParametersStruct = object({
    type: enumValue(DialogType.Alert),
    content: ComponentStruct
});
const ConfirmationParametersStruct = object({
    type: enumValue(DialogType.Confirmation),
    content: ComponentStruct
});
const PromptParametersStruct = object({
    type: enumValue(DialogType.Prompt),
    content: ComponentStruct,
    placeholder: PlaceholderStruct
});
const DialogParametersStruct = union([
    AlertParametersStruct,
    ConfirmationParametersStruct,
    PromptParametersStruct
]);
const structs = {
    [DialogType.Alert]: AlertParametersStruct,
    [DialogType.Confirmation]: ConfirmationParametersStruct,
    [DialogType.Prompt]: PromptParametersStruct
};
/**
 * Builds the method implementation for `snap_dialog`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showDialog - A function that shows the specified dialog in the
 * MetaMask UI and returns the appropriate value for the dialog type.
 * @returns The method implementation which return value depends on the dialog
 * type, valid return types are: string, boolean, null.
 */ export function getDialogImplementation({ showDialog }) {
    return async function dialogImplementation(args) {
        const { params, context: { origin } } = args;
        const validatedType = getValidatedType(params);
        const validatedParams = getValidatedParams(params, structs[validatedType]);
        const { content } = validatedParams;
        const placeholder = validatedParams.type === DialogType.Prompt ? validatedParams.placeholder : undefined;
        return showDialog(origin, validatedType, content, placeholder);
    };
}
/**
 * Get the validated type of the dialog parameters. Throws an error if the type
 * is invalid.
 *
 * @param params - The parameters to validate.
 * @returns The validated type of the dialog parameters.
 */ function getValidatedType(params) {
    try {
        return create(params, BaseParamsStruct).type;
    } catch (error) {
        throw ethErrors.rpc.invalidParams({
            message: `The "type" property must be one of: ${Object.values(DialogType).join(', ')}.`
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
 */ function getValidatedParams(params, struct) {
    try {
        return create(params, struct);
    } catch (error) {
        if (error instanceof StructError) {
            const { key, type: errorType } = error;
            if (key === 'placeholder' && errorType === 'never') {
                throw ethErrors.rpc.invalidParams({
                    message: 'Invalid params: Alerts or confirmations may not specify a "placeholder" field.'
                });
            }
            throw ethErrors.rpc.invalidParams({
                message: `Invalid params: ${error.message}.`
            });
        }
        /* istanbul ignore next */ throw ethErrors.rpc.internal();
    }
}

//# sourceMappingURL=dialog.js.map