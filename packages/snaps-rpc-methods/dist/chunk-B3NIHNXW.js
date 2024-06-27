"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/endowments/ethereum-provider.ts
var _permissioncontroller = require('@metamask/permission-controller');
var permissionName = "endowment:ethereum-provider" /* EthereumProvider */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: _permissioncontroller.PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions) => {
      return ["ethereum"];
    },
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
  };
};
var ethereumProviderEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});



exports.ethereumProviderEndowmentBuilder = ethereumProviderEndowmentBuilder;
//# sourceMappingURL=chunk-B3NIHNXW.js.map