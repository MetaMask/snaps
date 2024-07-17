"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/utils/cli.ts
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var CONFIG_FILE = "snap.config.js";
var TS_CONFIG_FILE = "snap.config.ts";
var pathArguments = /* @__PURE__ */ new Set([
  "src",
  "s",
  "dist",
  "d",
  "bundle",
  "b",
  "root",
  "r"
]);
function sanitizeInputs(argv) {
  Object.keys(argv).forEach((key) => {
    if (typeof argv[key] === "string") {
      if (argv[key] === "./") {
        argv[key] = ".";
      }
      if (pathArguments.has(key)) {
        argv[key] = _path2.default.normalize(argv[key]);
      }
    }
  });
}
function trimPathString(pathString) {
  return pathString.replace(/^[./]+|[./]+$/gu, "");
}






exports.CONFIG_FILE = CONFIG_FILE; exports.TS_CONFIG_FILE = TS_CONFIG_FILE; exports.sanitizeInputs = sanitizeInputs; exports.trimPathString = trimPathString;
//# sourceMappingURL=chunk-C46KEPAC.js.map