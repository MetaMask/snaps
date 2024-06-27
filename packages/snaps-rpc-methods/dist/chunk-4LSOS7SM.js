"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/permitted/getAllSnaps.ts
var _rpcerrors = require('@metamask/rpc-errors');
var hookNames = {
  getAllSnaps: true
};
var getAllSnapsHandler = {
  methodNames: ["wallet_getAllSnaps"],
  implementation: getAllSnapsImplementation,
  hookNames
};
async function getAllSnapsImplementation(request, response, _next, end, { getAllSnaps }) {
  const { origin } = request;
  if (origin !== "https://snaps.metamask.io") {
    return end(_rpcerrors.rpcErrors.methodNotFound());
  }
  response.result = await getAllSnaps();
  return end();
}



exports.getAllSnapsHandler = getAllSnapsHandler;
//# sourceMappingURL=chunk-4LSOS7SM.js.map