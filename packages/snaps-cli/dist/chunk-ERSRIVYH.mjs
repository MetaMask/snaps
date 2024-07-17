// src/webpack/loaders/wasm.ts
import { assert } from "@metamask/utils";
import { dirname, resolve } from "path";
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
  assert(source instanceof Uint8Array, "Expected source to be a Uint8Array.");
  const bytes = new Uint8Array(source);
  const wasmModule = await WebAssembly.compile(bytes);
  const exports = WebAssembly.Module.exports(wasmModule);
  const imports = WebAssembly.Module.imports(wasmModule).reduce((target, descriptor) => {
    var _a;
    target[_a = descriptor.module] ?? (target[_a] = []);
    target[descriptor.module].push(descriptor.name);
    return target;
  }, {});
  const path = dirname(this.resourcePath);
  for (const name of Object.keys(imports)) {
    this.addDependency(resolve(path, name));
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

export {
  getImports,
  getModuleImports,
  getExports,
  wasm_default,
  raw
};
//# sourceMappingURL=chunk-ERSRIVYH.mjs.map