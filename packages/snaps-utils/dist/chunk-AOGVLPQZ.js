"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/path.ts
var _utils = require('@metamask/utils');
function normalizeRelative(path) {
  _utils.assert.call(void 0, !path.startsWith("/"));
  _utils.assert.call(void 0, 
    path.search(/:|\/\//u) === -1,
    `Path "${path}" potentially an URI instead of local relative`
  );
  if (path.startsWith("./")) {
    return path.slice(2);
  }
  return path;
}



exports.normalizeRelative = normalizeRelative;
//# sourceMappingURL=chunk-AOGVLPQZ.js.map