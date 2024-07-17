"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkOBN2WDFUjs = require('./chunk-OBN2WDFU.js');


var _chunk5WKQI22Sjs = require('./chunk-5WKQI22S.js');

// src/auxiliary-files.ts
var _snapssdk = require('@metamask/snaps-sdk');
var _utils = require('@metamask/utils');
async function encodeAuxiliaryFile(value, encoding) {
  if (encoding === _snapssdk.AuxiliaryFileEncoding.Base64) {
    return value;
  }
  const decoded = await _chunkOBN2WDFUjs.decodeBase64.call(void 0, value);
  if (encoding === _snapssdk.AuxiliaryFileEncoding.Utf8) {
    return _utils.bytesToString.call(void 0, decoded);
  }
  return _utils.bytesToHex.call(void 0, decoded);
}
function validateAuxiliaryFiles(files) {
  for (const file of files) {
    _utils.assert.call(void 0, 
      file.size < _chunk5WKQI22Sjs.MAX_FILE_SIZE,
      "Static files required by the Snap must be smaller than 64 MB."
    );
  }
}




exports.encodeAuxiliaryFile = encodeAuxiliaryFile; exports.validateAuxiliaryFiles = validateAuxiliaryFiles;
//# sourceMappingURL=chunk-PLNIERDY.js.map