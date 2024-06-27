import type { LoaderDefinitionFunction } from 'webpack';
/**
 * Get the imports code for the WASM module. This code imports each of the
 * imports from the WASM module.
 *
 * @param importMap - The import map for the WASM module.
 * @returns The imports code for the WASM module.
 */
export declare function getImports(importMap: Record<string, string[]>): string;
/**
 * Get the imports code to use in `WebAssembly.Instance`. This code adds each of
 * the imports to the `imports` object.
 *
 * @param importMap - The import map for the WASM module.
 * @returns The imports code for the WASM module.
 */
export declare function getModuleImports(importMap: Record<string, string[]>): string;
/**
 * Get the exports code for the WASM module. This code exports each of the
 * exports from the WASM module as a variable. This function assumes that the
 * exports are available in a variable named `exports`.
 *
 * @param descriptors - The export descriptors from the WASM module.
 * @returns The exports code for the WASM module.
 */
export declare function getExports(descriptors: WebAssembly.ModuleExportDescriptor[]): string;
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
declare const loader: LoaderDefinitionFunction;
export default loader;
export declare const raw = true;
