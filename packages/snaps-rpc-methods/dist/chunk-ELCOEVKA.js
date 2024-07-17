"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/restricted/dialog.ts
var _permissioncontroller = require('@metamask/permission-controller');
var _rpcerrors = require('@metamask/rpc-errors');





var _snapssdk = require('@metamask/snaps-sdk');
var _snapsutils = require('@metamask/snaps-utils');








var _superstruct = require('@metamask/superstruct');
var _utils = require('@metamask/utils');
var methodName = "snap_dialog";
var DIALOG_APPROVAL_TYPES = {
  [_snapssdk.DialogType.Alert]: `${methodName}:alert`,
  [_snapssdk.DialogType.Confirmation]: `${methodName}:confirmation`,
  [_snapssdk.DialogType.Prompt]: `${methodName}:prompt`,
  default: methodName
};
var PlaceholderStruct = _superstruct.optional.call(void 0, _superstruct.size.call(void 0, _superstruct.string.call(void 0, ), 1, 40));
var specificationBuilder = ({
  allowedCaveats = null,
  methodHooks: methodHooks2
}) => {
  return {
    permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getDialogImplementation(methodHooks2),
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
  };
};
var methodHooks = {
  requestUserApproval: true,
  createInterface: true,
  getInterface: true
};
var dialogBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks
});
var BaseParamsStruct = _superstruct.type.call(void 0, {
  type: _superstruct.optional.call(void 0, 
    _superstruct.enums.call(void 0, [_snapssdk.DialogType.Alert, _snapssdk.DialogType.Confirmation, _snapssdk.DialogType.Prompt])
  )
});
var AlertParametersWithContentStruct = _superstruct.object.call(void 0, {
  type: _snapssdk.enumValue.call(void 0, _snapssdk.DialogType.Alert),
  content: _snapssdk.ComponentOrElementStruct
});
var AlertParametersWithIdStruct = _superstruct.object.call(void 0, {
  type: _snapssdk.enumValue.call(void 0, _snapssdk.DialogType.Alert),
  id: _superstruct.string.call(void 0, )
});
var AlertParametersStruct = _snapssdk.union.call(void 0, [
  AlertParametersWithContentStruct,
  AlertParametersWithIdStruct
]);
var ConfirmationParametersWithContentStruct = _superstruct.object.call(void 0, {
  type: _snapssdk.enumValue.call(void 0, _snapssdk.DialogType.Confirmation),
  content: _snapssdk.ComponentOrElementStruct
});
var ConfirmationParametersWithIdStruct = _superstruct.object.call(void 0, {
  type: _snapssdk.enumValue.call(void 0, _snapssdk.DialogType.Confirmation),
  id: _superstruct.string.call(void 0, )
});
var ConfirmationParametersStruct = _snapssdk.union.call(void 0, [
  ConfirmationParametersWithContentStruct,
  ConfirmationParametersWithIdStruct
]);
var PromptParametersWithContentStruct = _superstruct.object.call(void 0, {
  type: _snapssdk.enumValue.call(void 0, _snapssdk.DialogType.Prompt),
  content: _snapssdk.ComponentOrElementStruct,
  placeholder: PlaceholderStruct
});
var PromptParametersWithIdStruct = _superstruct.object.call(void 0, {
  type: _snapssdk.enumValue.call(void 0, _snapssdk.DialogType.Prompt),
  id: _superstruct.string.call(void 0, ),
  placeholder: PlaceholderStruct
});
var PromptParametersStruct = _snapssdk.union.call(void 0, [
  PromptParametersWithContentStruct,
  PromptParametersWithIdStruct
]);
var DefaultParametersWithContentStruct = _superstruct.object.call(void 0, {
  content: _snapssdk.ComponentOrElementStruct
});
var DefaultParametersWithIdStruct = _superstruct.object.call(void 0, {
  id: _superstruct.string.call(void 0, )
});
var DefaultParametersStruct = _snapssdk.union.call(void 0, [
  DefaultParametersWithContentStruct,
  DefaultParametersWithIdStruct
]);
var DialogParametersStruct = _snapssdk.union.call(void 0, [
  AlertParametersStruct,
  ConfirmationParametersStruct,
  PromptParametersStruct,
  DefaultParametersStruct
]);
var structs = {
  [_snapssdk.DialogType.Alert]: AlertParametersStruct,
  [_snapssdk.DialogType.Confirmation]: ConfirmationParametersStruct,
  [_snapssdk.DialogType.Prompt]: PromptParametersStruct
};
function getDialogImplementation({
  requestUserApproval,
  createInterface,
  getInterface
}) {
  return async function dialogImplementation(args) {
    const {
      params,
      context: { origin }
    } = args;
    if (!_utils.isObject.call(void 0, params)) {
      throw _rpcerrors.rpcErrors.invalidParams({
        message: "Invalid params: Expected params to be a single object."
      });
    }
    const validatedType = getValidatedType(params);
    const approvalType = validatedType ? DIALOG_APPROVAL_TYPES[validatedType] : DIALOG_APPROVAL_TYPES.default;
    const validatedParams = getValidatedParams(params, validatedType);
    const placeholder = isPromptDialog(validatedParams) ? validatedParams.placeholder : void 0;
    if (_utils.hasProperty.call(void 0, validatedParams, "content")) {
      const id = await createInterface(
        origin,
        validatedParams.content
      );
      return requestUserApproval({
        id: validatedType ? void 0 : id,
        origin,
        type: approvalType,
        requestData: { id, placeholder }
      });
    }
    validateInterface(origin, validatedParams.id, getInterface);
    return requestUserApproval({
      id: validatedType ? void 0 : validatedParams.id,
      origin,
      type: approvalType,
      requestData: { id: validatedParams.id, placeholder }
    });
  };
}
function validateInterface(origin, id, getInterface) {
  try {
    getInterface(origin, id);
  } catch (error) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: `Invalid params: ${error.message}`
    });
  }
}
function getDialogType(params) {
  return _utils.hasProperty.call(void 0, params, "type") ? params.type : void 0;
}
function getValidatedType(params) {
  try {
    return _superstruct.create.call(void 0, params, BaseParamsStruct).type;
  } catch (error) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: `The "type" property must be one of: ${Object.values(
        _snapssdk.DialogType
      ).join(", ")}.`
    });
  }
}
function isPromptDialog(params) {
  return getDialogType(params) === _snapssdk.DialogType.Prompt;
}
function getValidatedParams(params, validatedType) {
  try {
    return validatedType ? _snapsutils.createUnion.call(void 0, params, structs[validatedType], "type") : _superstruct.create.call(void 0, params, DefaultParametersStruct);
  } catch (error) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: `Invalid params: ${error.message}`
    });
  }
}





exports.DIALOG_APPROVAL_TYPES = DIALOG_APPROVAL_TYPES; exports.dialogBuilder = dialogBuilder; exports.getDialogImplementation = getDialogImplementation;
//# sourceMappingURL=chunk-ELCOEVKA.js.map