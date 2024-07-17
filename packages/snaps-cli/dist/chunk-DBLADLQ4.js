"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/utils/path.ts
var _path = require('path');
function getRelativePath(absolutePath, cwd = process.cwd()) {
  return _path.relative.call(void 0, cwd, absolutePath);
}



exports.getRelativePath = getRelativePath;
//# sourceMappingURL=chunk-DBLADLQ4.js.map