"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkDEQUNIMEjs = require('./chunk-DEQUNIME.js');

// src/bytes.ts
var _utils = require('@metamask/utils');
function getBytes(bytes) {
  const unwrapped = bytes instanceof _chunkDEQUNIMEjs.VirtualFile ? bytes.value : bytes;
  if (typeof unwrapped === "string") {
    return _utils.stringToBytes.call(void 0, unwrapped);
  }
  return unwrapped;
}



exports.getBytes = getBytes;
//# sourceMappingURL=chunk-UAINMOUU.js.map