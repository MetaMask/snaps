const { readFileSync } = require('fs');
const { ethErrors } = require('eth-rpc-errors');

// Ref:
// - https://developer.mozilla.org/en-US/docs/WebAssembly/Using_the_JavaScript_API
// - https://github.com/mdn/webassembly-examples/tree/06556204f687c00a5d9d3ab55805204cbb711d0c/js-api-examples

let wasm;

const initializeWasm = async () => {
  try {
    const wasmBuffer = arrayBufferFromHex(
      readFileSync('../build/program.wasm', 'utf8').toString('hex'),
    );
    wasm = await WebAssembly.instantiate(wasmBuffer);
  } catch (error) {
    console.error('Failed to initialize WebAssembly module.', error);
    throw error;
  }
};

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  if (!wasm) {
    await initializeWasm();
  }

  if (wasm.instance.exports[requestObject.method]) {
    return wasm.instance.exports[requestObject.method](...requestObject.params);
  }
  throw ethErrors.rpc.methodNotFound({ data: { request: requestObject } });
});

// kudos: https://stackoverflow.com/a/71083193
function arrayBufferFromHex(hexString) {
  return new Uint8Array(
    hexString
      .replace(/^0x/iu, '')
      .match(/../gu)
      .map((byte) => parseInt(byte, 16)),
  ).buffer;
}
