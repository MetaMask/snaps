// src/endowments/home-page.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
var permissionName = "endowment:page-home" /* HomePage */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions) => null,
    subjectTypes: [SubjectType.Snap]
  };
};
var homePageEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});

export {
  homePageEndowmentBuilder
};
//# sourceMappingURL=chunk-ZH3FC55E.mjs.map