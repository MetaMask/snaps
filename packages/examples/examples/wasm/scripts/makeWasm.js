const { promises: fs } = require('fs');
const path = require('path');

const WASM_PATH = path.join(__dirname, '../build/program.wasm');
const OUT_PATH = path.join(__dirname, '../build/index.js');

main();

// @todo Use bindings instead of this
async function main() {
  const wasmBin = await fs.readFile(WASM_PATH);
  const hex = wasmBin.toString('hex');
  const code = `export const PROGRAM_WASM_HEX = '${hex}'`;
  await fs.writeFile(OUT_PATH, code);
}
