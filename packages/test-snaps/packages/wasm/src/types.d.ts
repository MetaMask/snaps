// eslint-disable-next-line import/unambiguous
declare module '*.wasm' {
  const module: WebAssembly.Module;
  export default module;
}
