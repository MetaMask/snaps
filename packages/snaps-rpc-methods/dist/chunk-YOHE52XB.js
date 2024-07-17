"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/endowments/network-access.ts
var _permissioncontroller = require('@metamask/permission-controller');
var permissionName = "endowment:network-access" /* NetworkAccess */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: _permissioncontroller.PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions) => {
      return ["fetch", "Request", "Headers", "Response"];
    },
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
  };
};
var networkAccessEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});



exports.networkAccessEndowmentBuilder = networkAccessEndowmentBuilder;
//# sourceMappingURL=chunk-YOHE52XB.js.map