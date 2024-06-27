"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkJ3I5KZIFjs = require('./chunk-J3I5KZIF.js');



var _chunkGMTKFAWOjs = require('./chunk-GMTKFAWO.js');


var _chunk5IN6UWRMjs = require('./chunk-5IN6UWRM.js');




var _chunkSB5EPHE3js = require('./chunk-SB5EPHE3.js');


var _chunk265BMFM5js = require('./chunk-265BMFM5.js');



var _chunkXAOCS6ZDjs = require('./chunk-XAOCS6ZD.js');

// src/internals/simulation/methods/specifications.ts




var _snapsrpcmethods = require('@metamask/snaps-rpc-methods');
var _snapsutils = require('@metamask/snaps-utils');
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
    ..._snapsrpcmethods.buildSnapEndowmentSpecifications.call(void 0, _chunkXAOCS6ZDjs.EXCLUDED_SNAP_ENDOWMENTS),
    ..._snapsrpcmethods.buildSnapRestrictedMethodSpecifications.call(void 0, _chunkXAOCS6ZDjs.EXCLUDED_SNAP_PERMISSIONS, {
      // Shared hooks.
      ...hooks,
      // Snaps-specific hooks.
      clearSnapState: _chunkSB5EPHE3js.getClearSnapStateMethodImplementation.call(void 0, runSaga),
      getLocale: _chunk265BMFM5js.getGetLocaleMethodImplementation.call(void 0, options),
      getSnapState: _chunkSB5EPHE3js.getGetSnapStateMethodImplementation.call(void 0, runSaga),
      getUnlockPromise: asyncResolve(true),
      // TODO: Allow the user to specify the result of this function.
      isOnPhishingList: resolve(false),
      maybeUpdatePhishingList: asyncResolve(),
      requestUserApproval: _chunk5IN6UWRMjs.getRequestUserApprovalImplementation.call(void 0, runSaga),
      showInAppNotification: _chunkGMTKFAWOjs.getShowInAppNotificationImplementation.call(void 0, runSaga),
      showNativeNotification: _chunkGMTKFAWOjs.getShowNativeNotificationImplementation.call(void 0, runSaga),
      updateSnapState: _chunkSB5EPHE3js.getUpdateSnapStateMethodImplementation.call(void 0, runSaga),
      createInterface: _chunkJ3I5KZIFjs.getCreateInterfaceImplementation.call(void 0, controllerMessenger),
      getInterface: _chunkJ3I5KZIFjs.getGetInterfaceImplementation.call(void 0, controllerMessenger)
    })
  };
}
async function getEndowments(permissionController, snapId) {
  const allEndowments = await Object.keys(_snapsrpcmethods.endowmentPermissionBuilders).reduce(async (promise, permissionName) => {
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
  return [.../* @__PURE__ */ new Set([..._snapsutils.DEFAULT_ENDOWMENTS, ...allEndowments])];
}






exports.resolve = resolve; exports.asyncResolve = asyncResolve; exports.getPermissionSpecifications = getPermissionSpecifications; exports.getEndowments = getEndowments;
//# sourceMappingURL=chunk-ZBKOTNT2.js.map