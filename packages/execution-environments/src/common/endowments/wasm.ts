/**
 * Builds a cross-platform `WebAssembly` only consisting of functions present
 * both in the browser and Node.js.
 *
 * @returns An object with a `WebAssembly` property without `compileStreaming`
 * and `instantiateStreaming`.
 */
const createWasm = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { compileStreaming, instantiateStreaming, ...wasm } = WebAssembly;
  return { WebAssembly: wasm } as const;
};

const endowmentModule = {
  names: ['WebAssembly'] as const,
  factory: createWasm,
};
export default endowmentModule;
