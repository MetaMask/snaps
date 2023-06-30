export async function instantiate(module, imports = {}) {
  const { exports } = await WebAssembly.instantiate(module, imports);
  return exports;
}
