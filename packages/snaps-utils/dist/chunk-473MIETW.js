"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkHJYRGKCXjs = require('./chunk-HJYRGKCX.js');

// src/bytes.ts
var _utils = require('@metamask/utils');
function getBytes(bytes) {
  const unwrapped = bytes instanceof _chunkHJYRGKCXjs.VirtualFile ? bytes.value : bytes;
  if (typeof unwrapped === "string") {
    return _utils.stringToBytes.call(void 0, unwrapped);
  }
  return unwrapped;
}



exports.getBytes = getBytes;
//# sourceMappingURL=chunk-473MIETW.js.map