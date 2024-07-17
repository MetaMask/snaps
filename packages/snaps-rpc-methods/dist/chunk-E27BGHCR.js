"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkDLVPMPRZjs = require('./chunk-DLVPMPRZ.js');

// src/permitted/invokeKeyring.ts
var _rpcerrors = require('@metamask/rpc-errors');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var hookNames = {
  hasPermission: true,
  handleSnapRpcRequest: true,
  getSnap: true,
  getAllowedKeyringMethods: true
};
var invokeKeyringHandler = {
  methodNames: ["wallet_invokeKeyring"],
  implementation: invokeKeyringImplementation,
  hookNames
};
async function invokeKeyringImplementation(req, res, _next, end, {
  handleSnapRpcRequest,
  hasPermission,
  getSnap,
  getAllowedKeyringMethods
}) {
  let params;
  try {
    params = _chunkDLVPMPRZjs.getValidatedParams.call(void 0, req.params);
  } catch (error) {
    return end(error);
  }
  const { origin } = req;
  const { snapId, request } = params;
  if (!origin || !hasPermission(_snapsutils.WALLET_SNAP_PERMISSION_KEY)) {
    return end(
      _rpcerrors.rpcErrors.invalidRequest({
        message: `The snap "${snapId}" is not connected to "${origin}". Please connect before invoking the snap.`
      })
    );
  }
  if (!getSnap(snapId)) {
    return end(
      _rpcerrors.rpcErrors.invalidRequest({
        message: `The snap "${snapId}" is not installed. Please install it first, before invoking the snap.`
      })
    );
  }
  if (!_utils.hasProperty.call(void 0, request, "method") || typeof request.method !== "string") {
    return end(
      _rpcerrors.rpcErrors.invalidRequest({
        message: "The request must have a method."
      })
    );
  }
  const allowedMethods = getAllowedKeyringMethods();
  if (!allowedMethods.includes(request.method)) {
    return end(
      _rpcerrors.rpcErrors.invalidRequest({
        message: `The origin "${origin}" is not allowed to invoke the method "${request.method}".`
      })
    );
  }
  try {
    res.result = await handleSnapRpcRequest({
      snapId,
      request,
      handler: _snapsutils.HandlerType.OnKeyringRequest
    });
  } catch (error) {
    return end(error);
  }
  return end();
}



exports.invokeKeyringHandler = invokeKeyringHandler;
//# sourceMappingURL=chunk-E27BGHCR.js.map