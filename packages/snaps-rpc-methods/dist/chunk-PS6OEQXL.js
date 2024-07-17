"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkFFHVA6PPjs = require('./chunk-FFHVA6PP.js');

// src/permitted/requestSnaps.ts
var _rpcerrors = require('@metamask/rpc-errors');



var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var hookNames = {
  installSnaps: true,
  requestPermissions: true,
  getPermissions: true
};
var requestSnapsHandler = {
  methodNames: ["wallet_requestSnaps"],
  implementation: requestSnapsImplementation,
  hookNames
};
function hasRequestedSnaps(existingPermissions, requestedSnaps) {
  const snapIdCaveat = existingPermissions[_chunkFFHVA6PPjs.WALLET_SNAP_PERMISSION_KEY]?.caveats?.find(
    (caveat) => caveat.type === _snapsutils.SnapCaveatType.SnapIds
  );
  const permittedSnaps = snapIdCaveat?.value;
  if (_utils.isObject.call(void 0, permittedSnaps)) {
    return Object.keys(requestedSnaps).every(
      (requestedSnap) => _utils.hasProperty.call(void 0, permittedSnaps, requestedSnap)
    );
  }
  return false;
}
function getSnapPermissionsRequest(existingPermissions, requestedPermissions) {
  _snapsutils.verifyRequestedSnapPermissions.call(void 0, requestedPermissions);
  if (!existingPermissions[_chunkFFHVA6PPjs.WALLET_SNAP_PERMISSION_KEY]) {
    return requestedPermissions;
  }
  const snapIdCaveat = existingPermissions[_chunkFFHVA6PPjs.WALLET_SNAP_PERMISSION_KEY].caveats?.find(
    (caveat) => caveat.type === _snapsutils.SnapCaveatType.SnapIds
  );
  const permittedSnaps = snapIdCaveat?.value ?? {};
  const requestedSnaps = requestedPermissions[_chunkFFHVA6PPjs.WALLET_SNAP_PERMISSION_KEY].caveats[0].value;
  const snapIdSet = /* @__PURE__ */ new Set([
    ...Object.keys(permittedSnaps),
    ...Object.keys(requestedSnaps)
  ]);
  const mergedCaveatValue = [...snapIdSet].reduce(
    (request, snapId) => {
      request[snapId] = requestedSnaps[snapId] ?? permittedSnaps[snapId];
      return request;
    },
    {}
  );
  requestedPermissions[_chunkFFHVA6PPjs.WALLET_SNAP_PERMISSION_KEY].caveats[0].value = mergedCaveatValue;
  return requestedPermissions;
}
async function requestSnapsImplementation(req, res, _next, end, { installSnaps, requestPermissions, getPermissions }) {
  const requestedSnaps = req.params;
  if (!_utils.isObject.call(void 0, requestedSnaps)) {
    return end(
      _rpcerrors.rpcErrors.invalidParams({
        message: '"params" must be an object.'
      })
    );
  }
  try {
    if (Object.keys(requestedSnaps).length === 0) {
      return end(
        _rpcerrors.rpcErrors.invalidParams({
          message: "Request must have at least one requested snap."
        })
      );
    }
    const requestedPermissions = {
      [_chunkFFHVA6PPjs.WALLET_SNAP_PERMISSION_KEY]: {
        caveats: [{ type: _snapsutils.SnapCaveatType.SnapIds, value: requestedSnaps }]
      }
    };
    const existingPermissions = await getPermissions();
    if (!existingPermissions) {
      const [, metadata] = await requestPermissions(requestedPermissions);
      res.result = metadata.data[_chunkFFHVA6PPjs.WALLET_SNAP_PERMISSION_KEY];
    } else if (hasRequestedSnaps(existingPermissions, requestedSnaps)) {
      res.result = await installSnaps(requestedSnaps);
    } else {
      const mergedPermissionsRequest = getSnapPermissionsRequest(
        existingPermissions,
        requestedPermissions
      );
      const [, metadata] = await requestPermissions(mergedPermissionsRequest);
      res.result = metadata.data[_chunkFFHVA6PPjs.WALLET_SNAP_PERMISSION_KEY];
    }
  } catch (error) {
    res.error = error;
  }
  return end();
}





exports.requestSnapsHandler = requestSnapsHandler; exports.hasRequestedSnaps = hasRequestedSnaps; exports.getSnapPermissionsRequest = getSnapPermissionsRequest;
//# sourceMappingURL=chunk-PS6OEQXL.js.map