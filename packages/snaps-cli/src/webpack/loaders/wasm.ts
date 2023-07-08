import { assert, stringToBytes } from '@metamask/utils';

/**
 * A Webpack loader that inlines the WASM module as a `Uint8Array`. This makes
 * it possible to import the WASM module directly, and use it with the
 * `WebAssembly.instantiate` function.
 *
 * This is useful, because snaps are not allowed to import assets from outside
 * of their package. This loader allows you to inline the WASM module as a
 * `Uint8Array`, which can then be passed to `WebAssembly.instantiate`.
 *
 * @param source - The WASM module as a string.
 * @returns A string that exports the WASM module as a `Uint8Array`.
 * @example
 * ```ts
 * import wasm from './program.wasm';
 *
 * const { instance } = await WebAssembly.instantiate(wasm, {});
 * // Do something with the WASM module...
 * ```
 */
export default function loader(source: unknown) {
  assert(typeof source === 'string', 'Expected source to be a string.');

  const bytes = stringToBytes(source);
  return `export default new Uint8Array(${JSON.stringify(Array.from(bytes))});`;
}
