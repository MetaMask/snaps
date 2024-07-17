"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/permitted/getClientStatus.ts
var hookNames = {
  getIsLocked: true
};
var getClientStatusHandler = {
  methodNames: ["snap_getClientStatus"],
  implementation: getClientStatusImplementation,
  hookNames
};
async function getClientStatusImplementation(_request, response, _next, end, { getIsLocked }) {
  response.result = { locked: getIsLocked() };
  return end();
}



exports.getClientStatusHandler = getClientStatusHandler;
//# sourceMappingURL=chunk-3UAWEHMF.js.map