"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/restricted/getLocale.ts
var _permissioncontroller = require('@metamask/permission-controller');
var methodName = "snap_getLocale";
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
  getLocale: true
};
var getLocaleBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks
});
function getImplementation({ getLocale }) {
  return async function implementation(_args) {
    return getLocale();
  };
}





exports.specificationBuilder = specificationBuilder; exports.getLocaleBuilder = getLocaleBuilder; exports.getImplementation = getImplementation;
//# sourceMappingURL=chunk-SYUGPLEP.js.map