/**
 * Builds a cross-platform WASM only consisting of functions present both in the browser and Node.js
 *
 * @returns WebAssembly without compileStreaming and instantiateStreaming
 */
export const createWASM = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { compileStreaming, instantiateStreaming, ...wasm } = WebAssembly;
  return wasm;
};
