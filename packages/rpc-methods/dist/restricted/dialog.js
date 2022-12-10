"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDialogImplementation = exports.dialogBuilder = exports.DialogType = void 0;
const controllers_1 = require("@metamask/controllers");
const eth_rpc_errors_1 = require("eth-rpc-errors");
const superstruct_1 = require("superstruct");
const methodName = 'snap_dialog';
var DialogType;
(function (DialogType) {
    DialogType["Alert"] = "Alert";
    DialogType["Confirmation"] = "Confirmation";
    DialogType["Prompt"] = "Prompt";
})(DialogType = exports.DialogType || (exports.DialogType = {}));
const BaseFieldsStruct = (0, superstruct_1.object)({
    title: (0, superstruct_1.size)((0, superstruct_1.string)(), 1, 40),
    description: (0, superstruct_1.optional)((0, superstruct_1.size)((0, superstruct_1.string)(), 1, 140)),
    textAreaContent: (0, superstruct_1.optional)((0, superstruct_1.size)((0, superstruct_1.string)(), 1, 1800)),
});
const PromptFieldsStruct = (0, superstruct_1.omit)(BaseFieldsStruct, ['textAreaContent']);
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
const specificationBuilder = ({ allowedCaveats = null, methodHooks, }) => {
    return {
        permissionType: controllers_1.PermissionType.RestrictedMethod,
        targetKey: methodName,
        allowedCaveats,
        methodImplementation: getDialogImplementation(methodHooks),
    };
};
exports.dialogBuilder = Object.freeze({
    targetKey: methodName,
    specificationBuilder,
    methodHooks: {
        showDialog: true,
    },
});
// Note: We use `type` here instead of `object` because `type` does not validate
// the keys of the object, which is what we want.
const BaseParamsStruct = (0, superstruct_1.type)({
    type: (0, superstruct_1.enums)([DialogType.Alert, DialogType.Confirmation, DialogType.Prompt]),
});
const AlertParametersStruct = (0, superstruct_1.object)({
    type: (0, superstruct_1.literal)(DialogType.Alert),
    fields: BaseFieldsStruct,
});
const ConfirmationParametersStruct = (0, superstruct_1.object)({
    type: (0, superstruct_1.literal)(DialogType.Confirmation),
    fields: BaseFieldsStruct,
});
const PromptParametersStruct = (0, superstruct_1.object)({
    type: (0, superstruct_1.literal)(DialogType.Prompt),
    fields: PromptFieldsStruct,
});
const DialogParametersStruct = (0, superstruct_1.union)([
    AlertParametersStruct,
    ConfirmationParametersStruct,
    PromptParametersStruct,
]);
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
function getDialogImplementation({ showDialog }) {
    return async function dialogImplementation(args) {
        const { params, context: { origin }, } = args;
        const validatedType = getValidatedType(params);
        const { fields } = getValidatedParams(params, structs[validatedType]);
        return showDialog(origin, validatedType, fields);
    };
}
exports.getDialogImplementation = getDialogImplementation;
/**
 * Get the validated type of the dialog parameters. Throws an error if the type
 * is invalid.
 *
 * @param params - The parameters to validate.
 * @returns The validated type of the dialog parameters.
 */
function getValidatedType(params) {
    try {
        return (0, superstruct_1.create)(params, BaseParamsStruct).type;
    }
    catch (error) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: `The "type" property must be one of: ${Object.values(DialogType).join(', ')}.`,
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
function getValidatedParams(params, struct) {
    try {
        return (0, superstruct_1.create)(params, struct);
    }
    catch (error) {
        if (error instanceof superstruct_1.StructError) {
            const { key, type: errorType } = error;
            if (key === 'textAreaContent' && errorType === 'never') {
                throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
                    message: 'Invalid params: Prompts may not specify a "textAreaContent" field.',
                });
            }
            throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
                message: `Invalid params: ${error.message}.`,
            });
        }
        /* istanbul ignore next */
        throw eth_rpc_errors_1.ethErrors.rpc.internal();
    }
}
//# sourceMappingURL=dialog.js.map