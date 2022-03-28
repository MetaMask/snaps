const { promises: fs } = require('fs');
const path = require('path');

const WASM_PATH = path.join(__dirname, '../assembly/program.wasm');

main();

// @todo Use bindings instead of this
async function main() {
  const wasmBin = await fs.readFile(WASM_PATH);
  console.log(wasmBin.toString('hex'));
}
