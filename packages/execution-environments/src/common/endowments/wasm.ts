type WebAssemblyKeys = keyof typeof WebAssembly;
type WebAssemblyValues = typeof WebAssembly[WebAssemblyKeys];

export const excludedProperties: readonly (string | symbol)[] = [
  'compileStreaming',
  'instantiateStreaming',
];

/**
 * Builds a cross-platform `WebAssembly` only consisting of functions present
 * both in the browser and Node.js.
 *
 * @returns An object with a `WebAssembly` property without `compileStreaming`
 * and `instantiateStreaming`.
 */
const createWasm = () => {
  const wasm: Record<WebAssemblyKeys, WebAssemblyValues> = Object.create(null);
  (Reflect.ownKeys(WebAssembly) as WebAssemblyKeys[])
    .filter((key) => !excludedProperties.includes(key))
    .forEach((key) => {
      Object.defineProperty(wasm, key, {
        ...Reflect.getOwnPropertyDescriptor(WebAssembly, key),
        value: WebAssembly[key],
      });
    });

  return { WebAssembly: wasm } as const;
};

const endowmentModule = {
  names: ['WebAssembly'] as const,
  factory: createWasm,
};
export default endowmentModule;
