"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/webpack/loaders/wasm.ts
var _utils = require('@metamask/utils');
var _path = require('path');
function getImports(importMap) {
  return Object.entries(importMap).map(
    ([moduleName, exportNames]) => `import { ${exportNames.join(", ")} } from ${JSON.stringify(
      moduleName
    )};`
  ).join("\n");
}
function getModuleImports(importMap) {
  return Object.entries(importMap).map(
    ([moduleName, exportNames]) => `${JSON.stringify(moduleName)}: { ${exportNames.join(", ")} },`
  ).join("\n");
}
function getExports(descriptors) {
  return descriptors.map((descriptor) => {
    if (descriptor.name === "default") {
      return `export default exports[${JSON.stringify(descriptor.name)}];`;
    }
    return `export const ${descriptor.name} = exports[${JSON.stringify(
      descriptor.name
    )}];`;
  }).join("\n");
}
var loader = async function loader2(source) {
  _utils.assert.call(void 0, source instanceof Uint8Array, "Expected source to be a Uint8Array.");
  const bytes = new Uint8Array(source);
  const wasmModule = await WebAssembly.compile(bytes);
  const exports = WebAssembly.Module.exports(wasmModule);
  const imports = WebAssembly.Module.imports(wasmModule).reduce((target, descriptor) => {
    var _a;
    target[_a = descriptor.module] ?? (target[_a] = []);
    target[descriptor.module].push(descriptor.name);
    return target;
  }, {});
  const path = _path.dirname.call(void 0, this.resourcePath);
  for (const name of Object.keys(imports)) {
    this.addDependency(_path.resolve.call(void 0, path, name));
  }
  return `
    ${getImports(imports)}

    const bytes = new Uint8Array(${JSON.stringify(Array.from(source))});
    const module = new WebAssembly.Module(bytes);
    const instance = new WebAssembly.Instance(module, {
      ${getModuleImports(imports)}
    });

    const exports = instance.exports;
    ${getExports(exports)}
  `;
};
var wasm_default = loader;
var raw = true;







exports.getImports = getImports; exports.getModuleImports = getModuleImports; exports.getExports = getExports; exports.wasm_default = wasm_default; exports.raw = raw;
//# sourceMappingURL=chunk-YQ2E7NEA.js.map