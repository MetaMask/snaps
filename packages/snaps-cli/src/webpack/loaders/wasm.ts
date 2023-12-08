import { assert } from '@metamask/utils';

/**
 * A Webpack loader that synchronously loads the WASM module. This makes it
 * possible to import the WASM module directly.
 *
 * @param source - The WASM module as a string.
 * @returns A string that exports the WASM module as a `Uint8Array`.
 * @example
 * ```ts
 * import wasm from './program.wasm';
 *
 * // Do something with the WASM module...
 * ```
 */
export default function loader(source: unknown) {
  assert(source instanceof Uint8Array, 'Expected source to be a Uint8Array.');

  return `
    const bytes = new Uint8Array(${JSON.stringify(Array.from(source))});
    const module = new WebAssembly.Module(bytes);
    const instance = new WebAssembly.Instance(module, {});

    export default instance.exports;
  `;
}

// By setting `raw` to `true`, we are telling Webpack to provide the source as a
// `Uint8Array` instead of converting it to a string. This allows us to avoid
// having to convert the source back to a `Uint8Array` in the loader.
export const raw = true;
