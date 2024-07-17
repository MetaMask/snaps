"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/permitted/updateInterface.ts
var _rpcerrors = require('@metamask/rpc-errors');
var _snapssdk = require('@metamask/snaps-sdk');
var _superstruct = require('@metamask/superstruct');
var hookNames = {
  updateInterface: true
};
var updateInterfaceHandler = {
  methodNames: ["snap_updateInterface"],
  implementation: getUpdateInterfaceImplementation,
  hookNames
};
var UpdateInterfaceParametersStruct = _superstruct.object.call(void 0, {
  id: _superstruct.string.call(void 0, ),
  ui: _snapssdk.ComponentOrElementStruct
});
async function getUpdateInterfaceImplementation(req, res, _next, end, { updateInterface }) {
  const { params } = req;
  try {
    const validatedParams = getValidatedParams(params);
    const { id, ui } = validatedParams;
    await updateInterface(id, ui);
    res.result = null;
  } catch (error) {
    return end(error);
  }
  return end();
}
function getValidatedParams(params) {
  try {
    return _superstruct.create.call(void 0, params, UpdateInterfaceParametersStruct);
  } catch (error) {
    if (error instanceof _superstruct.StructError) {
      throw _rpcerrors.rpcErrors.invalidParams({
        message: `Invalid params: ${error.message}.`
      });
    }
    throw _rpcerrors.rpcErrors.internal();
  }
}



exports.updateInterfaceHandler = updateInterfaceHandler;
//# sourceMappingURL=chunk-U6TJQLNV.js.map