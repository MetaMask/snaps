"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/webpack/loaders/function.ts
var loader = function(content) {
  const { fn } = this.getOptions();
  return fn.bind(this)(content);
};
var function_default = loader;
function getFunctionLoader(fn, options) {
  return {
    // We use `__filename` as the loader, so Webpack will execute the loader in
    // this file, with the actual function in the options.
    loader: __filename,
    options: {
      fn,
      ...options
    }
  };
}
if (typeof module !== "undefined" && process?.env?.NODE_ENV !== "test") {
  module.exports = loader;
  module.exports.getFunctionLoader = getFunctionLoader;
  module.exports.raw = true;
}




exports.function_default = function_default; exports.getFunctionLoader = getFunctionLoader;
//# sourceMappingURL=chunk-QHCKVO3P.js.map