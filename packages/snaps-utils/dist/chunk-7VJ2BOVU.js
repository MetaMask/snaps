"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/json.ts
var _utils = require('@metamask/utils');
function parseJson(json) {
  return _utils.getSafeJson.call(void 0, JSON.parse(json));
}
function getJsonSizeUnsafe(value) {
  const json = JSON.stringify(value);
  return new TextEncoder().encode(json).byteLength;
}




exports.parseJson = parseJson; exports.getJsonSizeUnsafe = getJsonSizeUnsafe;
//# sourceMappingURL=chunk-7VJ2BOVU.js.map