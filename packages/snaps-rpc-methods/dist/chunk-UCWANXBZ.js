"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/permitted/resolveInterface.ts
var _rpcerrors = require('@metamask/rpc-errors');
var _superstruct = require('@metamask/superstruct');
var _utils = require('@metamask/utils');
var hookNames = {
  resolveInterface: true
};
var resolveInterfaceHandler = {
  methodNames: ["snap_resolveInterface"],
  implementation: getResolveInterfaceImplementation,
  hookNames
};
var ResolveInterfaceParametersStruct = _superstruct.object.call(void 0, {
  id: _superstruct.string.call(void 0, ),
  value: _utils.JsonStruct
});
async function getResolveInterfaceImplementation(req, res, _next, end, { resolveInterface }) {
  const { params } = req;
  try {
    const validatedParams = getValidatedParams(params);
    const { id, value } = validatedParams;
    await resolveInterface(id, value);
    res.result = null;
  } catch (error) {
    return end(error);
  }
  return end();
}
function getValidatedParams(params) {
  try {
    return _superstruct.create.call(void 0, params, ResolveInterfaceParametersStruct);
  } catch (error) {
    if (error instanceof _superstruct.StructError) {
      throw _rpcerrors.rpcErrors.invalidParams({
        message: `Invalid params: ${error.message}.`
      });
    }
    throw _rpcerrors.rpcErrors.internal();
  }
}



exports.resolveInterfaceHandler = resolveInterfaceHandler;
//# sourceMappingURL=chunk-UCWANXBZ.js.map