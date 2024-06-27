"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/permitted/invokeSnapSugar.ts
var _rpcerrors = require('@metamask/rpc-errors');
var _utils = require('@metamask/utils');
var invokeSnapSugarHandler = {
  methodNames: ["wallet_invokeSnap"],
  implementation: invokeSnapSugar,
  hookNames: {
    invokeSnap: true
  }
};
async function invokeSnapSugar(req, res, _next, end, { invokeSnap }) {
  try {
    const params = getValidatedParams(req.params);
    res.result = await invokeSnap(params);
  } catch (error) {
    return end(error);
  }
  return end();
}
function getValidatedParams(params) {
  if (!_utils.isObject.call(void 0, params)) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Expected params to be a single object."
    });
  }
  const { snapId, request } = params;
  if (!snapId || typeof snapId !== "string" || snapId === "") {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Must specify a valid snap ID."
    });
  }
  if (!_utils.isObject.call(void 0, request)) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Expected request to be a single object."
    });
  }
  return params;
}





exports.invokeSnapSugarHandler = invokeSnapSugarHandler; exports.invokeSnapSugar = invokeSnapSugar; exports.getValidatedParams = getValidatedParams;
//# sourceMappingURL=chunk-DLVPMPRZ.js.map