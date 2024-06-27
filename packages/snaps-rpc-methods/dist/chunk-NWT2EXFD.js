"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/permitted/getSnaps.ts
var hookNames = {
  getSnaps: true
};
var getSnapsHandler = {
  methodNames: ["wallet_getSnaps"],
  implementation: getSnapsImplementation,
  hookNames
};
async function getSnapsImplementation(_req, res, _next, end, { getSnaps }) {
  res.result = await getSnaps();
  return end();
}



exports.getSnapsHandler = getSnapsHandler;
//# sourceMappingURL=chunk-NWT2EXFD.js.map