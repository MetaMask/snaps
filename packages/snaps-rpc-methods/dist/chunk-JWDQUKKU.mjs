// src/restricted/notify.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import { NotificationType } from "@metamask/snaps-sdk";
import { validateTextLinks } from "@metamask/snaps-utils";
import { isObject } from "@metamask/utils";
var methodName = "snap_notify";
var specificationBuilder = ({ allowedCaveats = null, methodHooks: methodHooks2 }) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getImplementation(methodHooks2),
    subjectTypes: [SubjectType.Snap]
  };
};
var methodHooks = {
  showNativeNotification: true,
  showInAppNotification: true,
  isOnPhishingList: true,
  maybeUpdatePhishingList: true
};
var notifyBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks
});
function getImplementation({
  showNativeNotification,
  showInAppNotification,
  isOnPhishingList,
  maybeUpdatePhishingList
}) {
  return async function implementation(args) {
    const {
      params,
      context: { origin }
    } = args;
    const validatedParams = getValidatedParams(params);
    await maybeUpdatePhishingList();
    validateTextLinks(validatedParams.message, isOnPhishingList);
    switch (validatedParams.type) {
      case NotificationType.Native:
        return await showNativeNotification(origin, validatedParams);
      case NotificationType.InApp:
        return await showInAppNotification(origin, validatedParams);
      default:
        throw rpcErrors.invalidParams({
          message: 'Must specify a valid notification "type".'
        });
    }
  };
}
function getValidatedParams(params) {
  if (!isObject(params)) {
    throw rpcErrors.invalidParams({
      message: "Expected params to be a single object."
    });
  }
  const { type, message } = params;
  if (!type || typeof type !== "string" || !Object.values(NotificationType).includes(type)) {
    throw rpcErrors.invalidParams({
      message: 'Must specify a valid notification "type".'
    });
  }
  if (!message || typeof message !== "string" || message.length >= 50) {
    throw rpcErrors.invalidParams({
      message: 'Must specify a non-empty string "message" less than 50 characters long.'
    });
  }
  return params;
}

export {
  specificationBuilder,
  notifyBuilder,
  getImplementation,
  getValidatedParams
};
//# sourceMappingURL=chunk-JWDQUKKU.mjs.map