"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/permitted/getFile.ts
var _rpcerrors = require('@metamask/rpc-errors');
var _snapssdk = require('@metamask/snaps-sdk');
var _superstruct = require('@metamask/superstruct');
var _utils = require('@metamask/utils');
var GetFileArgsStruct = _superstruct.object.call(void 0, {
  path: _superstruct.string.call(void 0, ),
  encoding: _superstruct.optional.call(void 0, 
    _superstruct.union.call(void 0, [
      _snapssdk.enumValue.call(void 0, _snapssdk.AuxiliaryFileEncoding.Base64),
      _snapssdk.enumValue.call(void 0, _snapssdk.AuxiliaryFileEncoding.Hex),
      _snapssdk.enumValue.call(void 0, _snapssdk.AuxiliaryFileEncoding.Utf8)
    ])
  )
});
var hookNames = {
  getSnapFile: true
};
var getFileHandler = {
  methodNames: ["snap_getFile"],
  implementation,
  hookNames
};
async function implementation(req, res, _next, end, { getSnapFile }) {
  const { params } = req;
  _utils.assertStruct.call(void 0, 
    params,
    GetFileArgsStruct,
    'Invalid "snap_getFile" parameters',
    _rpcerrors.rpcErrors.invalidParams
  );
  try {
    res.result = await getSnapFile(
      params.path,
      params.encoding ?? _snapssdk.AuxiliaryFileEncoding.Base64
    );
  } catch (error) {
    return end(error);
  }
  return end();
}




exports.GetFileArgsStruct = GetFileArgsStruct; exports.getFileHandler = getFileHandler;
//# sourceMappingURL=chunk-EOXTZF5U.js.map