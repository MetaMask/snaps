import {
  WALLET_SNAP_PERMISSION_KEY
} from "./chunk-VVBTXSID.mjs";

// src/permitted/requestSnaps.ts
import { rpcErrors } from "@metamask/rpc-errors";
import {
  SnapCaveatType,
  verifyRequestedSnapPermissions
} from "@metamask/snaps-utils";
import { hasProperty, isObject } from "@metamask/utils";
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
  const snapIdCaveat = existingPermissions[WALLET_SNAP_PERMISSION_KEY]?.caveats?.find(
    (caveat) => caveat.type === SnapCaveatType.SnapIds
  );
  const permittedSnaps = snapIdCaveat?.value;
  if (isObject(permittedSnaps)) {
    return Object.keys(requestedSnaps).every(
      (requestedSnap) => hasProperty(permittedSnaps, requestedSnap)
    );
  }
  return false;
}
function getSnapPermissionsRequest(existingPermissions, requestedPermissions) {
  verifyRequestedSnapPermissions(requestedPermissions);
  if (!existingPermissions[WALLET_SNAP_PERMISSION_KEY]) {
    return requestedPermissions;
  }
  const snapIdCaveat = existingPermissions[WALLET_SNAP_PERMISSION_KEY].caveats?.find(
    (caveat) => caveat.type === SnapCaveatType.SnapIds
  );
  const permittedSnaps = snapIdCaveat?.value ?? {};
  const requestedSnaps = requestedPermissions[WALLET_SNAP_PERMISSION_KEY].caveats[0].value;
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
  requestedPermissions[WALLET_SNAP_PERMISSION_KEY].caveats[0].value = mergedCaveatValue;
  return requestedPermissions;
}
async function requestSnapsImplementation(req, res, _next, end, { installSnaps, requestPermissions, getPermissions }) {
  const requestedSnaps = req.params;
  if (!isObject(requestedSnaps)) {
    return end(
      rpcErrors.invalidParams({
        message: '"params" must be an object.'
      })
    );
  }
  try {
    if (Object.keys(requestedSnaps).length === 0) {
      return end(
        rpcErrors.invalidParams({
          message: "Request must have at least one requested snap."
        })
      );
    }
    const requestedPermissions = {
      [WALLET_SNAP_PERMISSION_KEY]: {
        caveats: [{ type: SnapCaveatType.SnapIds, value: requestedSnaps }]
      }
    };
    const existingPermissions = await getPermissions();
    if (!existingPermissions) {
      const [, metadata] = await requestPermissions(requestedPermissions);
      res.result = metadata.data[WALLET_SNAP_PERMISSION_KEY];
    } else if (hasRequestedSnaps(existingPermissions, requestedSnaps)) {
      res.result = await installSnaps(requestedSnaps);
    } else {
      const mergedPermissionsRequest = getSnapPermissionsRequest(
        existingPermissions,
        requestedPermissions
      );
      const [, metadata] = await requestPermissions(mergedPermissionsRequest);
      res.result = metadata.data[WALLET_SNAP_PERMISSION_KEY];
    }
  } catch (error) {
    res.error = error;
  }
  return end();
}

export {
  requestSnapsHandler,
  hasRequestedSnaps,
  getSnapPermissionsRequest
};
//# sourceMappingURL=chunk-MXPVC2XP.mjs.map