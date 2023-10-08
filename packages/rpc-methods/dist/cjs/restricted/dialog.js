"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DialogType: function() {
        return DialogType;
    },
    dialogBuilder: function() {
        return dialogBuilder;
    },
    getDialogImplementation: function() {
        return getDialogImplementation;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _snapsui = require("@metamask/snaps-ui");
const _snapsutils = require("@metamask/snaps-utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _superstruct = require("superstruct");
const methodName = 'snap_dialog';
var DialogType;
(function(DialogType) {
    DialogType["Alert"] = 'alert';
    DialogType["Confirmation"] = 'confirmation';
    DialogType["Prompt"] = 'prompt';
})(DialogType || (DialogType = {}));
const PlaceholderStruct = (0, _superstruct.optional)((0, _superstruct.size)((0, _superstruct.string)(), 1, 40));
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
        permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
        targetName: methodName,
        allowedCaveats,
        methodImplementation: getDialogImplementation(methodHooks),
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const methodHooks = {
    showDialog: true
};
const dialogBuilder = Object.freeze({
    targetName: methodName,
    specificationBuilder,
    methodHooks
});
// Note: We use `type` here instead of `object` because `type` does not validate
// the keys of the object, which is what we want.
const BaseParamsStruct = (0, _superstruct.type)({
    type: (0, _superstruct.enums)([
        DialogType.Alert,
        DialogType.Confirmation,
        DialogType.Prompt
    ])
});
const AlertParametersStruct = (0, _superstruct.object)({
    type: (0, _snapsutils.enumValue)(DialogType.Alert),
    content: _snapsui.ComponentStruct
});
const ConfirmationParametersStruct = (0, _superstruct.object)({
    type: (0, _snapsutils.enumValue)(DialogType.Confirmation),
    content: _snapsui.ComponentStruct
});
const PromptParametersStruct = (0, _superstruct.object)({
    type: (0, _snapsutils.enumValue)(DialogType.Prompt),
    content: _snapsui.ComponentStruct,
    placeholder: PlaceholderStruct
});
const DialogParametersStruct = (0, _superstruct.union)([
    AlertParametersStruct,
    ConfirmationParametersStruct,
    PromptParametersStruct
]);
const structs = {
    [DialogType.Alert]: AlertParametersStruct,
    [DialogType.Confirmation]: ConfirmationParametersStruct,
    [DialogType.Prompt]: PromptParametersStruct
};
function getDialogImplementation({ showDialog }) {
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
        return (0, _superstruct.create)(params, BaseParamsStruct).type;
    } catch (error) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
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
        return (0, _superstruct.create)(params, struct);
    } catch (error) {
        if (error instanceof _superstruct.StructError) {
            const { key, type: errorType } = error;
            if (key === 'placeholder' && errorType === 'never') {
                throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                    message: 'Invalid params: Alerts or confirmations may not specify a "placeholder" field.'
                });
            }
            throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                message: `Invalid params: ${error.message}.`
            });
        }
        /* istanbul ignore next */ throw _ethrpcerrors.ethErrors.rpc.internal();
    }
}

//# sourceMappingURL=dialog.js.map