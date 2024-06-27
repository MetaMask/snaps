import {
  getCreateInterfaceImplementation,
  getGetInterfaceImplementation
} from "./chunk-FQWOVTBB.mjs";
import {
  getShowInAppNotificationImplementation,
  getShowNativeNotificationImplementation
} from "./chunk-ALRZENWP.mjs";
import {
  getRequestUserApprovalImplementation
} from "./chunk-USMLVZNH.mjs";
import {
  getClearSnapStateMethodImplementation,
  getGetSnapStateMethodImplementation,
  getUpdateSnapStateMethodImplementation
} from "./chunk-5U5WB3SM.mjs";
import {
  getGetLocaleMethodImplementation
} from "./chunk-KSIBNOB2.mjs";
import {
  EXCLUDED_SNAP_ENDOWMENTS,
  EXCLUDED_SNAP_PERMISSIONS
} from "./chunk-57SGDM5B.mjs";

// src/internals/simulation/methods/specifications.ts
import {
  endowmentPermissionBuilders,
  buildSnapEndowmentSpecifications,
  buildSnapRestrictedMethodSpecifications
} from "@metamask/snaps-rpc-methods";
import { DEFAULT_ENDOWMENTS } from "@metamask/snaps-utils";
function resolve(result) {
  return () => result;
}
function asyncResolve(result) {
  return async () => result;
}
function getPermissionSpecifications({
  controllerMessenger,
  hooks,
  runSaga,
  options
}) {
  return {
    ...buildSnapEndowmentSpecifications(EXCLUDED_SNAP_ENDOWMENTS),
    ...buildSnapRestrictedMethodSpecifications(EXCLUDED_SNAP_PERMISSIONS, {
      // Shared hooks.
      ...hooks,
      // Snaps-specific hooks.
      clearSnapState: getClearSnapStateMethodImplementation(runSaga),
      getLocale: getGetLocaleMethodImplementation(options),
      getSnapState: getGetSnapStateMethodImplementation(runSaga),
      getUnlockPromise: asyncResolve(true),
      // TODO: Allow the user to specify the result of this function.
      isOnPhishingList: resolve(false),
      maybeUpdatePhishingList: asyncResolve(),
      requestUserApproval: getRequestUserApprovalImplementation(runSaga),
      showInAppNotification: getShowInAppNotificationImplementation(runSaga),
      showNativeNotification: getShowNativeNotificationImplementation(runSaga),
      updateSnapState: getUpdateSnapStateMethodImplementation(runSaga),
      createInterface: getCreateInterfaceImplementation(controllerMessenger),
      getInterface: getGetInterfaceImplementation(controllerMessenger)
    })
  };
}
async function getEndowments(permissionController, snapId) {
  const allEndowments = await Object.keys(endowmentPermissionBuilders).reduce(async (promise, permissionName) => {
    const accumulator = await promise;
    if (permissionController.hasPermission(snapId, permissionName)) {
      const endowments = await permissionController.getEndowments(
        snapId,
        permissionName
      );
      if (endowments) {
        return accumulator.concat(endowments);
      }
    }
    return accumulator;
  }, Promise.resolve([]));
  return [.../* @__PURE__ */ new Set([...DEFAULT_ENDOWMENTS, ...allEndowments])];
}

export {
  resolve,
  asyncResolve,
  getPermissionSpecifications,
  getEndowments
};
//# sourceMappingURL=chunk-V4KBR7UP.mjs.map