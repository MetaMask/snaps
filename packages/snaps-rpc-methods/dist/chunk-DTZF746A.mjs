// src/endowments/lifecycle-hooks.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
var permissionName = "endowment:lifecycle-hooks" /* LifecycleHooks */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions) => null,
    subjectTypes: [SubjectType.Snap]
  };
};
var lifecycleHooksEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});

export {
  lifecycleHooksEndowmentBuilder
};
//# sourceMappingURL=chunk-DTZF746A.mjs.map