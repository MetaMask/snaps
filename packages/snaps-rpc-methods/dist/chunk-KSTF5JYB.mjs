// src/endowments/ethereum-provider.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
var permissionName = "endowment:ethereum-provider" /* EthereumProvider */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions) => {
      return ["ethereum"];
    },
    subjectTypes: [SubjectType.Snap]
  };
};
var ethereumProviderEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});

export {
  ethereumProviderEndowmentBuilder
};
//# sourceMappingURL=chunk-KSTF5JYB.mjs.map