"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/permitted/getInterfaceState.ts
var _rpcerrors = require('@metamask/rpc-errors');
var _superstruct = require('@metamask/superstruct');
var hookNames = {
  getInterfaceState: true
};
var getInterfaceStateHandler = {
  methodNames: ["snap_getInterfaceState"],
  implementation: getGetInterfaceStateImplementation,
  hookNames
};
var GetInterfaceStateParametersStruct = _superstruct.object.call(void 0, {
  id: _superstruct.string.call(void 0, )
});
function getGetInterfaceStateImplementation(req, res, _next, end, { getInterfaceState }) {
  const { params } = req;
  try {
    const validatedParams = getValidatedParams(params);
    const { id } = validatedParams;
    res.result = getInterfaceState(id);
  } catch (error) {
    return end(error);
  }
  return end();
}
function getValidatedParams(params) {
  try {
    return _superstruct.create.call(void 0, params, GetInterfaceStateParametersStruct);
  } catch (error) {
    if (error instanceof _superstruct.StructError) {
      throw _rpcerrors.rpcErrors.invalidParams({
        message: `Invalid params: ${error.message}.`
      });
    }
    throw _rpcerrors.rpcErrors.internal();
  }
}



exports.getInterfaceStateHandler = getInterfaceStateHandler;
//# sourceMappingURL=chunk-7CV677MM.js.map