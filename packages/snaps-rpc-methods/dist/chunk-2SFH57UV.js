"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/endowments/home-page.ts
var _permissioncontroller = require('@metamask/permission-controller');
var permissionName = "endowment:page-home" /* HomePage */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: _permissioncontroller.PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions) => null,
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
  };
};
var homePageEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});



exports.homePageEndowmentBuilder = homePageEndowmentBuilder;
//# sourceMappingURL=chunk-2SFH57UV.js.map