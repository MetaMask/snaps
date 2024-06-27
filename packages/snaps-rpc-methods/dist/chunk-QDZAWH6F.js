"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/restricted/notify.ts
var _permissioncontroller = require('@metamask/permission-controller');
var _rpcerrors = require('@metamask/rpc-errors');
var _snapssdk = require('@metamask/snaps-sdk');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var methodName = "snap_notify";
var specificationBuilder = ({ allowedCaveats = null, methodHooks: methodHooks2 }) => {
  return {
    permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getImplementation(methodHooks2),
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
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
    _snapsutils.validateTextLinks.call(void 0, validatedParams.message, isOnPhishingList);
    switch (validatedParams.type) {
      case _snapssdk.NotificationType.Native:
        return await showNativeNotification(origin, validatedParams);
      case _snapssdk.NotificationType.InApp:
        return await showInAppNotification(origin, validatedParams);
      default:
        throw _rpcerrors.rpcErrors.invalidParams({
          message: 'Must specify a valid notification "type".'
        });
    }
  };
}
function getValidatedParams(params) {
  if (!_utils.isObject.call(void 0, params)) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Expected params to be a single object."
    });
  }
  const { type, message } = params;
  if (!type || typeof type !== "string" || !Object.values(_snapssdk.NotificationType).includes(type)) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: 'Must specify a valid notification "type".'
    });
  }
  if (!message || typeof message !== "string" || message.length >= 50) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: 'Must specify a non-empty string "message" less than 50 characters long.'
    });
  }
  return params;
}






exports.specificationBuilder = specificationBuilder; exports.notifyBuilder = notifyBuilder; exports.getImplementation = getImplementation; exports.getValidatedParams = getValidatedParams;
//# sourceMappingURL=chunk-QDZAWH6F.js.map