// src/endowments/web-assembly.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
var permissionName = "endowment:webassembly" /* WebAssemblyAccess */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions) => {
      return ["WebAssembly"];
    },
    subjectTypes: [SubjectType.Snap]
  };
};
var webAssemblyEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});

export {
  webAssemblyEndowmentBuilder
};
//# sourceMappingURL=chunk-O66NZFSD.mjs.map