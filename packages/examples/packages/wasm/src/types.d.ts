/**
 * This file is used to declare types for assets that are not natively
 * supported by TypeScript. This works because we are using Webpack to bundle
 * these assets.
 *
 * For example, WebAssembly modules are not natively supported by TypeScript,
 * so we need to declare a type for them here. This allows us to import them
 * in our code, and have TypeScript understand that they are valid modules.
 */
// eslint-disable-next-line import/unambiguous
declare module '*.wasm' {
  const module: Uint8Array;
  export default module;
}
