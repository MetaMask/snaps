// src/endowments/network-access.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
var permissionName = "endowment:network-access" /* NetworkAccess */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions) => {
      return ["fetch", "Request", "Headers", "Response"];
    },
    subjectTypes: [SubjectType.Snap]
  };
};
var networkAccessEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});

export {
  networkAccessEndowmentBuilder
};
//# sourceMappingURL=chunk-4D2B2UQ6.mjs.map