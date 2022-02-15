const { promises: fs } = require('fs');
const path = require('path');

const WASM_PATH = path.join(__dirname, '../program.wasm');

main();

async function main() {
  const wasmBin = await fs.readFile(WASM_PATH);
  console.log(wasmBin.toString('hex'));
}
