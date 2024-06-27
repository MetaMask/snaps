"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/endowments/lifecycle-hooks.ts
var _permissioncontroller = require('@metamask/permission-controller');
var permissionName = "endowment:lifecycle-hooks" /* LifecycleHooks */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: _permissioncontroller.PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions) => null,
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
  };
};
var lifecycleHooksEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});



exports.lifecycleHooksEndowmentBuilder = lifecycleHooksEndowmentBuilder;
//# sourceMappingURL=chunk-GE5XFDUE.js.map