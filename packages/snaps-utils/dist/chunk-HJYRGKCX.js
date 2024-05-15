"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkNUCLSR2Gjs = require('./chunk-NUCLSR2G.js');

// src/virtual-file/VirtualFile.ts
var _utils = require('@metamask/utils');
var _base = require('@scure/base');
var VirtualFile = class _VirtualFile {
  constructor(value) {
    let options;
    if (typeof value === "string" || value instanceof Uint8Array) {
      options = { value };
    } else {
      options = value;
    }
    this.value = options?.value ?? "";
    this.result = options?.result ?? void 0;
    this.data = options?.data ?? {};
    this.path = options?.path ?? "/";
  }
  toString(encoding) {
    if (typeof this.value === "string") {
      _utils.assert.call(void 0, encoding === void 0, "Tried to encode string.");
      return this.value;
    } else if (this.value instanceof Uint8Array && encoding === "hex") {
      return _utils.bytesToHex.call(void 0, this.value);
    } else if (this.value instanceof Uint8Array && encoding === "base64") {
      return _base.base64.encode(this.value);
    }
    const decoder = new TextDecoder(encoding);
    return decoder.decode(this.value);
  }
  clone() {
    const vfile = new _VirtualFile();
    if (typeof this.value === "string") {
      vfile.value = this.value;
    } else {
      vfile.value = this.value.slice(0);
    }
    vfile.result = _chunkNUCLSR2Gjs.deepClone.call(void 0, this.result);
    vfile.data = _chunkNUCLSR2Gjs.deepClone.call(void 0, this.data);
    vfile.path = this.path;
    return vfile;
  }
};



exports.VirtualFile = VirtualFile;
//# sourceMappingURL=chunk-HJYRGKCX.js.map