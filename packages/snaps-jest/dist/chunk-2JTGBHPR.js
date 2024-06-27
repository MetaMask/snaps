"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/internals/environment.ts
var _utils = require('@metamask/utils');
function getEnvironment() {
  _utils.assert.call(void 0, 
    typeof snapsEnvironment !== "undefined",
    "Snaps environment not found. Make sure you have configured the environment correctly."
  );
  return snapsEnvironment;
}



exports.getEnvironment = getEnvironment;
//# sourceMappingURL=chunk-2JTGBHPR.js.map