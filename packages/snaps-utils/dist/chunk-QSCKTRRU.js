"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkHJYRGKCXjs = require('./chunk-HJYRGKCX.js');

// src/virtual-file/toVirtualFile.ts
var _fs = require('fs');
async function readVirtualFile(path, encoding = null) {
  return new (0, _chunkHJYRGKCXjs.VirtualFile)({
    path,
    value: await _fs.promises.readFile(path, { encoding })
  });
}
async function writeVirtualFile(vfile, options) {
  return _fs.promises.writeFile(vfile.path, vfile.value, options);
}




exports.readVirtualFile = readVirtualFile; exports.writeVirtualFile = writeVirtualFile;
//# sourceMappingURL=chunk-QSCKTRRU.js.map