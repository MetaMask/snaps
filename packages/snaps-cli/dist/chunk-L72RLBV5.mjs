// src/utils/cli.ts
import path from "path";
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
        argv[key] = path.normalize(argv[key]);
      }
    }
  });
}
function trimPathString(pathString) {
  return pathString.replace(/^[./]+|[./]+$/gu, "");
}

export {
  CONFIG_FILE,
  TS_CONFIG_FILE,
  sanitizeInputs,
  trimPathString
};
//# sourceMappingURL=chunk-L72RLBV5.mjs.map