/* eslint-disable no-restricted-globals */

import { assert } from '@metamask/utils';
import { dirname, resolve } from 'path';
import type { LoaderDefinitionFunction } from 'webpack';

/**
 * Get the imports code for the WASM module. This code imports each of the
 * imports from the WASM module.
 *
 * @param importMap - The import map for the WASM module.
 * @returns The imports code for the WASM module.
 */
export function getImports(importMap: Record<string, string[]>) {
  return Object.entries(importMap)
    .map(
      ([moduleName, exportNames]) =>
        `import { ${exportNames.join(', ')} } from ${JSON.stringify(
          moduleName,
        )};`,
    )
    .join('\n');
}

/**
 * Get the imports code to use in `WebAssembly.Instance`. This code adds each of
 * the imports to the `imports` object.
 *
 * @param importMap - The import map for the WASM module.
 * @returns The imports code for the WASM module.
 */
export function getModuleImports(importMap: Record<string, string[]>) {
  return Object.entries(importMap)
    .map(
      ([moduleName, exportNames]) =>
        `${JSON.stringify(moduleName)}: { ${exportNames.join(', ')} },`,
    )
    .join('\n');
}

/**
 * Get the exports code for the WASM module. This code exports each of the
 * exports from the WASM module as a variable. This function assumes that the
 * exports are available in a variable named `exports`.
 *
 * @param descriptors - The export descriptors from the WASM module.
 * @returns The exports code for the WASM module.
 */
export function getExports(descriptors: WebAssembly.ModuleExportDescriptor[]) {
  return descriptors
    .map((descriptor) => {
      if (descriptor.name === 'default') {
        return `export default exports[${JSON.stringify(descriptor.name)}];`;
      }

      return `export const ${descriptor.name} = exports[${JSON.stringify(
        descriptor.name,
      )}];`;
    })
    .join('\n');
}

/**
 * A Webpack loader that synchronously loads the WASM module. This makes it
 * possible to import the WASM module directly.
 *
 * @param source - The WASM module as `Uint8Array`.
 * @returns The WASM module as a JavaScript string.
 * @example
 * ```ts
 * import * as wasm from './program.wasm';
 *
 * // Do something with the WASM module...
 * ```
 */
// Note: This function needs to be defined like this, so that Webpack can bind
// `this` to the loader context, and TypeScript can infer the type of `this`.
const loader: LoaderDefinitionFunction = async function loader(
  source: unknown,
) {
  assert(source instanceof Uint8Array, 'Expected source to be a Uint8Array.');

  const bytes = new Uint8Array(source);
  const wasmModule = await WebAssembly.compile(bytes);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const exports = WebAssembly.Module.exports(wasmModule);
  const imports = WebAssembly.Module.imports(wasmModule).reduce<
    Record<string, string[]>
  >((target, descriptor) => {
    target[descriptor.module] ??= [];
    target[descriptor.module].push(descriptor.name);

    return target;
  }, {});

  // Add the WASM import as a dependency so that Webpack will watch it for
  // changes.
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

export default loader;

// By setting `raw` to `true`, we are telling Webpack to provide the source as a
// `Uint8Array` instead of converting it to a string. This allows us to avoid
// having to convert the source back to a `Uint8Array` in the loader.
export const raw = true;
