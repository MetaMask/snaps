"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkIHQPAJ2Bjs = require('./chunk-IHQPAJ2B.js');

// src/auxiliary-files.ts
var _snapssdk = require('@metamask/snaps-sdk');
var _utils = require('@metamask/utils');
async function encodeAuxiliaryFile(value, encoding) {
  if (encoding === _snapssdk.AuxiliaryFileEncoding.Base64) {
    return value;
  }
  const decoded = await _chunkIHQPAJ2Bjs.decodeBase64.call(void 0, value);
  if (encoding === _snapssdk.AuxiliaryFileEncoding.Utf8) {
    return _utils.bytesToString.call(void 0, decoded);
  }
  return _utils.bytesToHex.call(void 0, decoded);
}



exports.encodeAuxiliaryFile = encodeAuxiliaryFile;
//# sourceMappingURL=chunk-IXBJNVHK.js.map