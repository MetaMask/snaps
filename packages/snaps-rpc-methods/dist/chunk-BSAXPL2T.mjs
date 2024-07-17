import {
  restrictedMethodPermissionBuilders
} from "./chunk-SYB5TG5O.mjs";
import {
  caveatMappers
} from "./chunk-FNUO7MQ4.mjs";
import {
  selectHooks
} from "./chunk-W33UWNA2.mjs";
import {
  endowmentCaveatMappers,
  endowmentPermissionBuilders
} from "./chunk-TAXLFFV4.mjs";

// src/permissions.ts
import { hasProperty } from "@metamask/utils";
function processSnapPermissions(initialPermissions) {
  return Object.fromEntries(
    Object.entries(initialPermissions).map(([initialPermission, value]) => {
      if (hasProperty(caveatMappers, initialPermission)) {
        return [initialPermission, caveatMappers[initialPermission](value)];
      } else if (hasProperty(endowmentCaveatMappers, initialPermission)) {
        return [
          initialPermission,
          endowmentCaveatMappers[initialPermission](value)
        ];
      }
      return [
        initialPermission,
        value
      ];
    })
  );
}
var buildSnapEndowmentSpecifications = (excludedEndowments) => Object.values(endowmentPermissionBuilders).reduce((allSpecifications, { targetName, specificationBuilder }) => {
  if (!excludedEndowments.includes(targetName)) {
    allSpecifications[targetName] = specificationBuilder({});
  }
  return allSpecifications;
}, {});
var buildSnapRestrictedMethodSpecifications = (excludedPermissions, hooks) => Object.values(restrictedMethodPermissionBuilders).reduce((specifications, { targetName, specificationBuilder, methodHooks }) => {
  if (!excludedPermissions.includes(targetName)) {
    specifications[targetName] = specificationBuilder({
      // @ts-expect-error The selectHooks type is wonky
      methodHooks: selectHooks(
        hooks,
        methodHooks
      )
    });
  }
  return specifications;
}, {});

export {
  processSnapPermissions,
  buildSnapEndowmentSpecifications,
  buildSnapRestrictedMethodSpecifications
};
//# sourceMappingURL=chunk-BSAXPL2T.mjs.map