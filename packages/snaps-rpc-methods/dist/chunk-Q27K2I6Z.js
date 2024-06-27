"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/endowments/web-assembly.ts
var _permissioncontroller = require('@metamask/permission-controller');
var permissionName = "endowment:webassembly" /* WebAssemblyAccess */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: _permissioncontroller.PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions) => {
      return ["WebAssembly"];
    },
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
  };
};
var webAssemblyEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});



exports.webAssemblyEndowmentBuilder = webAssemblyEndowmentBuilder;
//# sourceMappingURL=chunk-Q27K2I6Z.js.map