// src/restricted/dialog.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import {
  DialogType,
  enumValue,
  union,
  ComponentOrElementStruct
} from "@metamask/snaps-sdk";
import { createUnion } from "@metamask/snaps-utils";
import {
  create,
  enums,
  object,
  optional,
  size,
  string,
  type
} from "@metamask/superstruct";
import { hasProperty, isObject } from "@metamask/utils";
var methodName = "snap_dialog";
var DIALOG_APPROVAL_TYPES = {
  [DialogType.Alert]: `${methodName}:alert`,
  [DialogType.Confirmation]: `${methodName}:confirmation`,
  [DialogType.Prompt]: `${methodName}:prompt`,
  default: methodName
};
var PlaceholderStruct = optional(size(string(), 1, 40));
var specificationBuilder = ({
  allowedCaveats = null,
  methodHooks: methodHooks2
}) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getDialogImplementation(methodHooks2),
    subjectTypes: [SubjectType.Snap]
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
var BaseParamsStruct = type({
  type: optional(
    enums([DialogType.Alert, DialogType.Confirmation, DialogType.Prompt])
  )
});
var AlertParametersWithContentStruct = object({
  type: enumValue(DialogType.Alert),
  content: ComponentOrElementStruct
});
var AlertParametersWithIdStruct = object({
  type: enumValue(DialogType.Alert),
  id: string()
});
var AlertParametersStruct = union([
  AlertParametersWithContentStruct,
  AlertParametersWithIdStruct
]);
var ConfirmationParametersWithContentStruct = object({
  type: enumValue(DialogType.Confirmation),
  content: ComponentOrElementStruct
});
var ConfirmationParametersWithIdStruct = object({
  type: enumValue(DialogType.Confirmation),
  id: string()
});
var ConfirmationParametersStruct = union([
  ConfirmationParametersWithContentStruct,
  ConfirmationParametersWithIdStruct
]);
var PromptParametersWithContentStruct = object({
  type: enumValue(DialogType.Prompt),
  content: ComponentOrElementStruct,
  placeholder: PlaceholderStruct
});
var PromptParametersWithIdStruct = object({
  type: enumValue(DialogType.Prompt),
  id: string(),
  placeholder: PlaceholderStruct
});
var PromptParametersStruct = union([
  PromptParametersWithContentStruct,
  PromptParametersWithIdStruct
]);
var DefaultParametersWithContentStruct = object({
  content: ComponentOrElementStruct
});
var DefaultParametersWithIdStruct = object({
  id: string()
});
var DefaultParametersStruct = union([
  DefaultParametersWithContentStruct,
  DefaultParametersWithIdStruct
]);
var DialogParametersStruct = union([
  AlertParametersStruct,
  ConfirmationParametersStruct,
  PromptParametersStruct,
  DefaultParametersStruct
]);
var structs = {
  [DialogType.Alert]: AlertParametersStruct,
  [DialogType.Confirmation]: ConfirmationParametersStruct,
  [DialogType.Prompt]: PromptParametersStruct
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
    if (!isObject(params)) {
      throw rpcErrors.invalidParams({
        message: "Invalid params: Expected params to be a single object."
      });
    }
    const validatedType = getValidatedType(params);
    const approvalType = validatedType ? DIALOG_APPROVAL_TYPES[validatedType] : DIALOG_APPROVAL_TYPES.default;
    const validatedParams = getValidatedParams(params, validatedType);
    const placeholder = isPromptDialog(validatedParams) ? validatedParams.placeholder : void 0;
    if (hasProperty(validatedParams, "content")) {
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
    throw rpcErrors.invalidParams({
      message: `Invalid params: ${error.message}`
    });
  }
}
function getDialogType(params) {
  return hasProperty(params, "type") ? params.type : void 0;
}
function getValidatedType(params) {
  try {
    return create(params, BaseParamsStruct).type;
  } catch (error) {
    throw rpcErrors.invalidParams({
      message: `The "type" property must be one of: ${Object.values(
        DialogType
      ).join(", ")}.`
    });
  }
}
function isPromptDialog(params) {
  return getDialogType(params) === DialogType.Prompt;
}
function getValidatedParams(params, validatedType) {
  try {
    return validatedType ? createUnion(params, structs[validatedType], "type") : create(params, DefaultParametersStruct);
  } catch (error) {
    throw rpcErrors.invalidParams({
      message: `Invalid params: ${error.message}`
    });
  }
}

export {
  DIALOG_APPROVAL_TYPES,
  dialogBuilder,
  getDialogImplementation
};
//# sourceMappingURL=chunk-TQCUJQHY.mjs.map