"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/structs.ts
var _superstruct = require('@metamask/superstruct');
var _path = require('path');
function file() {
  return _superstruct.coerce.call(void 0, _superstruct.string.call(void 0, ), _superstruct.string.call(void 0, ), (value) => {
    return _path.resolve.call(void 0, process.cwd(), value);
  });
}



exports.file = file;
//# sourceMappingURL=chunk-NGS23BTR.js.map